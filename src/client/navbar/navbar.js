import { loadView } from "/index.js";

export function onNavigate() {
    /** @type {HTMLButtonElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLButtonElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");

    userPortalElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", sellItem);
    userPortalElement.addEventListener("click", () => loadView("profile"));
}