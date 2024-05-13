import { blobToURL, getListing, getProfile, Listing } from "../api.js";
import { loadNavbar } from "../navbar/navbar.js";
import { sellItem, loadView } from "/index.js";

/**
 * Renders the description of the seller interface.
 * @param {Listing} listing 
 */
async function renderDescription(listing) {
    const seller = await getProfile(listing.sellerId);
    const titleSpan = document.getElementById('title');
    const quantityLabel = document.getElementById('quantity-label');
    const priceTag = document.getElementById('price-tag');
    const sellerLabel = document.getElementById('seller-label');
    const sellerEmailLabel = document.getElementById('seller-email-label');
    const descriptionSection = document.getElementById('description-section');
    const contactButton = document.getElementById('contact-button');

    titleSpan.textContent = listing.title;

    quantityLabel.textContent = listing.quantity;

    priceTag.textContent = listing.cost.toFixed(2);

    sellerLabel.textContent = seller.name;
    sellerEmailLabel.textContent = seller.email;

    descriptionSection.textContent = listing.description;

    contactButton.setAttribute("href", `mailto:${seller.email}`);
}

export async function onNavigate() {
    await loadNavbar();

    const searchParams = new URLSearchParams(window.location.search);
    const currentListing = await getListing(searchParams.get("id"));

    const carouselImageContainer = document.getElementById("carousel-images");
    const carouselDiv = document.getElementById("carousel");
    const carouselLeftArrow = document.getElementById("carousel-left-arrow");
    const carouselRightArrow = document.getElementById("carousel-right-arrow");

    const carouselImageList = [];
    /**
     * Adds a specific element to the carousel
     * @param { HTMLElement } element 
     */
    function appendToCarousel(element) {
        carouselImageContainer.appendChild(element);
        carouselImageList.push(element);
    }
    for (let i = 0; i < currentListing.carouselLength; i++) {
        /** @type { HTMLImageElement } */
        const carouselImage = document.createElement("img");
        carouselImage.src = `./api/listings/${currentListing._id}/carousel/${i}`;
        carouselImage.classList.add("carousel-image");
        appendToCarousel(carouselImage);
    }

    /**
     * Jumps to a specific image index
     * @param { number } index 
     */
    function jumpToImage(index) {
        const imageWidthList = carouselImageList.map(image => image.getBoundingClientRect().width);
        const prevWidths = imageWidthList.slice(0, index);
        const pageWidth = carouselDiv.getBoundingClientRect().width;

        let offset = -prevWidths.reduce((a, b) => a + b, 0);
        offset -= imageWidthList[index] * 0.5;
        offset += pageWidth * 0.5;

        carouselImageContainer.style.left = `${offset}px`;
    }

    let currentImage = carouselImageList.length - 1;
    setTimeout(() => jumpToImage(currentImage), 100);

    carouselLeftArrow.addEventListener("click", () => {
        currentImage = Math.max(0, currentImage - 1);
        jumpToImage(currentImage)
    });
    carouselRightArrow.addEventListener("click", () => {
        currentImage = Math.min(carouselImageList.length - 1, currentImage + 1);
        jumpToImage(currentImage)
    });
    renderDescription(currentListing);
}