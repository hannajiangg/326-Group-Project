import { generateFakeData, getListings, getListing } from "./api.js"

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

      // This allows the associated script to actually run
      const script = document.createElement("script");
      script.type = "module";
      script.src = `./${view}/${view}.js?${Date.now()}`; // Uses cache busting to ensure the script is executed again when using browser back/forward button
      document.body.appendChild(script);

      appState.currentView = view;
      window.history.pushState({ view: view }, `${view}`, `#${view}`);
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

loadView(initialView);
