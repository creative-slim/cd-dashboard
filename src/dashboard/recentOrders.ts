// export async function displayRecentOrders() {
//   const template = document.querySelector('[data-order="template"]');

//   let api;
//   if (process.env.NODE_ENV === 'development') {
//     api = 'http://127.0.0.1:8787'; // Use local endpoint for development
//   } else {
//     api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
//   }

//   if (!template) {
//     // //console.error('Template not found');
//     return;
//   }
//   const token = localStorage.getItem('userToken');
//   const resp = await fetch(`${api}/api/orders/latest-orders`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await resp.json();
//   if (!data) {
//     //console.error('No data found');
//     return;
//   }

//   const container = template.parentElement;
//   // container.innerHTML = '';
//   if (container) {
//     const loader = container.querySelector("[data-history='loader']");
//     if (loader) {
//       loader.style.display = 'none';
//     }
//   }

//   if (data.length === 0) {
//     // const noOrders = document.createElement('div');
//     const emptystate = container.querySelector('[data-orders="empty"]');
//     const allOrdersBtn = container.querySelector('[data-orders="button"]');
//     emptystate.style.display = 'flex';
//     allOrdersBtn.style.display = 'none';
//     // container.innerHTML =
//     // noOrders.textContent = 'Sie haben keine Bestellungen.';
//     // container.appendChild(noOrders);
//     return;
//   }

//   console.log('#########data###########', data);
//   data.forEach((order) => {
//     const item = template.cloneNode(true);
//     item.classList.remove('template');
//     item.style.display = 'flex';

//     const renderList = JSON.parse(order.fieldData['payment-info']);

//     console.log('#########order###########', order);
//     const collectionSlug = '07abe1fd-4015-4890-8299-1da02fa50c4f';
//     item.addEventListener('click', () => {
//       window.location.href = `/${collectionSlug}/${order.fieldData['slug']}`;
//     });
//     const paymentDetailsWithOrderDetails = renderList.paymentDetails.order;
//     if (!paymentDetailsWithOrderDetails) {
//       //console.error('No payment details found');
//       return;
//     }
//     const currentItem = paymentDetailsWithOrderDetails.orderItemsListWithPricing.filter((item) => {
//       return item.data.inputs['item-name'] === order.fieldData.name;
//     });
//     console.log('#########paymentDetailsWithOrderDetails###########', currentItem[0]);
//     const itemToDisplay = currentItem[0];

//     if (itemToDisplay) {
//       const nameElement = item.querySelector('[data-order="name"]');
//       if (nameElement) {
//         nameElement.textContent = itemToDisplay.data.inputs['item-name'];
//       }

//       const statusElement = item.querySelector('[data-order="status"]');
//       if (statusElement) {
//         statusElement.textContent = 'bezahlt';
//       }

//       const priceElement = item.querySelector('[data-order="price"]');
//       if (priceElement) {
//         const totalPrice = sumRenderPricingAndPrespectives(itemToDisplay.renderWithPrice);
//         priceElement.textContent = `${totalPrice.toFixed(2)} €`;
//       }
//     }
//     if (container) {
//       container.appendChild(item);
//     }
//   });

//   template.remove();
//   return data;
// }

