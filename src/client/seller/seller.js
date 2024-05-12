import { blobToURL, getListing, getProfile, getSelfProf, hasListing, Listing, putListing } from "../api.js";
import { sellItem, loadView } from "/index.js";

/**
 * Renders the carousel at the top of the page.
 * @param {Listing} listing 
 */
async function renderCarousel(listing) {
    const carouselImageContainer = document.getElementById("carousel-images");
    const carouselDiv = document.getElementById("carousel");
    const carouselLeftArrow = document.getElementById("carousel-left-arrow");
    const carouselRightArrow = document.getElementById("carousel-right-arrow");

    const carouselImageList = [];

    // Append all current images
    for (let i = 0; i < listing.carouselLength; i++) {
        /** @type { HTMLImageElement } */
        const carouselImage = document.createElement("img");
        carouselImage.src = `./api/listings/${listing._id}/carousel/${i}`;
        carouselImage.classList.add("carousel-image");
        carouselImageContainer.appendChild(carouselImage);
        carouselImageList.push(carouselImage);
    }

    // Append placeholder for adding image
    const newImagePlaceholderElement = document.createElement("div");
    newImagePlaceholderElement.id = "new-image-placeholder";
    newImagePlaceholderElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>`
    carouselImageContainer.appendChild(newImagePlaceholderElement);
    carouselImageList.push(newImagePlaceholderElement);

    // Add listener for file drops
    newImagePlaceholderElement.addEventListener("dragenter", e => e.preventDefault());
    newImagePlaceholderElement.addEventListener("dragover", e => e.preventDefault());
    newImagePlaceholderElement.addEventListener("drop", async e => {
        const newImageList = [...e.dataTransfer.files].filter(file => file.type.split("/")[0] === "image");
        listing.carousel.push(...newImageList);
        e.preventDefault();
        for (const imageBlob of newImageList) {
            /** @type { HTMLImageElement } */
            const carouselImage = document.createElement("img");
            carouselImage.src = await blobToURL(imageBlob);
            carouselImage.classList.add("carousel-image");
            carouselImageContainer.insertBefore(carouselImage, newImagePlaceholderElement);
            carouselImageList.splice(carouselImageList.length - 1, 0, carouselImage);
        }
        await putListing(listing);
        console.log(await getListing(listing._id))
    });

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

    //Jump to new image block
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
}

/**
 * Renders the description of the seller interface.
 * @param {Listing} listing 
 */
async function renderDescription(listing) {
    const quantityAddButton = document.getElementById('quantity-add-button');
    const quantitySubtractButton = document.getElementById('quantity-subtract-button');
    const quantityLabel = document.getElementById('quantity-label');
    const sellerLabel = document.getElementById('seller-label');
    const sellerEmailLabel = document.getElementById('seller-email-label');
    const descriptionTextarea = document.getElementById('description-textarea');
    const postButton = document.getElementById('post-button');
    const thumbnailSelector = document.getElementById('thumbnail-selector');

    thumbnailSelector.addEventListener("click", () => {
        const fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.addEventListener("change", e => {
            const [newThumbnail] = e.target.files;
            console.log(newThumbnail.type);
            if(newThumbnail.type.split("/")[0] !== "image"){
                alert("Thumbnail must be an image!");
                return;
            }
            listing.thumbnail = newThumbnail;
            blobToURL(newThumbnail).then(url =>
                thumbnailSelector.src = url
            );
        });
        fakeInput.click();
    });

    quantityLabel.textContent = listing.quantity;
    quantityAddButton.addEventListener("click", async () => {
        listing.quantity++;
        quantityLabel.textContent = listing.quantity;
    });
    quantitySubtractButton.addEventListener("click", async () => {
        listing.quantity--;
        quantityLabel.textContent = listing.quantity;
    });

    const sellerProfile = await getProfile(listing.sellerId);
    sellerLabel.textContent = sellerProfile.name;
    sellerEmailLabel.textContent = sellerProfile.email;

    descriptionTextarea.addEventListener("input", async () => {
        descriptionTextarea.style.height = "";
        descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";

        listing.description = descriptionTextarea.textContent;
    });

    postButton.addEventListener("click", async () => {
        try {
            await putListing(listing);
        } catch {
            alert("Cannot upload listing!");
        }
    })
}

export async function onNavigate() {
    /** @type {HTMLButtonElement} */
    const homeButtonElement = document.getElementById("home-button");
    /** @type {HTMLButtonElement} */
    const sellButtonElement = document.getElementById("sell-button");
    /** @type {HTMLElement} */
    const userPortalElement = document.getElementById("user-portal");

    homeButtonElement.addEventListener("click", () => loadView("main"));
    sellButtonElement.addEventListener("click", sellItem);
    userPortalElement.addEventListener("click", () => loadView("profile"));

    const searchParams = new URLSearchParams(window.location.search);

    // Get or create the listing for this page
    const listingId = searchParams.get("id");
    let listing = await getListing();
    if (listing === null) {
        try {
            const selfId = await getSelfProf();
            listing = new Listing(
                listingId,
                "",
                null,
                [],
                0.00,
                "",
                "",
                "",
                selfId
            );
        } catch (e) {
            loadView("login");
            return;
        }
    }

    renderCarousel(listing);
    renderDescription(listing);
}