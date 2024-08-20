import OrderItem from './orderHistoryItem';

export const initOrderHistory = async () => {
  let api;
  if (process.env.NODE_ENV === 'development') {
    api = 'http://127.0.0.1:8787'; // Use local endpoint for development
  } else {
    api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
  }

  const token = localStorage.getItem('userToken');

  const userOrders = await fetch(`${api}/api/orders/orderhistory`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await userOrders.json();

  generateOrderHistoryUI(data);

  return data;
};

function generateOrderHistoryUI(data) {
  const orderHistoryContainer = document.querySelector('[data-history="list"]');
  const orderItemTemplate = document.querySelector('[data-history="template"]');
  if (!orderHistoryContainer) {
    console.log('orderHistory Field not found');
    return;
  }
  if (!orderItemTemplate) {
    console.log('orderItemTemplate Field not found');
    return;
  }
  removeLoader();
  data.forEach((order) => {
    const itemDomElement = orderItemTemplate?.cloneNode(true);
    itemDomElement.classList.remove('template');
    itemDomElement.style.display = 'flex';

    const orderItem = new OrderItem(order, itemDomElement);
    orderHistoryContainer.appendChild(orderItem.getItemDomElement());
    orderDetailsFiller(orderItem.getItemDomElement(), order);
    orderHistoryContainer.appendChild(itemDomElement);
  });
}

function removeLoader() {
  const loader = document.querySelector('[data-history="loader"]');
  if (loader) {
    loader.remove();
  }
}

function orderDetailsFiller(orderItem, order) {
  const date = orderItem.querySelector('[data-order-item="ph-order-date"]');
  const img = orderItem.querySelector('[data-order-item="ph-main-img"]');
  const state = orderItem.querySelector('[data-order-item="ph-order-status"]');
  const name = orderItem.querySelector('[data-order-item="ph-name"]');

  date.textContent = formatDateString(order.createdOn);
  //remove srcset from img
  img.removeAttribute('srcset');
  img.src = order.fieldData['uploaded-images'][0].url;
  state.textContent = order.fieldData['order-status'];
  name.textContent = order.fieldData.name;
}

function formatDateString(dateString: string) {
  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}
