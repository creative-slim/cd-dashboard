export function fillOrderDetails(data = {}) {
  try {
    // get the template from the data-render-info="details-template" template element
    const detailsTemplate = document.querySelector(
      '[data-render-info="details-template"]'
    ) as HTMLTemplateElement;
    if (!detailsTemplate) {
      console.error('Details template not found.');
      return;
    }

    const container = document.querySelector('[data-render="details-container"]');

    // clone the template content
    const detailsTemplateContent = detailsTemplate.content.cloneNode(true) as DocumentFragment;

    const clonedDetailsTemplate = document.createElement('div');
    clonedDetailsTemplate.appendChild(detailsTemplateContent);

    const orderElement = clonedDetailsTemplate as HTMLElement;

    // Clear the container before inserting the new content
    if (container) {
      container.innerHTML = '';
      container.appendChild(orderElement);
    } else {
      console.error('Container not found.');
      return;
    }

    const TAX = 0.19;
    // Select necessary DOM elements
    const orderContainer = orderElement.querySelector('[render-item="container"]');
    const orderList = orderElement.querySelector('[render-item="list"]');
    const detailContainer = orderElement.querySelector('[render-item="detail"]');
    const detailsList = orderElement.querySelector('[render-item="detail-list"]');

    // Check if essential elements are found
    if (!orderContainer || !orderList || !detailContainer || !detailsList) {
      console.error('Order details page: Essential elements not found in the DOM.');
      return;
    }

    // Get order data from DOM and parse it
    let orderData = data;

    if (Object.keys(orderData).length === 0) {
      const orderDataElement = document.querySelector('[data-render-info="json"]');
      if (!orderDataElement) {
        console.error('Order data element not found.');
        return;
      }

      try {
        orderData = JSON.parse(orderDataElement.innerHTML);
      } catch (parseError) {
        console.error('Error parsing order data JSON:', parseError);
        return;
      }
    }
    console.log('order data : ', orderData);

    // Get current order name
    const currentOrderNameElement = document.querySelector('[data-current-order="name"]');
    if (!currentOrderNameElement) {
      console.error('Current order name element not found.');
      return;
    }
    // const currentOrderName = currentOrderNameElement.innerHTML;
    const currentOrderName = orderData.order[0].inputs['item-name'];

    // Validate order data structure
    if (!orderData || !orderData.paymentDetails || !orderData.paymentDetails.order) {
      console.error('Invalid order data structure.');
      return;
    }

    const { orderItemsListWithPricing, total } = orderData.paymentDetails.order;

    if (!Array.isArray(orderItemsListWithPricing) || typeof total !== 'number') {
      console.error('Invalid order items or total price in order data.');
      return;
    }

    // Find the order item that matches the current order name
    const orderItemWithPricing = orderItemsListWithPricing.filter((order) => {
      if (order && order.data && order.data.inputs) {
        return order.data.inputs['item-name'] === currentOrderName;
      }
      return false;
    });

    if (orderItemWithPricing.length === 0) {
      console.error('Order item with current name not found.');
      return;
    }

    const orderObjectWithPricing = orderItemWithPricing[0];

    if (!orderObjectWithPricing || !orderObjectWithPricing.renderWithPrice) {
      console.error('Invalid order object with pricing.');
      return;
    }

    const rendersWithPricing = orderObjectWithPricing.renderWithPrice;

    if (!Array.isArray(rendersWithPricing) || rendersWithPricing.length === 0) {
      console.error('No renders with pricing found.');
      return;
    }

    const orderInitialFee = rendersWithPricing[0].initialFee;

    // Update order setup fee in the DOM
    const orderSetupElement = document.querySelector('[data-render-info="setup"]');
    if (orderSetupElement && typeof orderInitialFee === 'number') {
      orderSetupElement.innerHTML = `${orderInitialFee} €`;
    } else {
      console.warn('Order setup element not found or invalid initial fee.');
    }

    // Update subtotal, tax, and total in the DOM
    const subtotalElement = document.querySelector('[data-render-info="subtotal"]');
    const taxElement = document.querySelector('[data-render-info="tax"]');
    const totalElement = document.querySelector('[data-render-info="total"]');
    fillMoebelDetails(orderData);
    fillUserDetails(orderData);

    if (subtotalElement) {
      const subtotalValue = total - total * TAX;
      subtotalElement.innerHTML = `${subtotalValue.toFixed(2)} €`;
    }
    if (taxElement) {
      const taxValue = total * TAX;
      taxElement.innerHTML = `${taxValue.toFixed(2)} €`;
    }
    if (totalElement) {
      totalElement.innerHTML = `${total.toFixed(2)} €`;
    }

    // Iterate over renders with pricing
    rendersWithPricing.forEach((renderItem, renderIndex) => {
      try {
        if (!renderItem || !renderItem.renders || !renderItem.renderCategory) {
          console.warn(`Invalid render item at index ${renderIndex}.`);
          return;
        }

        const orderRender = orderContainer.cloneNode(true);
        orderRender.style.display = 'block';

        const renderTypeText = orderRender.querySelector('[data-render-info="render-type"]');
        if (renderTypeText) {
          renderTypeText.innerHTML = renderItem.renderCategory;
        } else {
          console.warn(
            `Render type text element not found in order render at index ${renderIndex}.`
          );
        }

        const renderPriceText = orderRender.querySelector('[data-render-info="type-price"]');
        if (renderPriceText) {
          const renderPricing = renderItem.renders[0]?.prices?.renderPricing;
          if (typeof renderPricing === 'number') {
            renderPriceText.innerHTML = `${renderPricing} €`;
          } else {
            console.warn(`Invalid render pricing in render item at index ${renderIndex}.`);
          }
        } else {
          console.warn(
            `Render price text element not found in order render at index ${renderIndex}.`
          );
        }

        orderList.appendChild(orderRender);

        const itemDetailsList = orderRender.querySelector('[render-item="detail-list"]');
        const itemDetails = itemDetailsList?.querySelector('[render-item="detail"]');
        if (!itemDetailsList || !itemDetails) {
          console.warn(`Item details or list not found in order render at index ${renderIndex}.`);
          return;
        }

        // Iterate over individual renders
        renderItem.renders.forEach((item, itemIndex) => {
          try {
            if (!item || !item.details || !item.details.inputs) {
              console.warn(`Invalid item at index ${itemIndex} in render at index ${renderIndex}.`);
              return;
            }

            const itemRender = itemDetails.cloneNode(true);
            itemRender.style.display = 'flex';

            const woodtypeElement = itemRender.querySelector('[data-render-info="woodtype"]');
            const quantityElement = itemRender.querySelector('[data-render-info="quantity"]');
            const priceElement = itemRender.querySelector('[data-render-info="price"]');
            const aspectRatioElement = itemRender.querySelector(
              '[data-render-info="aspect-ratio"]'
            );
            const commentElement = itemRender.querySelector('[data-render-info="comment"]');
            const otherMaterialElement = itemRender.querySelector(
              '[data-render-info="other-material"]'
            );
            const otherMaterialWrapElement = itemRender.querySelector(
              '[data-render-info="other-material-wrap"]'
            );

            if (woodtypeElement) {
              woodtypeElement.innerHTML = item.details.inputs.woodtype || '';
            }
            if (quantityElement) {
              quantityElement.innerHTML = item.details.inputs['render-count'] || '';
            }
            if (priceElement) {
              const prespectivesPrice = item.details.pricing?.prespectives;
              if (typeof prespectivesPrice === 'number') {
                priceElement.innerHTML = `${prespectivesPrice} €`;
              } else {
                priceElement.innerHTML = '';
              }
            }
            if (aspectRatioElement) {
              aspectRatioElement.innerHTML = item.details.inputs['aspect-ratio'] || '';
            }
            if (commentElement) {
              commentElement.innerHTML = item.details.inputs['render-details-comment'] || '';
            }
            if (item.details.inputs['uphostery'] === 'true' && otherMaterialElement) {
              otherMaterialElement.innerHTML = item.details.inputs['uphostery-material'] || '';
            } else if (otherMaterialWrapElement) {
              otherMaterialWrapElement.style.display = 'none';
            }

            itemDetailsList.appendChild(itemRender);
          } catch (itemError) {
            console.error(
              `Error rendering item at index ${itemIndex} in render at index ${renderIndex}:`,
              itemError
            );
          }
        });
      } catch (renderError) {
        console.error(`Error processing render item at index ${renderIndex}:`, renderError);
      }
    });
  } catch (error) {
    console.error('Error in fillOrderDetails:', error);
  }
}

