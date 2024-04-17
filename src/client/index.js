import * as login from "./login.js"
import * as main from "./main.js"
import * as product from "./product.js"
import * as profile from "./profile.js"
import * as register from "./register.js"
import * as seller from "./seller.js"

// Does routing and stuff
const appState = {
  currentView: "",
};

async function loadView(view) {
  await fetch(`${view}.html`) // Assuming each view has a corresponding HTML file
    .then((response) => response.text())
    .then((html) => {
      document.body.innerHTML = html;
      appState.currentView = view;
      window.history.pushState({ view: view }, `${view}`, `#${view}`);
    });
  switch(view){
    case "login":
      // do stuff
    case "main":
      // do stuff
    case "product":
      // do stuff
    case "profile":
      // do stuff
    case "register":
      // do stuff
    case "seller":
      // do stuff
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
