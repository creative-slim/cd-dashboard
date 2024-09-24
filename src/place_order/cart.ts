// cart.js

import { cleanObject } from '$extras/helperFunctions';

// Function to get order data from localStorage
function getOrderData() {
  const orderDataStr = localStorage.getItem('orderData');
  if (orderDataStr) {
    try {
      const orderData = JSON.parse(cleanObject(orderDataStr));
      console.log('%c-------------- Cart data', 'color: green', orderData);
      return orderData;
    } catch (error) {
      console.error('Error parsing orderData from localStorage:', error);
      return [];
    }
  } else {
    return [];
  }
}

// Function to render the cart UI
export function renderCart() {
  const cartData = getOrderData();
  const cartContainer = document.querySelector('[data-render-list="cart"]');
  const orderTemplate = document.querySelector('[cart-templates="order-item"]');
  const renderTemplate = document.querySelector('[cart-templates="order-render"]');
  const renderDetailsTemplate = document.querySelector('[cart-templates="render-details"]');

  if (!cartContainer || !orderTemplate || !renderTemplate || !renderDetailsTemplate) {
    console.error('One or more templates or the cart container are missing.');
    return;
  }

  // cartContainer.innerHTML = ''; // Clear existing content

  cartData.forEach((orderData) => {
    const orderElement = renderOrder(
      orderData,
      orderTemplate,
      renderTemplate,
      renderDetailsTemplate
    );
    cartContainer.appendChild(orderElement);
  });
}

// Function to render a single order
function renderOrder(orderData, orderTemplate, renderTemplate, renderDetailsTemplate) {
  const orderElement = orderTemplate.cloneNode(true);
  orderElement.style.display = 'block'; // Ensure the element is visible

  // Populate order details
  setElementTextContent(
    orderElement,
    '[data-order-cart="item-name"]',
    orderData.inputs['item-name'] || '--'
  );
  setElementTextContent(
    orderElement,
    '[data-order-cart="item-width"]',
    orderData.inputs['item-width'] || '0'
  );
  setElementTextContent(
    orderElement,
    '[data-order-cart="item-height"]',
    orderData.inputs['item-height'] || '0'
  );
  setElementTextContent(
    orderElement,
    '[data-order-cart="item-length"]',
    orderData.inputs['item-length'] || '0'
  );
  setElementTextContent(
    orderElement,
    '[data-order-cart="item-details"]',
    orderData.inputs['item-details'] || '--'
  );

  // Renders
  const rendersContainer = orderElement.querySelector('[data-order-cart="list"]');
  rendersContainer.innerHTML = ''; // Clear any existing renders

  if (Array.isArray(orderData.orderRenders)) {
    orderData.orderRenders.forEach((renderData) => {
      const renderElement = renderRender(renderData, renderTemplate, renderDetailsTemplate);
      rendersContainer.appendChild(renderElement);
    });
  }

  return orderElement;
}

// Function to render a single render
function renderRender(renderData, renderTemplate, renderDetailsTemplate) {
  const renderElement = renderTemplate.cloneNode(true);
  renderElement.style.display = 'block'; // Ensure the element is visible

  // Populate render details
  setElementTextContent(
    renderElement,
    '[data-order-cart="render-type"]',
    renderData.inputs['render-type'] || '--'
  );

  // Render Details
  const renderDetailsContainer = renderElement.querySelector(
    '[order-cart="render-details-wrapper"]'
  );
  renderDetailsContainer.innerHTML = ''; // Clear existing render details

  if (Array.isArray(renderData.orderRenderDetails)) {
    renderData.orderRenderDetails.forEach((detailData) => {
      const detailElement = renderRenderDetail(detailData, renderDetailsTemplate);
      renderDetailsContainer.appendChild(detailElement);
    });
  }

  return renderElement;
}

// Function to render a single render detail
function renderRenderDetail(detailData, renderDetailsTemplate) {
  const detailElement = renderDetailsTemplate.cloneNode(true);
  detailElement.style.display = 'flex'; // Ensure the element is visible

  // Populate render detail
  setElementTextContent(
    detailElement,
    '[data-order-cart="woodtype"]',
    detailData.inputs['woodtype'] || '--'
  );
  setElementTextContent(
    detailElement,
    '[data-order-cart="render-count"]',
    detailData.inputs['render-count'] || '0'
  );
  setElementTextContent(
    detailElement,
    '[data-order-cart="landscape"]',
    detailData.inputs['aspect-ratio'] || '--'
  );
  setElementTextContent(
    detailElement,
    '[data-order-cart="other-material"]',
    detailData.inputs['upholstry-material'] || '--'
  );
  setElementTextContent(
    detailElement,
    '[data-order-cart="request-comment"]',
    detailData.inputs['render-details-comment'] || '--'
  );

  return detailElement;
}

// Helper function to set text content of an element
function setElementTextContent(parentElement, selector, value) {
  const element = parentElement.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}
