import { blobToURL, getListing, Listing } from "../api.js";

/**
 * Renders the description of the seller interface.
 * @param {Listing} listing 
 */
async function renderDescription(listing) {
    const titleSpan = document.getElementById('title');
    const quantityLabel = document.getElementById('quantity-label');
    const priceTag = document.getElementById('price-tag');
    const sellerLabel = document.getElementById('seller-label');
    const sellerEmailLabel = document.getElementById('seller-email-label');
    const descriptionSection = document.getElementById('description-section');

    titleSpan.textContent = "TODO titles need to be added to the data mock";

    quantityLabel.textContent = listing.quantity;

    priceTag.textContent = listing.cost.toFixed(2);

    sellerLabel.textContent = "TODO Fetch this from API";
    sellerEmailLabel.textContent = "TODO Fetch this from API";

    descriptionSection.textContent = listing.description;
}

export async function onNavigate() {
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
    for (const imageBlob of currentListing.carousel) {
        /** @type { HTMLImageElement } */
        const carouselImage = document.createElement("img");
        carouselImage.src = await blobToURL(imageBlob);
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
    })
    carouselRightArrow.addEventListener("click", () => {
        currentImage = Math.min(carouselImageList.length - 1, currentImage + 1);
        jumpToImage(currentImage)
    })
    renderDescription(currentListing);
}