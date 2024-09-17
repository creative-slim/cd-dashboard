// Constants
import { cleanObject, restructureData } from '../../extras/helperFunctions';
const ORDER_DATA_KEY = 'orderData';
const DATA_BIG_CARD_ID = 'data-big-card-id';
const RENDER_NUMBER = 'render-number';

// Helper functions
const getRenderNumber = (element) =>
  parseInt(element.closest(`[${RENDER_NUMBER}]`)?.getAttribute(RENDER_NUMBER), 10) || 0;

const extractData = (inputElements) => {
  try {
    const data = [];
    inputElements.forEach((input) => {
      const number = getRenderNumber(input);
      if (!data[number]) {
        data[number] = { render: {} };
      }
      if (input.type === 'checkbox') {
        data[number].render[input.id] = input.checked ? 'true' : 'false';
      } else {
        data[number].render[input.id] = input.value;
      }
    });
    return data;
  } catch (error) {
    //console.error('Error extracting data:', error);
    return [];
  }
};

// Main function
export function saveData(currentCard, container) {
  console.log('------- save Data -------');
  console.log('currentCard', currentCard, 'container', container);
  // debugger;

  if (!currentCard || !container) {
    //console.error('Current card or container is not provided.');
    return;
  }

  const inputs = currentCard.querySelectorAll('input, textarea, select');
  // console.log('current Card', currentCard);

  let storedLocalDataRaw;
  try {
    storedLocalDataRaw = JSON.parse(localStorage.getItem(ORDER_DATA_KEY)) || [];
  } catch (error) {
    //console.error('Error parsing local storage data:', error);
    storedLocalDataRaw = [];
  }

  const storedLocalData = filterArrayByItemName(storedLocalDataRaw);

  // console.log('container', container);
  const cardContainer = container.closest(`[${DATA_BIG_CARD_ID}]`);
  if (!cardContainer) {
    //console.error('Card container with specified DATA_BIG_CARD_ID not found.');
    return;
  }

  const cardId = cardContainer.getAttribute(DATA_BIG_CARD_ID);
  if (!cardId) {
    //console.error('Card ID not found.');
    return;
  }

  // console.log('################################checkIfRender', getRenderNumber(currentCard));

  const found = storedLocalData.find((element) => element.id === cardId);
  const extractedData = extractData(inputs);

  if (found) {
    extractedData.forEach((extractedItem, index) => {
      if (found.data[index]) {
        found.data[index].render = { ...found.data[index].render, ...extractedItem.render };
      } else {
        found.data[index] = extractedItem;
      }
    });
  } else {
    const inputData = {
      id: cardId,
      data: extractedData,
    };
    storedLocalData.push(inputData);
  }

  console.log('storedLocalData', storedLocalData);
  localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(storedLocalData));
  localStorage.setItem(
    `CLEAN_${ORDER_DATA_KEY}`,
    JSON.stringify(restructureData(cleanObject(storedLocalData)))
  );

  try {
    const rd = restructureData(cleanObject(storedLocalData));
    console.log('++++++++++++++++   Restructured data:', rd);
  } catch (error) {
    //console.error('Error restructuring data:', error);
  }

  try {
    const x = cleanObject(storedLocalData);
    console.log('++++++++++++++++   Cleaned object:', x);
  } catch (error) {
    //console.error('Error cleaning object:', error);
  }
}

function filterArrayByItemName(array) {
  // Filter the main array to keep only objects where at least one data item has "item-name" in render keys
  return array.filter((item) => {
    if (item.data) {
      // Check if any of the data items have a render key that starts with "item-name"
      return item.data.some((subItem) =>
        Object.keys(subItem.render || {}).some((key) => key.startsWith('item-name'))
      );
    }
    return false; // Exclude items without data
  });
}

export function removeObjectByElementIdFromLocalStorage(element) {
  // Step 1: Read the object from local storage
  const orderData = JSON.parse(localStorage.getItem('orderData'));

  if (!orderData) {
    //console.error('No orderData found in local storage');
    return;
  }

  // Step 2: Extract the unique number from the element's ID
  const elementId = element.id; // Example: 'request-1725004461177'
  const uniqueNumber = elementId.match(/\d+$/)[0]; // Extract the number at the end

  // Step 3: Modify the orderData object by removing the related object
  orderData.forEach((item, index) => {
    if (item.data) {
      item.data = item.data.filter((subItem) => {
        // Check if the subItem has the render object and if it matches the unique number

        //! do not return if it's null
        return !Object.keys(subItem.render || {}).some((key) => key.includes(uniqueNumber));
      });

      // If the filtered data array is empty, remove the entire item
      if (item.data.length === 0) {
        orderData.splice(index, 1);
        console.log('Item removed from orderData:', item);
      }
    }
  });

  // Step 4: Save the modified object back to local storage

  localStorage.setItem('orderData', JSON.stringify(orderData));

  // Optional: Return the updated data (for debugging or further use)
  return orderData;
}

export function saveAllData() {
  const cards = document.querySelectorAll(`[${DATA_BIG_CARD_ID}]`);
  cards.forEach((card) => {
    const container = card.closest(`[${DATA_BIG_CARD_ID}]`);
    saveData(card, container);
  });

  console.log('All data saved.');
}
