import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";
import { config } from "../environment/config";
import { selectors } from "./selectors";

interface ListingData {
  address: string;
  listingBy: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
}

async function scrapZillow(browser: puppeteer.Browser): Promise<void> {
  const page = await browser.newPage();
  await page.goto(config.endpoint);

  await page.waitForSelector(selectors.searchBoxSelector);
  await page.type(selectors.searchBoxSelector, "New York");

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

  try {
    await writeToCsv(listingsData);
  } catch (error) {
    console.error("Error writing data to CSV file:", error);
  }

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
      await Promise.all([
        page.waitForNavigation({ timeout: 180000 }),
        nextPageButton.click(),
      ]);
      await page.waitForSelector(selectors.searchPageListSelector);
      return true;
    } else {
      return false;
    }
  }

  async function recursiveScrape() {
    const pageListings = await scrapePageListings();
    listingsData = listingsData.concat(pageListings);

    console.log(listingsData);

    const hasNextPage = await goToNextPage();
    if (hasNextPage) {
      await recursiveScrape();
    }
  }

  await recursiveScrape();

  return listingsData;
}

async function writeToCsv(listingsData: ListingData[]) {
  try {
    const csvWriter = createObjectCsvWriter({
      path: "../listings-data.csv",
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
    console.log("Data successfully written to CSV file.");
  } catch (error) {
    console.error("Error writing data to CSV file:", error);
  }
}

export { scrapZillow };
