import { getProfile, putProfile, Profile, getSelfProf, getProfileListings, getListing } from "../api.js";
import { loadNavbar } from "../navbar/navbar.js";
import { sellItem, loadView } from "/index.js";

export async function onNavigate() {
  await loadNavbar();

  const editName = document.getElementById("edit-name");
  const editEmail = document.getElementById("edit-email");
  const saveName = document.getElementById("save-name");
  const saveEmail = document.getElementById("save-email");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const paymentsField = document.getElementById("payments");
  const postedBlock = document.getElementById("posted");
  const soldBlock = document.getElementById("sold");
  const purchasedBlock = document.getElementById("purchased");
  const pfp = document.getElementById("pfp");

  // Change this to actual _id of current user
  const searchParams = new URLSearchParams(window.location.search);
  const profileId = searchParams.get("id");
  const profile = await getProfile(profileId);

  const listings = await getProfileListings(profileId);
  listings.forEach(async listingId => {
    const listing = await getListing(listingId);
    addListing(listing);
  });

  //Populate profile fields
  if (profile.name !== null && profile.email !== null) {
    nameField.value = profile.name;
    emailField.value = profile.email;
  }
  pfp.src = profile.pfp;

  // if (profile.payments.length === 0) {
  //   const message = document.createElement("p");
  //   message.innerText = "No stored payment methods";
  //   paymentsField.appendChild(message);
  // } else {
  //   for (let x of profile.payments) {
  //     const payment = document.createElement("input");
  //     payment.classList.add("two");
  //     payment.value = x;
  //     payment.disabled = true;
  //     paymentsField.appendChild(payment);
  //   }
  // }

  // for (let x of profile.posted) {
  //   const div = document.createElement("div");
  //   div.classList.add("item");
  //   const item = document.createElement("a");
  //   item.href = "";
  //   item.innerText = x.name;
  //   item.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     loadView("seller", {id: x._id});
  //   })
  //   const qt = document.createElement("p");
  //   qt.innerText = `Qt: ${x.qt}`;
  //   div.appendChild(item);
  //   div.appendChild(qt);
  //   postedBlock.appendChild(div);
  // }

  // for (let x of profile.sold) {
  //   const div = document.createElement("div");
  //   div.classList.add("item");
  //   const item = document.createElement("a");
  //   item.href = "";
  //   item.innerText = x.name;
  //   item.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     loadView("seller", {id: x._id});
  //   })
  //   const qt = document.createElement("p");
  //   qt.innerText = `Qt: ${x.qt}`;
  //   div.appendChild(item);
  //   div.appendChild(qt);
  //   soldBlock.appendChild(div);
  // }

  // for (let x of profile.purchased) {
  //   const div = document.createElement("div");
  //   div.classList.add("item");
  //   const item = document.createElement("a");
  //   item.href = "";
  //   item.innerText = x.name;
  //   item.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     loadView("product", {id: x._id});
  //   })
  //   const qt = document.createElement("p");
  //   qt.innerText = `Qt: ${x.qt}`;
  //   div.appendChild(item);
  //   div.appendChild(qt);
  //   purchasedBlock.appendChild(div);
  // }

  //Event handlers for changing profile info
  editName.addEventListener("click", () => {
    nameField.disabled = false;
    nameField.select();
    editName.hidden = true;
    saveName.hidden = false;
  });

  saveName.addEventListener("click", () => {
    profile.name = nameField.value;
    putProfile(profile).then(() => {
      nameField.disabled = true;
      editName.hidden = false;
      saveName.hidden = true;
    }, e => {
      alert(e.message);
    });
  });

  nameField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      profile.name = nameField.value;
      putProfile(profile).then(() => {
        nameField.disabled = true;
        editName.hidden = false;
        saveName.hidden = true;
      }, a => {
        alert(e.message);
      });
    }
  });

  editEmail.addEventListener("click", () => {
    emailField.disabled = false;
    emailField.select();
    editEmail.hidden = true;
    saveEmail.hidden = false;
  });

  saveEmail.addEventListener("click", () => {
    profile.email = emailField.value;
    putProfile(profile).then(() => {
      emailField.disabled = true;
      editEmail.hidden = false;
      saveEmail.hidden = true;
    }, e => {
      alert(e.message);
    });
  });

  emailField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      profile.email = emailField.value;
      putProfile(profile).then(() => {
        emailField.disabled = true;
        editEmail.hidden = false;
        saveEmail.hidden = true;
      }, e => {
        alert(e.message);
      });
    }
  });
}

/**
 * @param {Listing} listing 
 */
async function addListing(listing) {
  const currentUser = await getSelfProf().catch(() => "");
  const itemDisplay = document.getElementById("items");
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
  productBox.addEventListener("click", () => loadView(isOwned ? "seller" : "product", { id: listing._id }))

  itemDisplay.appendChild(productBox);
}