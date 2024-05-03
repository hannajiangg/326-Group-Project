import { getProfile, putProfile, Profile } from "../api.js";
import { sellItem, loadView } from "/index.js";

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
  let profile = await getProfile("000");

  //Populate profile fields
  nameField.value = profile.name;
  emailField.value = profile.email;
  pfp.src = URL.createObjectURL(profile.pfp);

  if (profile.payments.length === 0) {
    const message = document.createElement("p");
    message.innerText = "No stored payment methods";
    paymentsField.appendChild(message);
  } else {
    for (let x of profile.payments) {
      const payment = document.createElement("input");
      payment.classList.add("two");
      payment.value = x;
      payment.disabled = true;
      paymentsField.appendChild(payment);
    }
  }

  for (let x of profile.posted) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("seller", {id: x._id});
    })
    const qt = document.createElement("p");
    qt.innerText = `Qt: ${x.qt}`;
    div.appendChild(item);
    div.appendChild(qt);
    postedBlock.appendChild(div);
  }

  for (let x of profile.sold) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("seller", {id: x._id});
    })
    const qt = document.createElement("p");
    qt.innerText = `Qt: ${x.qt}`;
    div.appendChild(item);
    div.appendChild(qt);
    soldBlock.appendChild(div);
  }

  for (let x of profile.purchased) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("product", {id: x._id});
    })
    const qt = document.createElement("p");
    qt.innerText = `Qt: ${x.qt}`;
    div.appendChild(item);
    div.appendChild(qt);
    purchasedBlock.appendChild(div);
  }

  //Event handlers for changing profile info
  editName.addEventListener("click", () => {
    nameField.disabled = false;
    nameField.select();
    editName.hidden = true;
    saveName.hidden = false;
  });

  saveName.addEventListener("click", () => {
    profile.name = nameField.value;
    putProfile(profile);
    nameField.disabled = true;
    editName.hidden = false;
    saveName.hidden = true;
  });

  nameField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      profile.name = nameField.value;
      putProfile(profile);
      nameField.disabled = true;
      editName.hidden = false;
      saveName.hidden = true;
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
    putProfile(profile);
    emailField.disabled = true;
    editEmail.hidden = false;
    saveEmail.hidden = true;
  });

  emailField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      profile.email = emailField.value;
      putProfile(profile);
      emailField.disabled = true;
      editEmail.hidden = false;
      saveEmail.hidden = true;
    }
  });
}