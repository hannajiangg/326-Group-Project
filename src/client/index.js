import * as login from "./login/login.js";
import * as main from "./main/main.js";
import * as product from "./product/product.js";
import * as seller from "./seller/seller.js";
import * as profile from "./profile/profile.js";
import { hasListing, Listing, putListing } from "../api.js";

/*
  USEFUL LINKS:
  http://localhost:8080/#login
  http://localhost:8080/#register
  http://localhost:8080/#main
  http://localhost:8080/?id=000#product
  http://localhost:8080/?id=000#seller
  http://localhost:8080/#profile
*/

/**
 * The current page open on the app
 */
const appState = {
  currentView: "",
};

/**
 * This is a dictionary containing callbacks that are supposed to be fired whenever a given page is loaded.
 * For example, onNavigateListeners["main"] reads the list of listings from the database and renders them in HTML.
 * 
 * Make sure to add any new scripts to this object!
 * @type {{[view: string]: () => Promise<void>}}
 */
const onNavigateListeners = {
  "login": login.onNavigate,
  "main": main.onNavigate,
  "product": product.onNavigate,
  "seller": seller.onNavigate,
  "profile": profile.onNavigate,
}

/**
 * Loads a specific view on the page
 * @param {string} view 
 * @param {Record<string, string> | string | URLSearchParams}
 */
export async function loadView(view, queryString) {
  const URLparams = new URLSearchParams(queryString)
  await fetch(`${view}/${view}.html`) // Assuming each view has a corresponding HTML file
    .then((response) => response.text())
    .then((html) => {
      document.body.innerHTML = html;
      appState.currentView = view;
      window.history.pushState({ view: view }, `${view}`, `?${URLparams.toString()}#${view}`);
      if(view in onNavigateListeners)
        onNavigateListeners[view]();
    });
}

// Handle browser back and forward buttons
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.view) {
    loadView(e.state.view);
  }
});

// Load the initial view based on the URL
const initialView = window.location.hash
  ? window.location.hash.substring(1)
  : "login";

const initialSearch = window.location.search

loadView(initialView, initialSearch);

export async function sellItem() {
  let newListingId = Math.random().toFixed(10).substring(2);
  while (await hasListing(newListingId)) {
      console.log(newListingId);
      newListingId = Math.random().toFixed(10).substring(2);
  }
  await putListing(new Listing(
      newListingId,
      "",
      new Blob(),
      [],
      0,
      "",
      "",
      1,
      "000"
  ));
  console.log(newListingId)
  loadView("seller", {id: newListingId});
}
