import { getSelfProf } from "../api.js";
import { loadView, sellItem } from "/index.js";

/**
 * This function appends the navbar to the start of body.
 */
export async function loadNavbar() {
    const navbarElement = document.createElement("html");
    const navbarResponse = await fetch("./navbar/navbar.html");
    navbarElement.innerHTML = await navbarResponse.text();
    document.body.prepend(navbarElement);

    /** @type {HTMLButtonElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLButtonElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");

    homeButtonElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", sellItem);
    userPortalElement.addEventListener("click", async () => {
        try {
            const selfId = await getSelfProf();
            loadView("profile", { id: selfId });
        } catch (e) {
            console.log(e);
            loadView("login");
        }
    });

}