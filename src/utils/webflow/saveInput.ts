// Constants
// import { cleanObject, restructureData } from '../../extras/helperFunctions';
// src/webflow/saveInput.ts
import { cleanObject, restructureData } from '../../extras/helperFunctions';

const ORDER_DATA_KEY = 'orderData';
const DATA_BIG_CARD_ID = 'data-big-card-id';

export function saveData() {
  console.log('Saving data');
  const orderCards = document.querySelectorAll(`[${DATA_BIG_CARD_ID}]`);
  const storedLocalData = [];

  orderCards.forEach((cardElement) => {
    const cardId = cardElement.getAttribute(DATA_BIG_CARD_ID);

    if (!cardId) {
      return;
    }

    const orderCardData = {
      id: cardId,
      data: [],
    };

    const orderRenders = cardElement.querySelectorAll('[render-item="container"]');

    orderRenders.forEach((renderElement) => {
      const renderData: any = {};

      // Collect inputs from OrderRender
      const renderInputs = renderElement.querySelectorAll('input, textarea, select');

      renderInputs.forEach((input) => {
        if (input.closest('[render-template="order-detail"]')) {
          // Skip inputs within OrderRenderDetails
          return;
        }

        if (input.type === 'checkbox') {
          renderData[input.id] = input.checked ? 'true' : 'false';
        } else {
          renderData[input.id] = input.value;
        }
      });

      // Now collect OrderRenderDetails
      const orderRenderDetails = [];

      const orderRenderDetailElements = renderElement.querySelectorAll(
        '[render-item="order-detail"]'
      );

      orderRenderDetailElements.forEach((detailElement) => {
        const detailData: any = {};
        const detailInputs = detailElement.querySelectorAll('input, textarea, select');

        detailInputs.forEach((input) => {
          if (input.type === 'checkbox') {
            detailData[input.id] = input.checked ? 'true' : 'false';
          } else {
            detailData[input.id] = input.value;
          }
        });

        orderRenderDetails.push(detailData);
      });

      if (orderRenderDetails.length > 0) {
        renderData['orderRenderDetails'] = orderRenderDetails;
      }

      console.log('Render data:', renderData);
      console.log('Order render details:', orderRenderDetails);
      orderCardData.data.push(renderData);
    });

    storedLocalData.push(orderCardData);
  });

  localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(storedLocalData));
  localStorage.setItem(
    `CLEAN_${ORDER_DATA_KEY}`,
    JSON.stringify(restructureData(cleanObject(storedLocalData)))
  );
}

export function removeObjectByElementIdFromLocalStorage(element: HTMLElement) {
  const orderData = JSON.parse(localStorage.getItem('orderData') || '[]');

  localStorage.setItem('orderData', JSON.stringify(orderData));
}

/**
 * Removes all objects with the specified id from the 'orderData' array stored in localStorage.
 *
 * @param {string} idToRemove - The id of the object to remove.
 * @returns {Array} - A new array with the specified objects removed.
 */
export function removeObjectById(idToRemove) {
  console.log('Removing object with id:', idToRemove);
  // Retrieve the array from localStorage and parse it
  const arr = JSON.parse(localStorage.getItem('orderData')) || [];

  /**
   * Recursively filters out objects with the specified id.
   *
   * @param {Array} items - The array of objects to filter.
   * @returns {Array} - The filtered array.
   */
  const recursiveFilter = (items) => {
    return (
      items
        // Remove objects with the matching id
        .filter((item) => item.id !== idToRemove)
        // Traverse each object to handle nested arrays
        .map((item) => {
          // Create a shallow copy to avoid mutating the original object
          const newItem = { ...item };

          // Iterate over each key in the object
          Object.keys(newItem).forEach((key) => {
            const value = newItem[key];

            // If the value is an array, apply the recursive filter
            if (Array.isArray(value)) {
              newItem[key] = recursiveFilter(value);
            }
          });

          return newItem;
        })
    );
  };

  // Apply the recursive filter to the array
  const filteredArr = recursiveFilter(arr);

  console.log('Filtered array:', filteredArr);

  // Optionally, update the localStorage with the filtered array
  localStorage.setItem('orderData', JSON.stringify(filteredArr));

  return filteredArr;
}

//!old code
// export function saveAllData() {
//   saveData();
// }

export function saveAllData(appInstance: App) {
  try {
    if (!appInstance || !appInstance.orderCards) {
      return;
    }
    const storedLocalData = appInstance.orderCards.map((orderCard) => orderCard.getData());

    if (!storedLocalData) {
      return;
    }
    localStorage.setItem('orderData', JSON.stringify(storedLocalData));
    localStorage.setItem(
      `CLEAN_orderData`,
      JSON.stringify(restructureData(cleanObject(storedLocalData)))
    );
  } catch (error) {
    console.error('Error saving data:', error);
    // Handle the error here, e.g. show an error message to the user
  }
}
