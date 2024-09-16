function getDataFromLocalStorage(key) {
  if (!key) {
    console.error('Key is not provided.');
    return [];
  }
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing local storage data:', error);
    return [];
  }
}

const template = document.querySelector('[data-render-info="template"]');
if (!template) {
  console.error('Template not found.');
}

function createItemHTML(item) {
  if (!item) {
    console.error('Item or item.render is not provided.');
    return document.createElement('div'); // Return an empty div to prevent errors
  }
  if (!template) {
    console.error('Template not found.');
    return document.createElement('div'); // Return an empty div to prevent errors
  }

  const clone = template.cloneNode(true);
  clone.style.display = 'block';
  clone.removeAttribute('data-render-info');

  const stripSuffix = (key) => key.split('__')[0];

  const cleanItem = cleanObject(item);
  calculateTotal(cleanItem);
  item = cleanItem;

  const totalElement = document.querySelector('[data-order-cart="total"]');
  const subTotal = item['sub-total'];

  if (subTotal === '-') {
    if (totalElement) {
      totalElement.textContent = '-';
    }
  } else {
    let item_TOTAL = parseInt(totalElement.textContent);
    if (isNaN(item_TOTAL)) {
      item_TOTAL = 0;
    }
    const total = item_TOTAL + subTotal;
    if (totalElement) {
      totalElement.textContent = total;
    }
  }

  // Update elements inside the clone
  Object.keys(item).forEach((key) => {
    const element = clone.querySelector(`[data-order-cart="${key}"]`);
    if (element) {
      const value = item[key] !== undefined ? item[key] : '-';

      if (value !== undefined) {
        if (element.tagName === 'SPAN') {
          element.textContent = value;
        } else if (element.tagName === 'P') {
          element.textContent = value;
        } else if (element.tagName === 'DIV') {
          element.innerHTML = value;
        }
      }
    }
  });

  const cloneItem = clone.querySelector('[data-order-cart="render"]');
  const rendersList = clone.querySelector('[data-order-cart="list"]');
  if (cloneItem) {
    item.renders.forEach((render) => {
      const renderClone = cloneItem.cloneNode(true);
      renderClone.style.display = 'flex';
      renderClone.removeAttribute('data-order-cart');

      Object.keys(render).forEach((key) => {
        const element = renderClone.querySelector(`[data-order-cart="${key}"]`);

        if (element) {
          const value = render[key] !== undefined ? render[key] : '-';

          if (value !== undefined) {
            if (element.tagName === 'SPAN') {
              element.textContent = value;
            } else if (element.tagName === 'P') {
              element.textContent = value;
            } else if (element.tagName === 'DIV') {
              element.innerHTML = value;
            }
          }
        }
      });

      rendersList.appendChild(renderClone);
    });

    cloneItem.remove();
  }

  return clone;
}

type prices = {
  base: {
    build: number;
    render: number;
  };
  woodtype: {
    generic: number;
  };
  scene: {
    build: number;
    render: number;
  };
  knockout: {
    build: number;
    render: number;
  };
};