function fillMoebelDetails(orderData) {
  const item_name = document.querySelector('[data-current-order="name"]');
  const order_id = document.querySelector('[data-current-order="id"]');
  const width = document.querySelector('[data-current-order="width"]');
  const height = document.querySelector('[data-current-order="height"]');
  const depth = document.querySelector('[data-current-order="length"]');
  const paymentMethod = document.querySelector('[data-current-order="payment"]');
  const comment = document.querySelector('[data-current-order="comment"]');
  const imagesArray = document.querySelector('[data-current-order="images-list"]');

  if (item_name) {
    item_name.innerHTML = orderData.order[0].inputs['item-name'];
  }
  if (order_id) {
    order_id.innerHTML = orderData.paymentDetails.order['orderID'];
  }
  if (width) {
    width.innerHTML = orderData.order[0].inputs['item-width'];
  }
  if (height) {
    height.innerHTML = orderData.order[0].inputs['item-height'];
  }
  if (depth) {
    depth.innerHTML = orderData.order[0].inputs['item-length'];
  }
  if (paymentMethod) {
    // paymentMethod.innerHTML = orderData.paymentDetails.paymentMethod;
    paymentMethod.innerHTML = 'PAYPAL';
  }
  if (comment) {
    comment.innerHTML = orderData.order[0].inputs['item-details'];
  }

  //   if (imagesArray) {
  //     debugger;
  //     const images = orderData.localstorageFiles.images[0].array; // Assuming this array contains image URLs
  //     images.forEach((imageUrl) => {
  //       // Create the wrapper <a> element
  //       const aElement = document.createElement('a');
  //       aElement.classList.add('w-inline-block', 'w-lightbox');
  //       aElement.setAttribute('aria-label', 'open lightbox');
  //       aElement.setAttribute('aria-haspopup', 'dialog');
  //       aElement.setAttribute('href', '#');

  //       // Create the <img> element
  //       const imgElement = document.createElement('img');
  //       imgElement.src = imageUrl;
  //       imgElement.setAttribute('loading', 'lazy');
  //       imgElement.setAttribute('alt', '');
  //       imgElement.classList.add('order-item_image');

  //       // Create the <script> element for lightbox JSON
  //       const scriptElement = document.createElement('script');
  //       scriptElement.type = 'application/json';
  //       scriptElement.classList.add('w-json');

  //       // Create the JSON structure for the lightbox
  //       const lightboxData = {
  //         items: [
  //           {
  //             url: imageUrl,
  //             type: 'image',
  //           },
  //         ],
  //         group: 'upload-images',
  //       };
  //       scriptElement.textContent = JSON.stringify(lightboxData);

  //       // Append img and script to the <a> element
  //       aElement.appendChild(imgElement);
  //       aElement.appendChild(scriptElement);

  //       // Append the <a> element to the images list wrapper
  //       imagesArray.appendChild(aElement);
  //     });
  //   }
  if (imagesArray) {
    const images = orderData.localstorageFiles.images[0].array; // Assuming this array contains image URLs
    images.forEach((imageUrl, index) => {
      // Create the wrapper <a> element
      const aElement = document.createElement('a');
      aElement.href = imageUrl;
      aElement.setAttribute('target', '_blank'); // Open in a new tab
      aElement.setAttribute('rel', 'noopener noreferrer'); // Optional: Security improvement

      // Create the <img> element
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.setAttribute('loading', 'lazy');
      imgElement.setAttribute('alt', `Image ${index + 1}`);
      imgElement.classList.add('order-item_image');

      // Append the img to the <a> element
      aElement.appendChild(imgElement);

      // Append the <a> element to the images list wrapper
      imagesArray.appendChild(aElement);
    });
  }
}

