import { blobToURL, getListing, getListings, getSelfProf, hasListing, Listing, putListing } from "../api.js";
import { loadNavbar } from "../navbar/navbar.js";
import { sellItem, loadView } from "/index.js";

export async function onNavigate() {
    await loadNavbar();
    populateListings();

    const searchBar = document.getElementById("search-bar");
    const listings = [];

    const currentUser = await getSelfProf().catch(() => "");

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
        </div>`;
        const titleElement = productBox.querySelector("h3");
        const priceTagElement = productBox.querySelector(".price-tag");
        const imageDivElement = productBox.querySelector(".image-container");

        titleElement.innerText = listing.title;

        priceTagElement.innerText = `$${listing.cost.toFixed(2)}`;

        const backgroundImageURL = `./api/listings/${listing._id}/thumbnail`;
        imageDivElement.style.backgroundImage = `url("${backgroundImageURL}")`

        const isOwned = listing.sellerId === currentUser;
        productBox.addEventListener("click", () => loadView(isOwned? "seller" : "product", { id: listing._id }))

        mainPageDisplay.appendChild(productBox);
        listings.push(productBox);
    }

    async function populateListings() {
        (await getListings()).forEach(async _id => {
            addListing(await getListing(_id))
        });
        searchBar.addEventListener("input", search);
    }

    // Only displays listings that contain every search term somewhere in the title or category
    // Case insensitive, and ignores commas and apostrophes
    // Updates on every user keypress, so no need for separate search button
    function search() {
        const terms = searchBar.value.toLowerCase().replaceAll(/[,']/g, "").split(" ");
        listings.forEach(listing => {
            const title = listing.querySelector("h3").innerText.toLowerCase().replaceAll(/[,']/g, "");
            //const category = listing.querySelector("p").innerText.toLowerCase().replaceAll(/[,']/g, "");
            if (terms.every(term => title.includes(term))) {
                listing.hidden = false;
            } else {
                listing.hidden = true;
            }
        })
    }


    // Extra dummy items for testing search bar
    //
    // const items = [["Men's jeans", "Clothing"], ["Women's jeans, used", "Clothing"], ["Men's shirt", "Clothing"], ["Women's shirt", "Clothing"],
    //                 ["New bike", "Item"], ["Used pot", "Item"], ["New basketball", "Item, Sports"], ["Soccer cleats", "Clothing, Sports"],
    //                 ["Baseball bat", "Sports"]];
    // items.forEach(item => {
    //     const mainPageDisplay = document.getElementById("main-page-display");
    //     const productBox = document.createElement("div");
    //     productBox.classList.add("product-box");
    //     productBox.innerHTML = `
    //     <div class="image-container">
    //         <div class="price-tag"></div>
    //     </div>
    //     <div class="description-box">
    //         <h3></h3>
    //         <p></p>
    //     </div>`;
    //     const titleElement = productBox.querySelector("h3");
    //     const categoryLabelElement = productBox.querySelector("p");
    //     titleElement.innerText = item[0];
    //     categoryLabelElement.innerText = item[1];

    //     mainPageDisplay.appendChild(productBox);
    //     listings.push(productBox);
    // });


}