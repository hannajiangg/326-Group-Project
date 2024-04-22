import { loadView } from "/index.js"

export async function onNavigate() {
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

  //TODO: Get these from (mock) db
  let userName = "Tim Richards";
  let email = "richards@cs.umass.edu";
  let image = "assets/zoo_buy_logo.jpg"; // Make this uploadable???
  const payments = ["Example 1", "Example 2"]; // How do we get these in a secure way???
  const posted = [
    { name: "Men's Waterfowl Sweater Vest", qt: 1 },
    { name: "Men's Jeans", qt: 2 },
  ];
  const sold = [
    { name: "Men's Waterfowl Sweater Vest", qt: 2 },
    { name: "Men's Jeans", qt: 3 },
  ];
  const purchased = [
    { name: "Used Bike", qt: 1 },
    { name: "UMass T-Shirt", qt: 5 },
  ];

  //Populate profile fields
  nameField.value = userName;
  emailField.value = email;
  pfp.src = image;

  if (payments.length === 0) {
    const message = document.createElement("p");
    message.innerText = "No stored payment methods";
    paymentsField.appendChild(message);
  } else {
    for (let x of payments) {
      const payment = document.createElement("input");
      payment.classList.add("two");
      payment.value = x;
      payment.disabled = true;
      paymentsField.appendChild(payment);
    }
  }

  for (let x of posted) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    // TODO: Figure out a way to pass product ID to seller/product page when clicking these
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("seller");
    })
    const qt = document.createElement("p");
    qt.innerText = `Qt: ${x.qt}`;
    div.appendChild(item);
    div.appendChild(qt);
    postedBlock.appendChild(div);
  }

  for (let x of sold) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    // TODO: Figure out a way to pass product ID to seller/product page when clicking these
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("seller");
    })
    const qt = document.createElement("p");
    qt.innerText = `Qt: ${x.qt}`;
    div.appendChild(item);
    div.appendChild(qt);
    soldBlock.appendChild(div);
  }

  for (let x of purchased) {
    const div = document.createElement("div");
    div.classList.add("item");
    const item = document.createElement("a");
    item.href = "";
    item.innerText = x.name;
    // TODO: Figure out a way to pass product ID to seller/product page when clicking these
    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView("product");
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
    userName = nameField.value; // Will need to update this in db too
    nameField.disabled = true;
    editName.hidden = false;
    saveName.hidden = true;
  });

  nameField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      userName = nameField.value; // Will need to update this in db too
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
    email = emailField.value; // Will need to update this in db too
    emailField.disabled = true;
    editEmail.hidden = false;
    saveEmail.hidden = true;
  });

  emailField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      email = emailField.value; // Will need to update this in db too
      emailField.disabled = true;
      editEmail.hidden = false;
      saveEmail.hidden = true;
    }
  });
}