function calculateTotal(data) {
  const Prices = JSON.parse(localStorage.getItem('prices')) as prices;
  const provided3DModeltext = data['Provided-3D-Model'];
  const woodtypePrice = Prices.woodtype.generic;
  let totalPrice = Prices.base.render;
  const arrayOfUsedWoodTypes = [];

  const provided3DModel = provided3DModeltext === 'true' ? true : false;

  if (!provided3DModel) {
    totalPrice = totalPrice + Prices.base.build;
  }
  data['price'] = totalPrice;

  let invalidTotal = false;

  data.renders.forEach((render) => {
    const renderType = render['render-type'];
    const renderCount = render['render-count'];

    if (!renderType || !renderCount) {
      invalidTotal = true;
      render['price'] = '-';
      return;
    }

    const quantity = parseInt(renderCount);
    let renderPrice = 0;

    if (render['woodtype']) {
      if (!arrayOfUsedWoodTypes.includes(render['woodtype'])) {
        arrayOfUsedWoodTypes.push(render['woodtype']);
        renderPrice = renderPrice + woodtypePrice;
      } else {
        renderPrice = renderPrice + 0;
      }
    }
    if (render['render-type'] === 'scene') {
      if (!isNaN(Prices.scene.build) && !isNaN(Prices.scene.render)) {
        renderPrice = renderPrice + Prices.scene.build + Prices.scene.render * (quantity - 1);
      }
      console.log('renderPrice scene', renderPrice);
    }
    if (render['render-type'] === 'knockout') {
      if (!isNaN(Prices.knockout.build) && !isNaN(Prices.knockout.render)) {
        renderPrice = renderPrice + Prices.knockout.build + Prices.knockout.render * (quantity - 1);
      }
      console.log('renderPrice knock', renderPrice);
    }

    console.log({ totalPrice, renderPrice, quantity, provided3DModel });

    if (!isNaN(renderPrice)) {
      totalPrice = totalPrice + renderPrice;
    }

    render['price'] = renderPrice;
  });

  data['sub-total'] = invalidTotal ? '-' : totalPrice;

  // Update global validity flag
  if (invalidTotal) {
    window.isOrderValid = false;
  }
}

function displayContent(element) {
  if (!element) {
    console.error('Element selector is not provided.');
    return;
  }

  // Reset the global validity flag
  window.isOrderValid = true;

  const data = getDataFromLocalStorage('orderData');
  const structuredData = restructureData(data);

  const content = document.querySelector(element);
  if (!content) {
    console.error('Content element not found.');
    return;
  }

  content.innerHTML = ''; // Clear existing content
  const totalElement = document.querySelector('[data-order-cart="total"]');
  if (totalElement) {
    totalElement.textContent = 0;
  }

  structuredData.forEach((entry) => {
    if (!entry.data) return;
    entry.data.forEach((subEntry) => {
      const itemHTML = createItemHTML(subEntry);
      content.appendChild(itemHTML);
    });
  });

  // Enable or disable the toggle button based on order validity
  const toggleButton = document.querySelector('[data-order-cart="toggle-btn"]');
  if (toggleButton) {
    if (window.isOrderValid) {
      toggleButton.style.opacity = 1;
      toggleButton.style.pointerEvents = 'auto';
    } else {
      toggleButton.style.opacity = 0.5;
      toggleButton.style.pointerEvents = 'none';
    }
  }
}

function restructureData(input) {
  return input.map((item) => {
    const structuredData = [];
    let currentParent = null;

    item.data.forEach((dataItem) => {
      const renderData = dataItem.render;
      const itemNameKey = Object.keys(renderData).find((key) => key.startsWith('item-name'));
      if (itemNameKey) {
        if (currentParent) structuredData.push(currentParent);
        currentParent = { ...renderData, renders: [] };
      } else if (currentParent) {
        currentParent.renders.push(renderData);
      }
    });
    if (currentParent) structuredData.push(currentParent);
    return {
      id: item.id,
      data: structuredData,
    };
  });
}

function cleanObject(data) {
  // Helper function to clean key names
  const cleanKey = (key) => key.split('__')[0];

  // Recursive function to clean the object
  const cleanData = (obj) => {
    // Check if it's an array
    if (Array.isArray(obj)) {
      return obj.map((item) => cleanData(item));
    }

    // Check if it's an object
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // Clean the key
        const newKey = cleanKey(key);
        // Recursively clean the value
        acc[newKey] = cleanData(value);
        return acc;
      }, {});
    }

    // Return the value if it's not an object or array
    return obj;
  };

  // Start cleaning the root object
  return cleanData(data);
}

// Assuming the localStorage is already populated with the key 'orderData'
export default function initOrderSummary(orderSummaryAttribute) {
  if (!orderSummaryAttribute) {
    console.error('Order summary attribute is not provided.');
    return;
  }

  const appElements = document.querySelectorAll('[data-big-card-id]');
  if (!appElements) {
    console.error('App elements not found.');
    return;
  }
  appElements.forEach((element) => {
    element.addEventListener('change', () => {
      displayContent(orderSummaryAttribute);
    });
  });
}
