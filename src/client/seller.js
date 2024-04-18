import { blobToURL, getListing } from "./api.js";

export async function onNavigate(){
    const searchParams = new URLSearchParams(window.location.search);
    const listing = await getListing(searchParams.get("id"));

    const carouselImagesDiv = document.getElementById("carousel-images");
    const carouselDiv = document.getElementById("carousel");
    const carouselLeftArrow = document.getElementById("carousel-left-arrow");
    const carouselRightArrow = document.getElementById("carousel-right-arrow");
    const carouselImageList = [];
    for(const imageBlob of listing.carousel){
        /** @type { HTMLImageElement } */
        const carouselImage = document.createElement("img");
        carouselImage.src = await blobToURL(imageBlob);
        carouselImage.classList.add("carousel-image")
        carouselImagesDiv.appendChild(carouselImage);
        carouselImageList.push(carouselImage)
    }
    // Append placeholder for adding image
    const newImagePlaceholderElement = document.createElement("div");
    newImagePlaceholderElement.id = "new-image-placeholder";
    newImagePlaceholderElement.innerHTML = 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>`
    carouselImagesDiv.appendChild(newImagePlaceholderElement);
    carouselImageList.push(newImagePlaceholderElement);
    function jumpToImage(index){
        const imageWidthList = carouselImageList.map(image => image.getBoundingClientRect().width);
        const prevWidths = imageWidthList.slice(0, index);
        let offset = -prevWidths.reduce((a, b) => a + b, 0);
        offset -= imageWidthList[index] * 0.5;
        const totalWidth = carouselDiv.getBoundingClientRect().width;
        offset += totalWidth * 0.5;
        carouselImagesDiv.style.left = `${offset}px`
    }
    let currentImage = 0;
    jumpToImage(currentImage);
    carouselLeftArrow.addEventListener("click", ()=>{
        currentImage = Math.max(0, currentImage - 1);
        jumpToImage(currentImage)
    })
    carouselRightArrow.addEventListener("click", ()=>{
        currentImage = Math.min(carouselImageList.length, currentImage + 1);
        jumpToImage(currentImage)
    })
}