// cart.js

import { cleanObject } from '$extras/helperFunctions';

// Function to get order data from localStorage
function getOrderData() {
  const orderDataStr = localStorage.getItem('orderData');
  if (orderDataStr) {
    try {
      const parsedData = JSON.parse(orderDataStr);
      const orderData = cleanObject(parsedData);
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

  const pricing = pricingMain(cartData);
  console.log('pricing--------------------- : ', pricing);
  const { orderPricing } = pricing;
  const { orderItemsListWithPricing } = pricing;

  // console.log('+++++++++++++++++++ cartData:', cartData);
  const cartContainer = document.querySelector('[data-render-list="cart"]');
  const orderTemplate = document.querySelector(
    '[cart-templates="order-item"]'
  ) as HTMLTemplateElement;

  const totalElement = document.querySelector('[data-order-cart="total"]');
  if (totalElement) {
    totalElement.innerHTML = '-';
  }

  if (!cartContainer || !orderTemplate) {
    console.error('One or more templates or the cart container are missing.');
    return;
  }

  if (!validateRequiredFields(cartData[0])) {
    return;
  }

  // Clear existing content before the loop
  cartContainer.innerHTML = '';

  // Use a DocumentFragment to batch DOM updates
  const fragment = document.createDocumentFragment();

  // data-order-cart="total"

  if (orderPricing && orderPricing.length > 0) {
    const totalAmount = orderPricing.reduce((sum, order) => {
      return sum + parseFloat(order.unit_amount.value);
    }, 0);

    const totalElement = document.querySelector('[data-order-cart="total"]');
    if (totalElement) {
      totalElement.innerHTML = totalAmount.toFixed(2);
    }
  }

  cartData.forEach((orderData, index: number) => {
    const resOrderElement = renderOrder(
      orderData,
      orderPricing[index],
      orderItemsListWithPricing[index],
      orderTemplate
    );
    if (resOrderElement) {
      fragment.appendChild(resOrderElement);
    }
  });

  // Append all elements to the cart container at once
  cartContainer.appendChild(fragment);
}

// Function to render a single order
function renderOrder(orderData, orderPricing, orderItemsListWithPricing, orderTemplate) {
  // Define the required fields for orderData.inputs
  const orderRequiredFields = ['item-name', 'item-width', 'item-height', 'item-length'];

  // Check if required fields are filled
  if (orderData) {
    if (!areRequiredFieldsFilled(orderData.inputs, orderRequiredFields)) {
      toggleButtonState(true);
      console.error('Required fields are missing or empty in orderData.inputs');
      return false; // Skip rendering this order or handle the error as needed
    }
  }

  const orderItemClone = orderTemplate.content.cloneNode(true) as DocumentFragment;
  const orderElement = orderItemClone.firstElementChild as HTMLElement;

  // console.log('pricing inside renderODer : ', orderItemsListWithPricing);

  if (!orderElement) {
    console.error('Order element not found in template.');
    return null;
  }

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
  if (
    orderItemsListWithPricing &&
    orderItemsListWithPricing.renderWithPrice &&
    orderItemsListWithPricing.renderWithPrice.length > 0
  ) {
    setElementTextContent(
      orderElement,
      '[data-order-cart="price"]',
      orderItemsListWithPricing.renderWithPrice[0].initialFee
    );
  }

  if (orderPricing && orderPricing.unit_amount && orderPricing.unit_amount.value) {
    setElementTextContent(
      orderElement,
      '[data-order-cart="sub-total"]',
      `${orderPricing.unit_amount.value} €`
    );
  }

  const renderTemplate = orderElement.querySelector(
    '[cart-templates="order-render"]'
  ) as HTMLTemplateElement;

  if (!renderTemplate) {
    console.error('Render template not found.');
    return null;
  }

  // Renders
  const rendersContainer = orderElement.querySelector('[data-order-cart="list"]');
  if (rendersContainer) {
    rendersContainer.innerHTML = ''; // Clear any existing renders

    if (Array.isArray(orderData.orderRenders) && orderItemsListWithPricing) {
      orderData.orderRenders.forEach((renderData, index) => {
        const resRenderElement = renderRender(
          renderData,
          orderItemsListWithPricing.renderWithPrice[index],
          renderTemplate
        );
        if (resRenderElement) {
          rendersContainer.appendChild(resRenderElement);
        }
      });
    }
  } else {
    console.error('Renders container not found.');
  }

  return orderElement;
}

// Function to render a single render
function renderRender(renderData, renderWithPrice, renderTemplate) {
  const renderItemClone = renderTemplate.content.cloneNode(true) as DocumentFragment;
  const renderElement = renderItemClone.firstElementChild as HTMLElement;

  if (!renderElement) {
    console.error('Render element not found in template.');
    return null;
  }

  // console.log(' ####################### >>> renderWithPrice : ', renderWithPrice);
  // Populate render details
  setElementTextContent(
    renderElement,
    '[data-order-cart="render-type"]',
    renderData.inputs['render-type'] || '--'
  );

  if (renderWithPrice) {
    setElementTextContent(
      renderElement,
      '[data-order-cart="render-price"]',
      renderWithPrice.renders[0].prices.renderPricing
    );
  }

  const renderDetailsTemplate = renderElement.querySelector(
    '[cart-templates="render-details"]'
  ) as HTMLTemplateElement;

  if (!renderDetailsTemplate) {
    console.error('Render details template not found.');
    return null;
  }

  // Render Details
  const renderDetailsContainer = renderElement.querySelector(
    '[order-cart="render-details-wrapper"]'
  );
  if (renderDetailsContainer) {
    renderDetailsContainer.innerHTML = ''; // Clear existing render details

    if (Array.isArray(renderData.orderRenderDetails) && renderWithPrice) {
      renderData.orderRenderDetails.forEach((detailData, index) => {
        const detailElement = renderRenderDetail(
          detailData,
          renderWithPrice.renders[index],
          renderDetailsTemplate
        );
        if (detailElement) {
          renderDetailsContainer.appendChild(detailElement);
        }
      });
    }
  } else {
    console.error('Render details container not found.');
  }

  return renderElement;
}

// Function to render a single render detail
function renderRenderDetail(detailData, detailsWithPrice, renderDetailsTemplate) {
  const renderDetailsClone = renderDetailsTemplate.content.cloneNode(true) as DocumentFragment;
  const renderDetailsElement = renderDetailsClone.firstElementChild as HTMLElement;

  if (!renderDetailsElement) {
    console.error('Render details element not found in template.');
    return null;
  }

  // console.log(' ####################### >>> detailsWithPrice : ', detailsWithPrice);

  // Populate render detail
  setElementTextContent(
    renderDetailsElement,
    '[data-order-cart="woodtype"]',
    detailData.inputs['woodtype'] || '--'
  );
  setElementTextContent(
    renderDetailsElement,
    '[data-order-cart="render-count"]',
    `x ${detailData.inputs['render-count']}` || '0'
  );
  setElementTextContent(
    renderDetailsElement,
    '[data-order-cart="landscape"]',
    detailData.inputs['aspect-ratio'] || '--'
  );
  const upholstryMaterial = detailData.inputs['upholstry-material'] || 'Ohne polsterung';
  const upholstryElement = renderDetailsElement.querySelector('[data-order-cart="other-material"]');

  if (upholstryElement) {
    if (upholstryMaterial === 'Ohne polsterung') {
      upholstryElement.parentElement.style.display = 'none';
    } else {
      upholstryElement.textContent = upholstryMaterial;
    }
  }
  setElementTextContent(
    renderDetailsElement,
    '[data-order-cart="request-comment"]',
    detailData.inputs['render-details-comment'] || 'Kein Kommentar'
  );

  if (detailsWithPrice) {
    setElementTextContent(
      renderDetailsElement,
      '[data-order-cart="price"]',
      detailsWithPrice.prices.prespectives
    );
  }

  return renderDetailsElement;
}

// Helper function to set text content of an element
function setElementTextContent(parentElement, selector, value) {
  const element = parentElement.querySelector(selector);
  if (element) {
    element.textContent = value;
  } else {
    console.warn(`Element with selector "${selector}" not found.`);
  }
}

function pricingMain(orderData) {
  // console.log('orderData : ', orderData);

  const orderPricing = [];
  const orderItemsListWithPricing = [];
  const prices = JSON.parse(localStorage.getItem('prices'));

  orderData.forEach((item) => {
    const orderItemDetails = {};
    orderItemDetails.data = item;
    orderItemDetails.renderWithPrice = [];
    const alreadyProcessedWoodtypes = [];
    const feeAlreadyPayed = false;
    const provided3DModel = item.inputs['three-d-modelling'] === 'provide' ? true : false;
    // console.log('🤓 provided3DModel : ', provided3DModel);
    const initialFee = provided3DModel ? prices.base.render : prices.base.build;
    // console.log('🤓 initialFee : ', initialFee);
    // orderPricing.base = prices.base;
    const allRenderPricing = [{ initialFee }];

    item.orderRenders.forEach((render, index) => {
      const renderPricing = {};
      const orderDetails = {
        renders: [],
        renderCategory: render.inputs['render-type'],
        initialFee,
      };
      const AlreadyProcessedWoodtypes = [];
      let includeRenderPrice = true;
      let buildingFeeAlreadyPayed = false;

      if (!render.inputs['render-type']) {
        return;
      }

      const renderType = render.inputs['render-type'];
      // const woodType = render.render.woodtype;
      // const amount = render.render["render-count"];
      const renderDetails = render.orderRenderDetails;

      // renderPricing.render = prices.render[renderType];
      //!old pricing logic
      //renderPricing.render = prices[renderType].build;

      //!new pricing logic
      if (!buildingFeeAlreadyPayed) {
        renderPricing.render = prices[renderType].build;
        buildingFeeAlreadyPayed = true;
      } else {
        renderPricing.render = prices[renderType].render;
      }
      // console.log("renderPricing : ", renderPricing);
      //! end of new pricing logic

      // renderPricing.prespectives = prices[renderType].render * (amount - 1);

      // orderDetails.renderCategory = renderType;
      // orderDetails.orderFree = initialFee;

      renderDetails.forEach((detail) => {
        const woodType = detail.inputs.woodtype;
        const detailsPricing = { prices: {}, details: {} };
        // console.log(' detail woodType : ', woodType);

        if (alreadyProcessedWoodtypes.includes(woodType)) {
          // console.log('already processed ', woodType);
          detailsPricing.prices.woodtype = 0;
        } else {
          detailsPricing.prices.woodtype = prices.woodtype.generic;
          alreadyProcessedWoodtypes.push(woodType);
        }

        // console.log(
        //   'detailsPricing : ',
        //   detailsPricing,
        //   ' woodType : ',
        //   woodType,
        //   ' alreadyProcessedWoodtypes : ',
        //   alreadyProcessedWoodtypes,
        //   ' renderDetails : ',
        //   renderDetails
        // );

        detailsPricing.prices.prespectives =
          prices[renderType].render * detail.inputs['render-count'] +
          detailsPricing.prices.woodtype;

        detailsPricing.details.inputs = detail.inputs;

        let renderfee = 0;
        if (includeRenderPrice) {
          includeRenderPrice = false;
          renderfee = renderPricing.render;
        }
        detailsPricing.prices.renderPricing = renderfee;
        detailsPricing.prices.initialFee = initialFee;
        detailsPricing.prices.rendersCountPrice =
          prices[renderType].render * detail.inputs['render-count'];
        detailsPricing.details.renderType = renderType;
        detailsPricing.details.pricing = detailsPricing.prices;

        // console.log('total detailsPricing : ', detailsPricing);
        orderDetails.renders.push(detailsPricing);
        allRenderPricing.push(detailsPricing);

        // console.log('allRenderPricing : ', allRenderPricing);
      });
      orderItemDetails.renderWithPrice.push(orderDetails);
    });
    orderItemsListWithPricing.push(orderItemDetails);

    function calculateTotal(allRenderPricing) {
      return allRenderPricing.reduce((total, item) => {
        // Add initialFee if it exists
        if (item.initialFee) {
          total += item.initialFee;
        }

        // Add prespectives from prices if they exist
        if (item.prices && typeof item.prices.prespectives === 'number') {
          total += item.prices.prespectives;
        }
        // Add renderPricing from prices if they exist
        if (item.prices && typeof item.prices.renderPricing === 'number') {
          total += item.prices.renderPricing;
        }

        return total;
      }, 0);
    }

    const paymentOrderDetails = {
      name: item.inputs['item-name'],
      quantity: '1',

      description: item.inputs['item-name'],
      category: 'DIGITAL_GOODS',
      allRenderPricing,
      unit_amount: {
        currency_code: 'EUR',
        value: `${calculateTotal(allRenderPricing)}`,
        breakdown: {
          item_total: {
            currency_code: 'EUR',
            value: `${calculateTotal(allRenderPricing)}`,
          },
        },
      },
    };
    // console.log('paymentOrderDetails : ', paymentOrderDetails);

    orderPricing.push(paymentOrderDetails);
  });

  return { orderPricing, orderItemsListWithPricing };
}

// Helper function to check if required fields are filled
function areRequiredFieldsFilled(dataObject, requiredFields) {
  return requiredFields.every(
    (field) =>
      dataObject.hasOwnProperty(field) &&
      dataObject[field] !== undefined &&
      dataObject[field] !== null &&
      dataObject[field].toString().trim() !== ''
  );
}

function validateRequiredFields(orderData) {
  // Define the required fields for orderData.inputs
  const orderRequiredFields = ['item-name', 'item-width', 'item-height', 'item-length'];

  // Check if required fields are filled
  if (orderData) {
    if (!areRequiredFieldsFilled(orderData.inputs, orderRequiredFields)) {
      toggleButtonState(true);
      console.error('Required fields are missing or empty in orderData.inputs');
      return false; // Skip rendering this order or handle the error as needed
    }
  }

  // Define the required fields for renderData.inputs
  const renderRequiredFields = ['render-type'];

  // Check if required fields are filled
  if (orderData) {
    if (!areRequiredFieldsFilled(orderData.orderRenders[0].inputs, renderRequiredFields)) {
      toggleButtonState(true);
      console.error('Required fields are missing or empty in renderData.inputs');
      return false; // Skip rendering this render or handle the error as needed
    }
  }

  const renderDetailsRequiredFields = ['woodtype', 'render-count', 'aspect-ratio'];

  // Check if required fields are filled
  if (orderData) {
    if (
      !areRequiredFieldsFilled(
        orderData.orderRenders[0].orderRenderDetails[0].inputs,
        renderDetailsRequiredFields
      )
    ) {
      toggleButtonState(true);
      console.error('Required fields are missing or empty in renderData.inputs');
      return false; // Skip rendering this render or handle the error as needed
    }
  }

  toggleButtonState(false);
  return true;
}

// data-order-cart="toggle-btn" make this button opacity 50% and unclickable
function toggleButtonState(disable: boolean) {
  const button = document.querySelector('[data-order-cart="toggle-btn"]');
  if (button) {
    if (disable) {
      button.style.opacity = '0.5';
      button.style.pointerEvents = 'none';
    } else {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    }
  }
}
