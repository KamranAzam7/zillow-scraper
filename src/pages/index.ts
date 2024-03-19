import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";
import { config } from "../environment/config";
import { selectors } from "./selectors";
import { CONSTANTS, ListingData } from "./constants";

async function scrapZillow(browser: puppeteer.Browser): Promise<void> {
  const page = await browser.newPage();
  await page.goto(config.endpoint);

  await page.waitForSelector(selectors.searchBoxSelector);
  await page.type(selectors.searchBoxSelector, config.city);

  const btn = await page.waitForSelector(selectors.searchButtonSelector);
  await Promise.all([page.waitForNavigation(), btn?.click()]);

  async function scrollToBottom() {
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  await scrollToBottom();

  const listingsData: ListingData[] = await scrapeAllListings(page);
  await page.close();
}

async function scrapeAllListings(page: puppeteer.Page): Promise<ListingData[]> {
  let listingsData: ListingData[] = [];

  async function scrapePageListings() {
    const data: ListingData[] = await page.evaluate((selectorObj) => {
      const listings = document.querySelectorAll(selectorObj.listingSelector);
      const data: ListingData[] = [];

      listings.forEach((listing) => {
        const addressElement = listing.querySelector(
          selectorObj.addressElementSelector
        );
        const listingByElement = listing.querySelector(
          selectorObj.listingByElementSelector
        );
        const priceElement = listing.querySelector(
          selectorObj.priceElementSelector
        );
        const bedsElement = listing.querySelector(
          selectorObj.bedsElementSelector
        );
        const bathsElement = listing.querySelector(
          selectorObj.bathsElementSelector
        );
        const sqftElement = listing.querySelector(
          selectorObj.sqftElementSelector
        );

        const address = addressElement?.textContent?.trim() || "";
        const listingBy = listingByElement?.textContent?.trim() || "";
        const price = priceElement?.textContent?.trim() || "";
        const beds = bedsElement?.textContent?.trim() || "";
        const baths = bathsElement?.textContent?.trim() || "";
        const sqft = sqftElement?.textContent?.trim() || "";

        data.push({ address, listingBy, price, beds, baths, sqft });
      });

      return data;
    }, selectors);

    return data;
  }

  async function goToNextPage() {
    const nextPageButton = await page.$("a[title='Next page']");
    if (nextPageButton) {
      const isDisabled = await nextPageButton.evaluate(
        (btn) => btn.getAttribute("aria-disabled") === "true"
      );
      if (!isDisabled) {
        await Promise.all([
          page.waitForNavigation({ timeout: 180000 }),
          nextPageButton.click(),
        ]);
        await page.waitForSelector(selectors.searchPageListSelector);
        return true;
      }
    }
    return false;
  }

  async function recursiveScrape() {
    const pageListings = await scrapePageListings();
    listingsData = listingsData.concat(pageListings);

    const hasNextPage = await goToNextPage();
    if (hasNextPage) {
      await recursiveScrape();
    } else {
      console.log(CONSTANTS.PAGES_SCRAPPED_WRITING_DATA);
      try {
        await writeToCsv(listingsData);
      } catch (error) {
        console.error(CONSTANTS.ERROR_WRITING_DATA, error);
      }
    }
  }

  await recursiveScrape();

  return listingsData;
}

async function writeToCsv(listingsData: ListingData[]) {
  try {
    const csvWriter = createObjectCsvWriter({
      path: CONSTANTS.CSV_FILE_PATH,
      header: [
        { id: "address", title: "Address" },
        { id: "listingBy", title: "Listing By" },
        { id: "price", title: "Price" },
        { id: "beds", title: "Beds" },
        { id: "baths", title: "Baths" },
        { id: "sqft", title: "Sqft" },
      ],
      append: true,
    });

    await csvWriter.writeRecords(listingsData);
    console.log(CONSTANTS.DATA_WRITTEN_SUCCESSFULLY);
  } catch (error) {
    console.error(CONSTANTS.ERROR_WRITING_DATA, error);
  }
}

export { scrapZillow };
