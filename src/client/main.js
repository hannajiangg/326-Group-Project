import { getListings } from "./api.js";
import { loadView } from "./index.js";

export function onNavigate() {
    /** @type {HTMLButtonElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLButtonElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");

    userPortalElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", () => loadView("seller"));
    userPortalElement.addEventListener("click", () => loadView("profile"));
    populateListings();
}

async function populateListings() {
    const mainPageDisplay = document.getElementById("main-page-display");
    (await getListings()).forEach(_id => {
        

    });
}