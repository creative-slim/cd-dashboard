import OrderItem from './orderHistoryItem';

let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

// export const initOrderHistory = async () => {
//   try {
//     const token = localStorage.getItem('userToken');

//     const userOrders = await fetch(`${api}/api/orders/order-history`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const data = await userOrders.json();

//     generateOrderHistoryUI(data);

//     return data;
//   } catch (error) {
//     console.error('Error fetching order history:', error);
//     // Handle the error here
//   }
// };

// function generateOrderHistoryUI(data) {
//   const orderHistoryContainer = document.querySelector('[data-history="list"]');
//   const orderItemTemplate = document.querySelector('[data-history="template"]');
//   if (!orderHistoryContainer) {
//     console.log('orderHistory Field not found');
//     return;
//   }
//   if (!orderItemTemplate) {
//     console.log('orderItemTemplate Field not found');
//     return;
//   }
//   removeLoader();
//   showContent();

//   // if data is empty then show the element with attribute data-orders="empty"
//   if (data.length === 0) {
//     const emptyElement = document.querySelector('[data-orders="empty"]');
//     if (emptyElement) {
//       emptyElement.style.display = 'flex';
//     }
//     return;
//   }

//   orderHistoryContainer.style.display = 'flex';

//   data.forEach((order) => {
//     const itemDomElement = orderItemTemplate?.cloneNode(true);
//     itemDomElement.classList.remove('template');
//     itemDomElement.style.display = 'flex';

//     const orderItem = new OrderItem(order, itemDomElement);
//     orderHistoryContainer.appendChild(orderItem.getItemDomElement());
//     orderDetailsFiller(orderItem.getItemDomElement(), order);
//     orderHistoryContainer.appendChild(itemDomElement);
//   });
// }

