import { blobToURL, getListing, getListings, Listing } from "../api.js";
import { sellItem, loadView } from "/index.js";

export function onNavigate() {
    /** @type {HTMLButtonElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLButtonElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");
    const searchBar = document.getElementById("search-bar");

    homeButtonElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", sellItem);
    userPortalElement.addEventListener("click", () => loadView("profile"));
    populateListings();
    searchBar.addEventListener("input", search);

    /**
     * @param {Listing} listing 
     */
    async function addListing(listing) {
        const mainPageDisplay = document.getElementById("main-page-display");
        const productBox = document.createElement("div");
        productBox.classList.add("product-box");
        productBox.innerHTML = `
        <div class="image-container">
            <div class="price-tag"></div>
        </div>
        <div class="description-box">
            <h3></h3>
            <p></p>
        </div>`;
        const titleElement = productBox.querySelector("h3");
        const categoryLabelElement = productBox.querySelector("p");
        const priceTagElement = productBox.querySelector(".price-tag");
        const imageDivElement = productBox.querySelector(".image-container");

        titleElement.innerText = listing.description;

        categoryLabelElement.innerText = listing.category;

        priceTagElement.innerText = `$${listing.cost.toFixed(2)}`;

        const backgroundImageURL = await blobToURL(listing.thumbnail);
        imageDivElement.style.backgroundImage = `url("${backgroundImageURL}")`

        productBox.addEventListener("click", () => loadView("product", { id: listing._id }))

        mainPageDisplay.appendChild(productBox);
    }

    async function populateListings() {
        (await getListings()).forEach(async _id => {
            addListing(await getListing(_id))
        });
    }

    function search() {}
}