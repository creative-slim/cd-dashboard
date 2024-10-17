import { errorModal } from '$extras/inputsChecker.js';

import { fullfillOrder } from './buttonsActions';
import getAllOrders from './getAllOrders';
import { fillOrderDetails } from './orderDetails';

export default async function dashboardUI() {
  const allOrdersList = document.querySelector('[data-console-selection="list"]');
  const listItemTemplate = document.querySelector(
    '[data-order-item="trigger"]'
  ) as HTMLTemplateElement;

  // Validate the presence of required DOM elements
  if (!allOrdersList || !listItemTemplate) {
    console.error('Essential DOM elements missing.');
    return;
  }

  try {
    const allOrders = await getAllOrders();
    if (!allOrders || allOrders.length === 0) {
      console.error('No orders found.');
      hideLoader();
      return;
    }

    hideLoader();

    const fragment = document.createDocumentFragment();

    // Process each order and append to the DOM
    allOrders.forEach((order) => {
      const clonedListItem = listItemTemplate.content.cloneNode(true) as DocumentFragment;
      const listItem = clonedListItem.firstElementChild as HTMLElement;
      const orderData = order.fieldData;

      if (!orderData) {
        console.error('Order data missing for order:', order);
        return;
      }

      const itemElement = listItem.querySelector('.order-console_item');
      if (!itemElement) {
        console.error('Order console item missing in the template.');
        return;
      }

      // Add a vertical "DEV" text for creative-directors.com users
      if (orderData['user-mail']?.includes('creative-directors.com')) {
        itemElement.appendChild(createVerticalText());
      }

      // Fill in the order details
      fillOrderElement(listItem, orderData);

      // Attach click event for toggling order details
      listItem.addEventListener('click', () => {
        try {
          fillOrderDetails(JSON.parse(orderData['payment-info']));
          setupButtons(order);
        } catch (error) {
          console.error('Error parsing payment info for order:', orderData['order-id']);
        }
        resetOpenClass();
        itemElement.classList.toggle('open');
        itemElement.setAttribute(
          'aria-expanded',
          itemElement.classList.contains('open').toString()
        );
      });

      fragment.appendChild(listItem);
    });

    // Append all processed orders in one go
    allOrdersList.appendChild(fragment);
    resetOpenClass();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// Utility function to hide loader
function hideLoader() {
  const loader = document.querySelector('[data-history="loader"]');
  if (loader) {
    loader.style.display = 'none';
  }
}

// Utility function to reset the "open" class
function resetOpenClass() {
  const openItems = document.querySelectorAll('.open');
  openItems.forEach((item) => {
    item.classList.remove('open');
    item.setAttribute('aria-expanded', 'false');
  });
}

// Utility function to format date
function formatDate(dateString: string) {
  if (!dateString) {
    console.error('Date string is missing');
    return 'Unknown Date';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error('Invalid date format:', dateString);
    return 'Invalid Date';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Utility function to fill order details into the DOM
function fillOrderElement(listItem: HTMLElement, orderData: any) {
  const idElement = listItem.querySelector('[data-console="id"]');
  const dateElement = listItem.querySelector('[data-console="date"]');

  if (idElement) {
    idElement.textContent = orderData['order-id'] || 'Unknown ID';
  }
  if (dateElement) {
    dateElement.textContent = formatDate(orderData['order-date']);
  }
}

// Utility function to create vertical text (DEV)
function createVerticalText() {
  const div = document.createElement('div');
  div.style.width = '12px';
  div.style.height = '100%';
  div.style.backgroundColor = '#7a0000';
  div.style.color = '#a5a5a5';
  div.style.position = 'absolute';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.justifyContent = 'center';
  div.style.alignItems = 'center';
  div.style.fontSize = '12px';
  div.style.lineHeight = '1';
  div.style.left = '0';

  const letters = ['D', 'E', 'V'];
  letters.forEach((letter) => {
    const span = document.createElement('span');
    span.textContent = letter;
    div.appendChild(span);
  });

  return div;
}

function setupButtons(data) {
  const fullfillButton = document.querySelector('[data-console-action="fulfill"]');

  if (!fullfillButton) {
    console.error('fullfill Button button not found.');
    return;
  }

  fullfillButton.addEventListener('click', () => {
    fullfillOrderFunction(data);
  });
}

const fullfillOrderFunction = (data) => {
  //call the fullfillOrder function from the buttonsActions.ts file
  errorModal('Are you sure you want to fullfill this order?');
  fullfillOrder(data.id);
};
