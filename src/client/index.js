// Does routing and stuff
const appState = {
  currentView: "",
};

function loadView(view) {
  fetch(`${view}.html`) // Assuming each view has a corresponding HTML file
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("view-container").innerHTML = html;
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
  : "home";
loadView(initialView);
