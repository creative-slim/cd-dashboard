import FileUploader from '../../extras/uploaderClass';
import { saveData } from './saveInput';

function orderAppFunctions() {
  const card = document.querySelector('[main-render-item="main"]');
  saveData(card, card.closest('[main-render-item="main"]'));
  setupNewCard(card);
  const duplicateCard = card.cloneNode(true);

  localStorage.setItem('orders-pieces', 1);
  localStorage.removeItem('orderFiles');
  localStorage.removeItem('orderData');
  setupAddCardButton(duplicateCard);
  addNewRequestItem(duplicateCard);
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

function setupAddCardButton(card) {
  const addCardButton = document.querySelector('[render-app="add-new-item"]');
  addCardButton.addEventListener('click', () => {
    let newCard = duplicateCard(card);
    setupNewCard(newCard);
    incrementLocalStorageItem('orders-pieces');
  });
}

//? IMPORTANT FUNCTION ..............................
function setupNewCard(card) {
  card.id = `card-${Date.now()}`;
  card.setAttribute('data-big-card-id', getTotalNumberOfCards());
  card.querySelectorAll('*').forEach((elem) => {
    if (!elem.dataset.excludeIdSwap) {
      if (elem.id) {
        elem.id = `${elem.id}__${Date.now()}`;
      }
    }

    elem.addEventListener('change', () => {
      saveData(card, card.closest('[main-render-item="main"]'));
    });
  });
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
    const uniqueSuffix = Date.now();
    const renderNumber = card
      .closest('[main-render-item]')
      .querySelectorAll('[render-item="container"]').length;
    console.log('this render number is : ', { renderNumber }, card.closest('[main-render-item]'));

    // add id to the new item
    newItem.id = `request-${Date.now()}`;
    newItem.setAttribute('data-template', 'duplicate');
    newItem.setAttribute('render-number', renderNumber + 1);

    // Function to update IDs of child elements to be unique
    function updateElementIds(element, suffix) {
      const elementsWithId = element.querySelectorAll('[id]');
      elementsWithId.forEach((el) => {
        el.id = `${el.id}_${suffix}`;
      });
      saveData(newItem, card.closest('[main-render-item="main"]'));
    }

    // Call the function to update IDs for the new item
    updateElementIds(newItem, uniqueSuffix);
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

function getTotalNumberOfCards() {
  const allCards = document.querySelectorAll('[main-render-item="main"]');
  return allCards.length;
}

export default orderAppFunctions;