function fillUserDetails(orderData) {
  const first_name = document.querySelector('[order-invoice="first_name"]');
  const last_name = document.querySelector('[order-invoice="last_name"]');
  const email = document.querySelector('[order-invoice="mail"]');
  const phone = document.querySelector('[order-invoice="phone"]');
  const street = document.querySelector('[order-invoice="street"]');
  const street_number = document.querySelector('[order-invoice="housenumber"]');
  const city = document.querySelector('[order-invoice="city"]');
  const zip = document.querySelector('[order-invoice="zip"]');
  const country = document.querySelector('[order-invoice="country"]');
  const company = document.querySelector('[order-invoice="company"]');
  const ust_idr = document.querySelector('[order-invoice="ust_idr"]');

  if (first_name) {
    first_name.innerHTML = orderData.userAddress.first_name;
  }
  if (last_name) {
    last_name.innerHTML = orderData.userAddress.last_name;
  }
  if (email) {
    email.innerHTML = orderData.userAddress.email;
  }
  if (phone) {
    phone.innerHTML = orderData.userAddress.phone;
  }
  if (street) {
    street.innerHTML = orderData.userAddress.street;
  }
  if (street_number) {
    street_number.innerHTML = orderData.userAddress.housenumber;
  }
  if (city) {
    city.innerHTML = orderData.userAddress.city;
  }
  if (zip) {
    zip.innerHTML = orderData.userAddress.zip;
  }
  if (country) {
    country.innerHTML = orderData.userAddress.country;
  }
  if (company) {
    company.innerHTML = orderData.userAddress.company;
  }
  if (ust_idr) {
    ust_idr.innerHTML = orderData.userAddress.ust_idnr;
  }
}
