import { blobToURL, getListing, getListings, hasListing, Listing, putListing } from "../api.js";
import { loadView } from "/index.js";

async function sellItem() {
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
    populateListings();

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
}