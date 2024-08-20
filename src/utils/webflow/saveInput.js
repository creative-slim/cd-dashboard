// Constants
const ORDER_DATA_KEY = 'orderData';
const DATA_BIG_CARD_ID = 'data-big-card-id';
const RENDER_NUMBER = 'render-number';

// Helper functions
const getRenderNumber = (element) =>
  parseInt(element.closest(`[${RENDER_NUMBER}]`)?.getAttribute(RENDER_NUMBER), 10) || 0;

const extractData = (inputElements) => {
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
};

// Main function
export function saveData(currentCard, container) {
  // console.log('------- save Data -------');

  if (!currentCard || !container) {
    console.error('Current card or container is not provided.');
    return;
  }

  const inputs = currentCard.querySelectorAll('input, textarea, select');
  // console.log('current Card', currentCard);

  let storedLocalData;
  try {
    storedLocalData = JSON.parse(localStorage.getItem(ORDER_DATA_KEY)) || [];
  } catch (error) {
    console.error('Error parsing local storage data:', error);
    storedLocalData = [];
  }

  // console.log('container', container);
  const cardContainer = container.closest(`[${DATA_BIG_CARD_ID}]`);
  if (!cardContainer) {
    console.error('Card container with specified DATA_BIG_CARD_ID not found.');
    return;
  }

  const cardId = cardContainer.getAttribute(DATA_BIG_CARD_ID);
  if (!cardId) {
    console.error('Card ID not found.');
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
}
