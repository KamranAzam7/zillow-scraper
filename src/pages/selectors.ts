const searchBoxSelector =
  '[data-testid="search-bar-container"] input[type="text"]';
const searchButtonSelector =
  '[data-testid="search-bar-container"] button[type="submit"]';
const firstListedItemSelector = "#grid-search-results ul > li:first-child";
const skipDialogueBoxSelector = 'div[aria-label="Choose listing type"] button';
const searchPageListSelector = "#search-page-list-container";
const listingSelector =
  ".StyledPropertyCardDataWrapper-c11n-8-100-1__sc-hfbvv9-0.etwreV.property-card-data";
const addressElementSelector = 'address[data-test="property-card-addr"]';
const listingByElementSelector =
  ".StyledPropertyCardDataArea-c11n-8-100-1__sc-10i1r6-0.ZhyMY";
const priceElementSelector = '[data-test="property-card-price"]';
const bedsElementSelector =
  ".StyledPropertyCardHomeDetailsList-c11n-8-100-1__sc-1j0som5-0.kAPEO li:nth-child(1) b";
const bathsElementSelector =
  ".StyledPropertyCardHomeDetailsList-c11n-8-100-1__sc-1j0som5-0.kAPEO li:nth-child(2) b";
const sqftElementSelector =
  ".StyledPropertyCardHomeDetailsList-c11n-8-100-1__sc-1j0som5-0.kAPEO li:nth-child(3) b";

export const selectors = {
  searchBoxSelector,
  searchButtonSelector,
  firstListedItemSelector,
  skipDialogueBoxSelector,
  searchPageListSelector,
  listingSelector,
  addressElementSelector,
  listingByElementSelector,
  priceElementSelector,
  bedsElementSelector,
  bathsElementSelector,
  sqftElementSelector,
};
