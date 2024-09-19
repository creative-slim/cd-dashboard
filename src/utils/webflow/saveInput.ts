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

  if (!orderData) {
    return;
  }

  const elementId = element.id;

  if (element.matches(`[${DATA_BIG_CARD_ID}]`)) {
    // It's an OrderCard
    const cardId = element.getAttribute(DATA_BIG_CARD_ID);

    const index = orderData.findIndex((item: any) => item.id === cardId);

    if (index !== -1) {
      orderData.splice(index, 1);
    }
  } else if (element.matches('[render-item="container"]')) {
    // It's an OrderRender
    const cardElement = element.closest(`[${DATA_BIG_CARD_ID}]`) as HTMLElement;
    const cardId = cardElement.getAttribute(DATA_BIG_CARD_ID);

    const cardData = orderData.find((item: any) => item.id === cardId);

    if (cardData) {
      const renderElements = Array.from(cardElement.querySelectorAll('[render-item="container"]'));
      const renderIndex = renderElements.indexOf(element);

      if (renderIndex !== -1) {
        cardData.data.splice(renderIndex, 1);
      }
    }
  } else if (element.matches('[render-item="order-detail"]')) {
    // It's an OrderRenderDetail
    const renderElement = element.closest('[render-item="container"]') as HTMLElement;
    const cardElement = renderElement.closest(`[${DATA_BIG_CARD_ID}]`) as HTMLElement;
    const cardId = cardElement.getAttribute(DATA_BIG_CARD_ID);

    const cardData = orderData.find((item: any) => item.id === cardId);

    if (cardData) {
      const renderElements = Array.from(cardElement.querySelectorAll('[render-item="container"]'));
      const renderIndex = renderElements.indexOf(renderElement);

      if (renderIndex !== -1) {
        const renderData = cardData.data[renderIndex];

        if (renderData && renderData.orderRenderDetails) {
          const detailElements = Array.from(
            renderElement.querySelectorAll('[render-item="order-detail"]')
          );
          const detailIndex = detailElements.indexOf(element);

          if (detailIndex !== -1) {
            renderData.orderRenderDetails.splice(detailIndex, 1);
          }
        }
      }
    }
  }

  localStorage.setItem('orderData', JSON.stringify(orderData));
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