export async function displayRecentOrders() {
  try {
    // Check if 'document' is available
    if (typeof document === 'undefined') {
      throw new Error("'document' is not available.");
    }

    // Select the template element
    const template = document.querySelector('[data-order="template"]');
    if (!template) {
      throw new Error('Template element not found: [data-order="template"]');
    }

    // Determine the API endpoint
    let api;
    if (process.env.NODE_ENV === 'development') {
      api = 'http://127.0.0.1:8787'; // Use local endpoint for development
    } else {
      api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
    }

    if (typeof api !== 'string' || !api) {
      throw new Error('API endpoint is not defined.');
    }

    // Check if 'localStorage' is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available.');
    }

    // Retrieve the user token
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('User token is missing in localStorage.');
    }

    // Fetch the latest orders
    let response;
    try {
      response = await fetch(`${api}/api/orders/latest-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (networkError) {
      throw new Error('Network error occurred while fetching recent orders.');
    }

    // Check if the response is OK
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // Ignore JSON parsing error
      }
      throw new Error(
        `Error fetching recent orders: ${response.status} ${response.statusText} - ${
          errorData.message || 'No additional error message'
        }`
      );
    }

    // Parse the response data
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error('Failed to parse JSON response.');
    }

    // Validate that 'data' is an array
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from the server.');
    }

    // Get the container element
    const container = document.querySelector('[data-history="list"]');
    if (!container) {
      throw new Error('Container element not found for the template.');
    }

    // Hide the loader if it exists
    const loader = container.querySelector("[data-history='loader']");
    if (loader) {
      loader.style.display = 'none';
    }

    // Handle empty data
    if (data.length === 0) {
      const emptyState = container.querySelector('[data-orders="empty"]');
      const allOrdersBtn = container.querySelector('[data-orders="button"]');

      if (emptyState) {
        emptyState.style.display = 'flex';
      } else {
        console.warn('Empty state element not found: [data-orders="empty"]');
      }

      if (allOrdersBtn) {
        allOrdersBtn.style.display = 'none';
      } else {
        console.warn('All orders button element not found: [data-orders="button"]');
      }

      return data;
    }

    // Process each order
    data.forEach((order, orderIndex) => {
      try {
        // Validate 'order' and 'order.fieldData'
        if (!order || !order.fieldData) {
          console.warn(`Invalid order data at index ${orderIndex}.`);
          return;
        }

        const item = template.cloneNode(true);
        item.classList.remove('template');
        item.style.display = 'flex';

        // Parse the 'payment-info' JSON
        let renderList;
        try {
          renderList = JSON.parse(order.fieldData['payment-info']);
        } catch (parseError) {
          console.warn(
            `Error parsing 'payment-info' JSON for order at index ${orderIndex}:`,
            parseError
          );
          return;
        }

        // Validate 'renderList' structure
        if (
          !renderList ||
          !renderList.paymentDetails ||
          !renderList.paymentDetails.order ||
          !Array.isArray(renderList.paymentDetails.order.orderItemsListWithPricing)
        ) {
          console.warn(`Invalid renderList structure for order at index ${orderIndex}.`);
          return;
        }

        // Set up the click event to redirect
        const collectionSlug = '07abe1fd-4015-4890-8299-1da02fa50c4f';
        item.addEventListener('click', () => {
          window.location.href = `/${collectionSlug}/${order.fieldData['slug']}`;
        });

        const paymentDetailsWithOrderDetails = renderList.paymentDetails.order;

        // Find the current item based on 'item-name'
        const currentItem = paymentDetailsWithOrderDetails.orderItemsListWithPricing.filter(
          (orderItem) => {
            return (
              orderItem &&
              orderItem.data &&
              orderItem.data.inputs &&
              orderItem.data.inputs['item-name'] === order.fieldData.name
            );
          }
        );

        if (!currentItem || currentItem.length === 0) {
          console.warn(`No matching item found for order at index ${orderIndex}.`);
          return;
        }

        const itemToDisplay = currentItem[0];

        if (itemToDisplay) {
          // Update the name element
          const nameElement = item.querySelector('[data-order="name"]');
          if (nameElement) {
            nameElement.textContent = itemToDisplay.data.inputs['item-name'] || '';
          } else {
            console.warn(`Name element not found in item at index ${orderIndex}.`);
          }

          // Update the status element
          const statusElement = item.querySelector('[data-order="status"]');
          if (statusElement) {
            statusElement.textContent = 'bezahlt';
          } else {
            console.warn(`Status element not found in item at index ${orderIndex}.`);
          }

          // Update the price element
          const priceElement = item.querySelector('[data-order="price"]');
          if (priceElement) {
            if (typeof sumRenderPricingAndPrespectives === 'function') {
              const totalPrice = sumRenderPricingAndPrespectives(itemToDisplay.renderWithPrice);
              if (typeof totalPrice === 'number') {
                priceElement.textContent = `${totalPrice.toFixed(2)} €`;
              } else {
                console.warn(`Total price is not a number for item at index ${orderIndex}.`);
                priceElement.textContent = '';
              }
            } else {
              console.warn('sumRenderPricingAndPrespectives function is not defined.');
              priceElement.textContent = '';
            }
          } else {
            console.warn(`Price element not found in item at index ${orderIndex}.`);
          }
        }

        // Append the item to the container
        container.appendChild(item);
      } catch (itemError) {
        console.error(`Error processing order at index ${orderIndex}:`, itemError);
      }
    });

    // Remove the template element
    template.remove();

    return data;
  } catch (error) {
    console.error('Error in displayRecentOrders:', error);

    // Display a user-friendly error message
    if (typeof errorModal === 'function') {
      errorModal('An error occurred while displaying recent orders. Please try again later.');
    }

    // Return a rejected promise with the error
    return Promise.reject(error);
  }
}

function sumRenderPricingAndPrespectives(data) {
  try {
    // Validate that 'data' is an array
    if (!Array.isArray(data)) {
      throw new TypeError("'data' must be an array.");
    }

    return data.reduce((acc, category, categoryIndex) => {
      // Validate that 'category' has a 'renders' property that is an array
      if (!category || !Array.isArray(category.renders)) {
        console.warn(`'renders' is missing or not an array at category index ${categoryIndex}.`);
        return acc; // Skip this category if invalid
      }

      category.renders.forEach((render, renderIndex) => {
        // Validate that 'render.prices' exists and has 'prespectives' and 'renderPricing' as numbers
        if (
          !render ||
          !render.prices ||
          typeof render.prices.prespectives !== 'number' ||
          typeof render.prices.renderPricing !== 'number'
        ) {
          console.warn(
            `Invalid 'prices' data at category index ${categoryIndex}, render index ${renderIndex}.`
          );
          return; // Skip this render if invalid
        }

        acc += render.prices.prespectives + render.prices.renderPricing;
      });

      return acc;
    }, 0);
  } catch (error) {
    console.error('Error in sumRenderPricingAndPrespectives:', error);
    return 0; // Return 0 in case of error
  }
}
