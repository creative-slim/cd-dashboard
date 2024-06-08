function orderAppFunctions() {
  const card = document.querySelector('[main-render-item="main"]');

  setupAddCardButton(card);
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
    setupNewCard(newCard);
  });
}

function setupNewCard(card) {
  addNewRequestItem(card);
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
