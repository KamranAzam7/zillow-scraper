import path from "path";

export const CONSTANTS = {
  ERROR_WRITING_DATA: "Error writing data to CSV file:",
  DATA_WRITTEN_SUCCESSFULLY: "Data successfully written to CSV file.",
  PAGES_SCRAPPED_WRITING_DATA: "All pages scraped. Writing data to CSV.",
  ERROR_NAVIGATING_NEXT_PAGE: "Error navigating to the next page!",
  CSV_FILE_PATH: path.join(__dirname, "../../", "listings-data.csv")
};

export interface ListingData {
    address: string;
    listingBy: string;
    price: string;
    beds: string;
    baths: string;
    sqft: string;
  }