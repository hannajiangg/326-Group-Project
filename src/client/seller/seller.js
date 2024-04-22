import { blobToURL, getListing, putListing } from "../api.js";

export async function onNavigate() {
    const searchParams = new URLSearchParams(window.location.search);
    const currentListing = await getListing(searchParams.get("id"));

    const carouselImageContainer = document.getElementById("carousel-images");
    const carouselDiv = document.getElementById("carousel");
    const carouselLeftArrow = document.getElementById("carousel-left-arrow");
    const carouselRightArrow = document.getElementById("carousel-right-arrow");

    const carouselImageList = [];

    // Append all current images
    for (const imageBlob of currentListing.carousel) {
        /** @type { HTMLImageElement } */
        const carouselImage = document.createElement("img");
        carouselImage.src = await blobToURL(imageBlob);
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
        currentListing.carousel.push(...newImageList);
        e.preventDefault();
        for (const imageBlob of newImageList) {
            /** @type { HTMLImageElement } */
            const carouselImage = document.createElement("img");
            carouselImage.src = await blobToURL(imageBlob);
            carouselImage.classList.add("carousel-image");
            carouselImageContainer.insertBefore(carouselImage, newImagePlaceholderElement);
            carouselImageList.splice(carouselImageList.length - 1, 0, carouselImage);
        }
        await putListing(currentListing);
        console.log(await getListing(currentListing._id))
    });

    /**
     * Jumps to a specific image index
     * @param { number } index 
     */
    function jumpToImage(index) {
        const imageWidthList = carouselImageList.map(image => image.getBoundingClientRect().width);
        console.log(imageWidthList);
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