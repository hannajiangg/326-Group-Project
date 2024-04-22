import { generateFakeData, getListings, getListing } from "./api.js"
import * as login from "./login/login.js"
import * as main from "./main/main.js"
import * as product from "./product/product.js"
import * as profile from "./profile/profile.js"
import * as register from "./register/register.js"
import * as seller from "./seller/seller.js"

await generateFakeData();
console.log(await getListing("000"));
console.log(await getListings());

// Does routing and stuff
const appState = {
  currentView: "",
};

export async function loadView(view) {
  await fetch(`${view}/${view}.html`) // Assuming each view has a corresponding HTML file
    .then((response) => response.text())
    .then((html) => {
      document.body.innerHTML = html;
      appState.currentView = view;
      window.history.pushState({ view: view }, `${view}`, `#${view}`);
    });
  switch(view){
    case "login":
      // Example code. Feel free to delete.
      login.onNavigate();
    case "main":
      main.onNavigate();
    case "product":
      // do stuff
    case "profile":
      // do stuff
    case "register":
      // do stuff
    case "seller":
      seller.onNavigate();
  }
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

loadView(initialView);
