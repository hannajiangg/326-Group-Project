import { loadView } from "./index.js";

export function onNavigate(){
    /** @type {HTMLInputElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLInputElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");

    userPortalElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", () => loadView("seller"));
    userPortalElement.addEventListener("click", () => loadView("profile"));
}