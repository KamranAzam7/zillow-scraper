const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
import { scrapZillow } from "./pages";
import { config } from "./environment/config";
const fs = require("fs-extra");

const startScrapeZillow = async () => {
  const userDataDir = `/tmp/chrome-user-data-${Math.floor(
    Math.random() * 100000
  )}`;
  const args = [
    " --user-agent=" + config.user_agent,
    " --disable-background-timer-throttling",
    " --disable-backgrounding-occluded-windows",
    " --disable-renderer-backgrounding",
    " --user-data-dir=" + userDataDir,
    " --no-sandbox",
  ];

  const browser = await puppeteer.connect({
    headless: config.headless,
    devtools: config.devtools,
    // executablePath: config.executablePath,
    browserWSEndpoint: config.browserWSEndpoint,
    args: args,
  });
  await scrapZillow(browser);

  try {
    await fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        " > Error clearing user data dir ",
        (error as Error).message
      );
    }
  }
};

startScrapeZillow();
