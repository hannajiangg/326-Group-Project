import { blobToURL, deleteListing, getListing, getProfile, getSelfProf, hasListing, Listing, putListing } from "../api.js";
import { loadNavbar } from "../navbar/navbar.js";
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

    newImagePlaceholderElement.addEventListener("click", () => {
        const fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.setAttribute("multiple", "true");
        fakeInput.addEventListener("change", async e => {
            const newImageList = [...e.target.files].filter(file => file.type.split("/")[0] === "image");
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
            console.log(await getListing(listing._id))
        });
        fakeInput.click();
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
    /** @type { HTMLInputElement } */
    const titleField = document.getElementById('title-input');
    /** @type { HTMLImageElement } */
    const thumbnailSelector = document.getElementById('thumbnail-selector');
    /** @type { HTMLButtonElement } */
    const quantityAddButton = document.getElementById('quantity-add-button');
    /** @type { HTMLButtonElement } */
    const quantitySubtractButton = document.getElementById('quantity-subtract-button');
    /** @type { HTMLDivElement } */
    const quantityLabel = document.getElementById('quantity-label');
    /** @type { HTMLInputElement } */
    const priceInput = document.getElementById('price-input');
    /** @type { HTMLSpanElement } */
    const sellerLabel = document.getElementById('seller-label');
    /** @type { HTMLSpanElement } */
    const sellerEmailLabel = document.getElementById('seller-email-label');
    /** @type { HTMLTextAreaElement } */
    const descriptionTextarea = document.getElementById('description-textarea');
    /** @type { HTMLButtonElement } */
    const postButton = document.getElementById('post-button');
    /** @type { HTMLButtonElement } */
    const deleteButton = document.getElementById('delete-button');

    titleField.value = listing.title;
    titleField.addEventListener("change", () => listing.title = titleField.value);

    if (listing.thumbnail) {
        thumbnailSelector.src = `./api/listings/${listing._id}/thumbnail`;
    }
    thumbnailSelector.addEventListener("click", () => {
        const fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.addEventListener("change", async e => {
            const [newThumbnail] = e.target.files;
            console.log(newThumbnail.type);
            if (newThumbnail.type.split("/")[0] !== "image") {
                alert("Thumbnail must be an image!");
                return;
            }
            listing.thumbnail = newThumbnail;
            const url = await blobToURL(newThumbnail);
            thumbnailSelector.src = url;
        });
        fakeInput.click();
    });

    quantityLabel.textContent = listing.quantity;
    quantityAddButton.addEventListener("click", async () => {
        listing.quantity++;
        quantityLabel.textContent = listing.quantity;
    });
    quantitySubtractButton.addEventListener("click", async () => {
        if (listing.quantity > 1) {
            listing.quantity--;
        }
        quantityLabel.textContent = listing.quantity;
    });

    priceInput.value = listing.cost.toFixed(2);
    const currencyPattern = /^\d+(\.\d{1,2})?$/;
    priceInput.addEventListener("change", () => {
        const newCost = Number(priceInput.value); // Number constructor used since it is strict
        if (isFinite(newCost) && currencyPattern.test(newCost)) {
            priceInput.classList.remove("invalid-input");
            listing.cost = newCost
        } else {
            priceInput.classList.add("invalid-input");
        }
    })

    const sellerProfile = await getProfile(listing.sellerId);
    sellerLabel.textContent = sellerProfile.name;
    sellerEmailLabel.textContent = sellerProfile.email;

    descriptionTextarea.value = listing.description;
    descriptionTextarea.addEventListener("input", async () => {
        descriptionTextarea.style.height = "";
        descriptionTextarea.style.height = descriptionTextarea.scrollHeight + "px";

        listing.description = descriptionTextarea.value;
    });

    postButton.addEventListener("click", async () => {
        try {
            if (!listing.title) throw new Error("title");
            if (!listing.thumbnail) throw new Error("thumbnail");
            if (!listing.quantity) throw new Error("quantity");
            if (!currencyPattern.test(priceInput.value)) throw new Error("price");
            await putListing(listing);
            loadView("main");
        } catch (e) {
            switch (e.message) {
                case "title":
                    alert("Please enter a title");
                    break;
                case "thumbnail":
                    alert("Please enter a valid thumbnail");
                    break;
                case "price":
                    alert("Please enter a valid price");
                    break;
                case "quantity":
                    alert("Please enter a valid quantity");
                    break;
                default:
                    alert("Uploading listing to server failed");
            }
        }
    });

    deleteButton.addEventListener("click", async () => {
        try{
            await deleteListing(listing._id);
            loadView("main");
        } catch(e){
            alert(e.message);
        }
    });
}

export async function onNavigate() {
    await loadNavbar();

    const searchParams = new URLSearchParams(window.location.search);

    // Get or create the listing for this page
    const listingId = searchParams.get("id");
    let listing = await getListing(listingId);
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
                1,
                selfId
            );
        } catch (e) {
            loadView("login");
            return;
        }
    } else {
        // Load files from listing
        const thumbnailResponse = await fetch(`./api/listings/${listing._id}/thumbnail`);
        listing.thumbnail = await thumbnailResponse.blob();

        listing.carousel = [];
        for (let i = 0; i < listing.carouselLength; i++) {
            const carouselResponse = await fetch(`./api/listings/${listing._id}/carousel/${i}`);
            listing.carousel.push(await carouselResponse.blob());
        }
    }

    renderCarousel(listing);
    renderDescription(listing);
}