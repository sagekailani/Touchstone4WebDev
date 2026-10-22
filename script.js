/* North Star Bakery - interactivity (Touchstone 4)
   Feature: a "Pre-Order List" that visitors build on products.html.
   The list is saved in localStorage and used to pre-fill the contact form.
   The contact form also has JavaScript validation with messages next to each field. */

/* ====================== DATA ====================== */

const STORAGE_KEY = "northStarPreorderList";

// Array of objects: every item the bakery takes pre-orders for
const products = [
  { id: "sourdough",   name: "Sourdough Boule",              category: "Breads",   price: 8 },
  { id: "multigrain",  name: "Seeded Multigrain Loaf",       category: "Breads",   price: 8 },
  { id: "baguette",    name: "Baguette",                     category: "Breads",   price: 5 },
  { id: "signature",   name: "Signature Loaf",               category: "Breads",   price: 9 },
  { id: "croissant",   name: "Butter Croissant",             category: "Pastries", price: 4 },
  { id: "cinnamon",    name: "Cinnamon Roll",                category: "Pastries", price: 5 },
  { id: "danish",      name: "Fruit Danish",                 category: "Pastries", price: 5 },
  { id: "cookie",      name: "Chocolate Chip Cookie",        category: "Pastries", price: 3 },
  { id: "birthday",    name: "Birthday Cake (8-inch)",       category: "Cakes",    price: 45 },
  { id: "lemon",       name: "Lemon Berry Cake (8-inch)",    category: "Cakes",    price: 55 },
  { id: "celebration", name: "Celebration Layer Cake (10-inch)", category: "Cakes", price: 75 }
];

/* ====================== STORAGE ====================== */

// Returns the saved list as an object like { sourdough: 2, croissant: 6 }
function loadList() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch (error) {
    return {};
  }
}

function saveList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // Storage can be blocked (for example in private browsing). The page still works.
  }
}

function findProduct(id) {
  return products.find(function (product) { return product.id === id; });
}

// Turns the saved list into readable text, such as "2 x Sourdough Boule, 6 x Cinnamon Roll"
function listToText(list) {
  return Object.keys(list)
    .filter(function (id) { return findProduct(id); })
    .map(function (id) { return list[id] + " x " + findProduct(id).name; })
    .join(", ");
}

/* ====================== PRODUCTS PAGE ====================== */

function createButton(text, label, action, id, extraClass) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.dataset.action = action;
  button.dataset.id = id;
  if (extraClass) { button.className = extraClass; }
  return button;
}

// Shows the items for the chosen category, each with an "Add" button
function renderProducts() {
  const container = document.getElementById("product-options");
  const filter = document.getElementById("category-filter").value;
  container.replaceChildren();

  products
    .filter(function (product) { return filter === "All" || product.category === filter; })
    .forEach(function (product) {
      const item = document.createElement("li");
      const info = document.createElement("span");
      info.textContent = product.name + " (" + product.category + ") - $" + product.price;
      item.append(info, createButton("Add to list", "Add " + product.name + " to my pre-order list", "add", product.id));
      container.append(item);
    });
}

// Shows the saved list with quantities and a Remove button for each item
function renderMyList() {
  const container = document.getElementById("my-list");
  const status = document.getElementById("list-status");
  const list = loadList();
  const ids = Object.keys(list).filter(function (id) { return findProduct(id); });
  container.replaceChildren();

  ids.forEach(function (id) {
    const item = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = list[id] + " x " + findProduct(id).name;
    item.append(info, createButton("Remove", "Remove " + findProduct(id).name + " from my list", "remove", id, "button-secondary"));
    container.append(item);
  });

  if (ids.length === 0) {
    status.textContent = "Your list is empty. Choose items above to add them.";
  } else {
    status.textContent = "Your list is saved in this browser. Total items: " + countItems(list) + ".";
  }
  document.getElementById("clear-list").hidden = ids.length === 0;
  document.getElementById("send-preorder").hidden = ids.length === 0;
}

function countItems(list) {
  return Object.keys(list).reduce(function (total, id) { return total + list[id]; }, 0);
}

function addItem(id) {
  const list = loadList();
  list[id] = (list[id] || 0) + 1;
  saveList(list);
  renderMyList();
}

function removeItem(id) {
  const list = loadList();
  delete list[id];
  saveList(list);
  renderMyList();
}

function clearList() {
  saveList({});
  renderMyList();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) { return; }
  if (button.dataset.action === "add") { addItem(button.dataset.id); }
  if (button.dataset.action === "remove") { removeItem(button.dataset.id); }
}