export const initOrderHistory = async () => {
  try {
    // Check if 'localStorage' is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available.');
    }

    // Retrieve the token
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('User token is missing in localStorage.');
    }

    // Validate 'api' variable
    if (typeof api !== 'string' || !api) {
      throw new Error("'api' variable is not defined or is invalid.");
    }

    // Fetch user orders
    const response = await fetch(`${api}/api/orders/order-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response is okay
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching order history: ${response.status} ${response.statusText} - ${
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

    // Validate 'generateOrderHistoryUI' function
    if (typeof generateOrderHistoryUI !== 'function') {
      throw new Error("'generateOrderHistoryUI' function is not defined.");
    }

    // Generate the UI
    generateOrderHistoryUI(data);

    return data;
  } catch (error) {
    console.error('Error in initOrderHistory:', error);

    // Display a user-friendly error message if available
    if (typeof errorModal === 'function') {
      errorModal('An error occurred while fetching order history. Please try again later.');
    }

    // Return a rejected promise with the error
    return Promise.reject(error);
  }
};

function generateOrderHistoryUI(data) {
  try {
    // Validate 'data' parameter
    if (!Array.isArray(data)) {
      throw new TypeError("'data' must be an array.");
    }

    // Select necessary DOM elements
    const orderHistoryContainer = document.querySelector('[data-history="list"]');
    const orderItemTemplate = document.querySelector('[data-history="template"]');
    const emptyElement = document.querySelector('[data-orders="empty"]');

    // Check for essential elements
    if (!orderHistoryContainer) {
      throw new Error('Order history container not found: [data-history="list"]');
    }
    if (!orderItemTemplate) {
      throw new Error('Order item template not found: [data-history="template"]');
    }

    // Remove loader and show content
    if (typeof removeLoader === 'function') {
      removeLoader();
    } else {
      console.warn("'removeLoader' function is not defined.");
    }

    if (typeof showContent === 'function') {
      showContent();
    } else {
      console.warn("'showContent' function is not defined.");
    }

    // Handle empty data
    if (data.length === 0) {
      if (emptyElement) {
        emptyElement.style.display = 'flex';
      } else {
        console.warn('Empty element not found: [data-orders="empty"]');
      }
      orderHistoryContainer.style.display = 'none';
      return;
    }
    if (emptyElement) {
      emptyElement.style.display = 'none';
    }

    // Display the order history container
    orderHistoryContainer.style.display = 'flex';

    // Clear existing content
    orderHistoryContainer.innerHTML = '';

    data.forEach((order, index) => {
      try {
        // Clone the template
        const itemDomElement = orderItemTemplate.cloneNode(true);
        itemDomElement.classList.remove('template');
        itemDomElement.style.display = 'flex';

        // Create an OrderItem instance
        if (typeof OrderItem !== 'function') {
          throw new Error("'OrderItem' constructor is not defined.");
        }
        const orderItem = new OrderItem(order, itemDomElement);

        // Fill order details
        if (typeof orderDetailsFiller === 'function') {
          orderDetailsFiller(orderItem.getItemDomElement(), order);
        } else {
          throw new Error("'orderDetailsFiller' function is not defined.");
        }

        // Append the item to the container
        orderHistoryContainer.appendChild(orderItem.getItemDomElement());
      } catch (itemError) {
        console.error(`Error processing order at index ${index}:`, itemError);
      }
    });
  } catch (error) {
    console.error('Error in generateOrderHistoryUI:', error);
  }
}

// function removeLoader() {
//   const loader = document.querySelector('[data-history="loader"]');
//   if (loader) {
//     loader.remove();
//   }
// }

// function showContent() {
//   const content = document.querySelector('[data-load="hidden"]');
//   if (content) {
//     content.setAttribute('data-load', 'visible');
//   }
// }

// function orderDetailsFiller(orderItem, order) {
//   const date = orderItem.querySelector('[data-order-item="ph-order-date"]');
//   const img = orderItem.querySelector('[data-order-item="ph-main-img"]');
//   const state = orderItem.querySelector('[data-order-item="ph-order-status"]');
//   const name = orderItem.querySelector('[data-order-item="ph-name"]');

//   date.textContent = formatDateString(order.createdOn);
//   //remove srcset from img
//   img.removeAttribute('srcset');
//   img.src = order.fieldData['uploaded-images'][0].url;
//   state.textContent = order.fieldData['order-status'];
//   name.textContent = order.fieldData.name;
// }

function removeLoader() {
  try {
    // Check if 'document' is defined
    if (typeof document === 'undefined') {
      throw new Error("'document' is not defined.");
    }

    // Select the loader element
    const loader = document.querySelector('[data-history="loader"]');
    if (!loader) {
      console.warn('Loader element not found: [data-history="loader"]');
      return;
    }

    // Remove the loader element
    loader.remove();
  } catch (error) {
    console.error('Error in removeLoader:', error);
  }
}

function showContent() {
  try {
    // Check if 'document' is defined
    if (typeof document === 'undefined') {
      throw new Error("'document' is not defined.");
    }

    // Select the content element
    const content = document.querySelector('[data-load="hidden"]');
    if (!content) {
      console.warn('Content element not found: [data-load="hidden"]');
      return;
    }

    // Update the attribute to show content
    content.setAttribute('data-load', 'visible');
  } catch (error) {
    console.error('Error in showContent:', error);
  }
}

function orderDetailsFiller(orderItem, order) {
  try {
    // Validate that 'orderItem' is a DOM element
    if (!(orderItem instanceof Element)) {
      throw new TypeError("'orderItem' must be a DOM element.");
    }

    // Validate that 'order' is an object
    if (typeof order !== 'object' || order === null) {
      throw new TypeError("'order' must be a non-null object.");
    }

    // Validate that 'order.fieldData' exists
    if (!order.fieldData || typeof order.fieldData !== 'object') {
      throw new Error("'order.fieldData' is missing or invalid.");
    }

    // Select necessary child elements
    const dateElement = orderItem.querySelector('[data-order-item="ph-order-date"]');
    const imgElement = orderItem.querySelector('[data-order-item="ph-main-img"]');
    const stateElement = orderItem.querySelector('[data-order-item="ph-order-status"]');
    const nameElement = orderItem.querySelector('[data-order-item="ph-name"]');

    // Check if elements exist
    if (!dateElement) {
      console.warn("Date element not found in 'orderItem'.");
    }
    if (!imgElement) {
      console.warn("Image element not found in 'orderItem'.");
    }
    if (!stateElement) {
      console.warn("State element not found in 'orderItem'.");
    }
    if (!nameElement) {
      console.warn("Name element not found in 'orderItem'.");
    }

    // Update date
    if (dateElement) {
      if (typeof formatDateString === 'function') {
        dateElement.textContent = formatDateString(order.createdOn);
      } else {
        console.warn("'formatDateString' function is not defined.");
        dateElement.textContent = order.createdOn || '';
      }
    }

    // Update image
    if (imgElement) {
      // Remove 'srcset' attribute
      imgElement.removeAttribute('srcset');

      // Check if 'uploaded-images' array exists and has at least one item
      const uploadedImages = order.fieldData['uploaded-images'];
      if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
        const imageUrl = uploadedImages[0].url;
        if (imageUrl) {
          imgElement.src = imageUrl;
        } else {
          console.warn("Image URL is missing in 'uploaded-images[0]'.");
          imgElement.src = ''; // Set to a placeholder or empty string
        }
      } else {
        console.warn("'uploaded-images' is missing or empty in 'order.fieldData'.");
        imgElement.src = ''; // Set to a placeholder or empty string
      }
    }

    // Update state
    if (stateElement) {
      const orderStatus = order.fieldData['order-status'];
      if (orderStatus) {
        stateElement.textContent = orderStatus;
      } else {
        console.warn("'order-status' is missing in 'order.fieldData'.");
        stateElement.textContent = 'Unknown';
      }
    }

    // Update name
    if (nameElement) {
      const { name } = order.fieldData;
      if (name) {
        nameElement.textContent = name;
      } else {
        console.warn("'name' is missing in 'order.fieldData'.");
        nameElement.textContent = 'Unknown';
      }
    }
  } catch (error) {
    console.error('Error in orderDetailsFiller:', error);
  }
}

function formatDateString(dateString: string) {
  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}
