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
  console.log('🥹🥹item in create HTML ', item);
  if (!item) {
    console.error('Item or item.render is not provided.');
    return document.createElement('div'); // Return an empty div to prevent errors
  }
  // Clone the template
  if (!template) {
    console.error('Template not found.');
    return document.createElement('div'); // Return an empty div to prevent errors
  }

  const clone = template.cloneNode(true);
  clone.style.display = 'block'; // Ensure the cloned element is visible
  clone.removeAttribute('data-render-info'); // Remove the template attribute

  // Function to strip the random suffix from the keys
  const stripSuffix = (key) => key.split('__')[0];

  console.log('item.render', item);

  calculateTotal(item);

  // Update elements inside the clone
  Object.keys(item).forEach((key) => {
    const strippedKey = stripSuffix(key);
    const element = clone.querySelector(`[data-order-cart="${strippedKey}"]`);
    // console.log('🥹🥹🥹🥹🥹 ', element);

    if (element) {
      const value = item[key];

      if (value !== undefined) {
        if (element.tagName === 'P') {
          element.textContent = value;
        } else if (element.tagName === 'DIV') {
          element.innerHTML = value;
        }
      }
    }
  });

  const cloneItem = clone.querySelector('[data-order-cart="render"]');
  if (cloneItem) {
    item.renders.forEach((render) => {
      const renderClone = cloneItem.cloneNode(true);
      renderClone.style.display = 'flex';
      renderClone.removeAttribute('data-order-cart');

      Object.keys(render).forEach((key) => {
        const strippedKey = stripSuffix(key);
        const element = renderClone.querySelector(`[data-order-cart="${strippedKey}"]`);

        if (element) {
          const value = render[key];

          if (value !== undefined) {
            if (element.tagName === 'P') {
              element.textContent = value;
            } else if (element.tagName === 'DIV') {
              element.innerHTML = value;
            }
          }
        }
      });

      clone.appendChild(renderClone);
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
  const provided3DModel = data['provided-3D-model'];
  const woodtypePrice = Prices.woodtype.generic;
  let totalPrice = Prices.base.render;
  let renderPrice = 0;

  const arrayOfUsedWoodTypes = [];

  if (!provided3DModel) {
    totalPrice = totalPrice + 850;
  }

  data.renders.forEach((render) => {
    const quantity = parseInt(render['render-count']);

    if (render['wood-type']) {
      if (!arrayOfUsedWoodTypes.includes(render['wood-type'])) {
        arrayOfUsedWoodTypes.push(render['wood-type']);
        renderPrice = renderPrice + woodtypePrice;
      } else {
        renderPrice = renderPrice + 0;
      }
    }
    if (render['scene']) {
      if (provided3DModel) {
        renderPrice = renderPrice + parseInt(Prices.scene.render) * (quantity - 1);
      } else {
        renderPrice =
          renderPrice +
          parseInt(Prices.scene.build) +
          parseInt(Prices.scene.render) * (quantity - 1);
      }
    }
    if (render['knockout']) {
      if (provided3DModel) {
        renderPrice = renderPrice + parseInt(Prices.knockout.render) * quantity - 1;
      } else {
        renderPrice =
          renderPrice +
          parseInt(Prices.knockout.build) +
          parseInt(Prices.knockout.render) * (quantity - 1);
      }
    }

    totalPrice = totalPrice + renderPrice;

    console.log({ totalPrice, renderPrice });
  });
}

function displayContent(element) {
  if (!element) {
    console.error('Element selector is not provided.');
    return;
  }

  const data = getDataFromLocalStorage('orderData');
  console.log('🥹🥹data ', data);
  const structuredData = restructureData(data);
  console.log('🥹🥹structuredData ', structuredData);

  const content = document.querySelector(element);
  if (!content) {
    console.error('Content element not found.');
    return;
  }

  content.innerHTML = ''; // Clear existing content

  structuredData.forEach((entry) => {
    if (!entry.data) return;
    entry.data.forEach((subEntry) => {
      const itemHTML = createItemHTML(subEntry);
      content.appendChild(itemHTML);
    });
  });
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

// Assuming the localStorage is already populated with the key 'orderData'
export default function initOrderSummary(orderSummaryAttribute) {
  if (!orderSummaryAttribute) {
    console.error('Order summary attribute is not provided.');
    return;
  }

  const btn = document.querySelector('[data-order-cart="toggle-btn"]');
  if (!btn) {
    console.error('Button not found.');
    return;
  }

  btn.addEventListener('click', () => {
    const content = document.querySelector(orderSummaryAttribute);
    if (!content) {
      console.error('Content element not found.');
      return;
    }
    displayContent(orderSummaryAttribute);
  });
  btn.addEventListener('hover', () => {
    const content = document.querySelector(orderSummaryAttribute);
    if (!content) {
      console.error('Content element not found.');
      return;
    }

    displayContent(orderSummaryAttribute);
  });
}