function setupProductsPage() {
  const picker = document.getElementById("preorder-picker");
  if (!picker) { return; }
  renderProducts();
  renderMyList();
  document.getElementById("category-filter").addEventListener("change", renderProducts);
  picker.addEventListener("click", handleListClick);
  document.getElementById("clear-list").addEventListener("click", clearList);
}

/* ====================== CONTACT PAGE: PRE-FILL ====================== */

// Loads the saved list from localStorage and puts it in the Item details box
function prefillItemDetails() {
  const text = listToText(loadList());
  const note = document.getElementById("prefill-note");
  const details = document.getElementById("item-details");
  if (!text || details.value.trim() !== "") { return; }
  details.value = text;
  note.hidden = false;
}

/* ====================== CONTACT PAGE: VALIDATION ====================== */

// Each function returns an error message, or an empty string if the value is fine
function checkName(value) {
  if (value === "") { return "Please enter your name."; }
  if (value.length < 2) { return "Your name needs at least 2 characters."; }
  if (!/^[A-Za-z][A-Za-z '.-]*$/.test(value)) { return "Please use only letters, spaces, apostrophes, periods, or hyphens."; }
  return "";
}

function checkEmail(value) {
  if (value === "") { return "Please enter your email so we can reply."; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) { return "Please enter a valid email, like name@example.com."; }
  return "";
}

function checkRequestType(value) {
  return value === "" ? "Please choose a request type." : "";
}

function checkPickupDate(value) {
  if (value === "") { return "Please choose a pickup date."; }
  const picked = new Date(value + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (picked < today) { return "Please choose today or a later date."; }
  if (picked.getDay() === 1) { return "We are closed on Mondays. Please pick another day."; }
  return "";
}

function checkItemDetails(value) {
  if (value === "") { return "Please tell us what you would like."; }
  if (value.length < 10) { return "Please add a little more detail (at least 10 characters)."; }
  if (value.length > 500) { return "Please keep item details under 500 characters."; }
  return "";
}

function checkAllergyNotes(value) {
  return value.length > 300 ? "Please keep allergy notes under 300 characters." : "";
}

// Object that links each field id to its checking function
const validators = {
  "full-name": checkName,
  "email": checkEmail,
  "request-type": checkRequestType,
  "pickup-date": checkPickupDate,
  "item-details": checkItemDetails,
  "allergy-notes": checkAllergyNotes
};

function showError(field, message) {
  const error = document.getElementById(field.id + "-error");
  error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

// Checks one field and shows or clears its message. Returns true if the field is valid.
function validateField(field) {
  const message = validators[field.id](field.value.trim());
  showError(field, message);
  return message === "";
}

// Checks every field, puts focus on the first problem, and returns true only if all are valid
function validateForm(form) {
  let firstInvalid = null;
  Object.keys(validators).forEach(function (id) {
    const field = document.getElementById(id);
    if (!validateField(field) && !firstInvalid) { firstInvalid = field; }
  });
  if (firstInvalid) { firstInvalid.focus(); }
  return firstInvalid === null;
}

function showSuccess(form) {
  const status = document.getElementById("form-status");
  const name = document.getElementById("full-name").value.trim();
  status.textContent = "Thank you, " + name + "! Your request was received. We will email you to confirm availability and pickup details.";
  saveList({});            // the saved pre-order list has been sent, so clear it
  form.reset();
  document.getElementById("prefill-note").hidden = true;
  status.focus();
}

function handleSubmit(event) {
  event.preventDefault();      // stop the form from submitting until it is valid
  const form = event.target;
  document.getElementById("form-status").textContent = "";
  if (validateForm(form)) { showSuccess(form); }
}

function setupContactForm() {
  const form = document.getElementById("preorder-form");
  if (!form) { return; }

  form.noValidate = true;      // JavaScript shows the messages instead of the browser bubbles

  // Do not allow past dates in the date picker
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  document.getElementById("pickup-date").min = today.toISOString().slice(0, 10);

  prefillItemDetails();
  form.addEventListener("submit", handleSubmit);

  // Re-check a field as soon as the user edits it, so errors disappear when fixed
  Object.keys(validators).forEach(function (id) {
    const field = document.getElementById(id);
    const eventName = field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, function () {
      if (field.getAttribute("aria-invalid") === "true") { validateField(field); }
    });
    field.addEventListener("blur", function () {
      if (field.value.trim() !== "") { validateField(field); }
    });
  });
}

/* ====================== START ====================== */

setupProductsPage();
setupContactForm();
