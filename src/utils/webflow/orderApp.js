import FileUploader from '../../extras/uploaderClass';

function orderAppFunctions() {
  const card = document.querySelector('[main-render-item="main"]');
  const duplicateCard = card.cloneNode(true);

  localStorage.setItem('orders-pieces', 1);
  localStorage.removeItem('orderFiles');
  setupAddCardButton(duplicateCard);
  addNewRequestItem(card);
}

// ! ITEM

function duplicateCard(card) {
  let newCard = card.cloneNode(true);
  const newCardBtn = document.querySelector('[render-app="add-new-item"]');
  newCardBtn.parentNode.insertBefore(newCard, newCardBtn); // insert new card before the

  //remove all element that has attribute data-template="duplicate"
  newCard.querySelectorAll('[data-template="duplicate"]').forEach((element) => {
    element.remove();
  });
  return newCard;
}

function removeCard(card) {
  card.remove();
}

function setupAddCardButton(card) {
  const addCardButton = document.querySelector('[render-app="add-new-item"]');
  addCardButton.addEventListener('click', () => {
    let newCard = duplicateCard(card);
    incrementLocalStorageItem('orders-pieces');
    setupNewCard(newCard);
  });
}

//? IMPORTANT FUNCTION ..............................
function setupNewCard(card) {
  addNewRequestItem(card);
  updateUploadersIDs(card);
}

function updateUploadersIDs(card) {
  const uploaders = card.querySelectorAll('.dropzone');
  const currentItem = localStorage.getItem('orders-pieces');
  let localCurrentItem = currentItem;
  uploaders.forEach((uploader) => {
    const uuid =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const id = `drop_zone_${uuid}`;
    uploader.id = id;
    uploader.setAttribute('data-upload-card', currentItem);
    // initialize the uploader

    const fileUploader = new FileUploader(id, `fileUploader${uuid}`);
    console.log(fileUploader);
    window[`fileUploader${uuid}`] = fileUploader;

    localCurrentItem++;
  });
}

function incrementLocalStorageItem(itemName) {
  // Retrieve the current value from localStorage
  let currentValue = localStorage.getItem(itemName);

  // Check if the value is null or not a number
  if (currentValue === null || isNaN(currentValue)) {
    currentValue = 0;
  } else {
    currentValue = parseInt(currentValue, 10);
  }

  // Increment the value by 1
  currentValue += 1;

  // Save the updated value back to localStorage
  localStorage.setItem(itemName, currentValue);
}

// ! RENDER
function dorpdownsSetup() {
  const dropdowns = document.querySelectorAll('[picker-dropdown="container"]');
  dropdowns.forEach((dropdown) => {
    const dropdownToggle = dropdown.querySelector('[picker-dropdown="trigger"]');
    const dropdownMenu = dropdown.querySelector('[picker-dropdown="target"]');
    dropdownToggle.addEventListener('click', () => {
      dropdownMenu.classList.toggle('show');
    });
  });
}

function addNewRequestItem(card) {
  const itemTemplate = card.querySelector('[render-template="request"]');
  const addItemBtn = card.querySelector('[render-action="new-item"]');
  const mainWrapper = card.querySelector('[data-render="main-wrapper"]');

  addItemBtn.addEventListener('click', () => {
    const newItem = itemTemplate.cloneNode(true);
    // add id to the new item
    newItem.id = `request-${Date.now()}`;
    newItem.setAttribute('data-template', 'duplicate');
    itemTemplate.parentNode.appendChild(newItem);
    addDeleteFunctionality(newItem);
  });
}

function addDeleteFunctionality(item) {
  const deleteBtn = item.querySelector('[render-item="delete"]');
  deleteBtn.addEventListener('click', () => {
    item.remove();
  });
}

export default orderAppFunctions;
