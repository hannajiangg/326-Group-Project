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