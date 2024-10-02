// export function fillOrderDetails() {
//   const TAX = 0.19;
//   const orderContainer = document.querySelector('[render-item="container"]');
//   const orderList = document.querySelector('[render-item="list"]');
//   const detailContainer = document.querySelector('[render-item="detail"]');
//   const detailsList = document.querySelector('[render-item="detail-list"]');

//   if (!orderContainer || !orderList || !detailContainer || !detailsList) {
//     console.error('order details page : Order details not found');
//     return;
//   }

//   let orderData = document.querySelector('[data-render-info="json"]')?.innerHTML;

//   const currentOrderName = document.querySelector('[data-current-order="name"]')?.innerHTML;

//   if (!orderData) {
//     console.error('Order data not available');
//     return;
//   }
//   orderData = JSON.parse(orderData);

//   console.log('order data : ', orderData);
//   console.trace('order data : ', orderData);

//   const { orderItemsListWithPricing } = orderData.paymentDetails.order;
//   const totalPaidPrice = orderData.paymentDetails.order.total;
//   //find the object with the current order name
//   const orderItemWithPricing = orderItemsListWithPricing.filter((order) => {
//     console.log('order data inputs : ', order.data.inputs);
//     return order.data.inputs['item-name'] === currentOrderName;
//   });

//   console.log('order item with pricing : ', orderItemWithPricing);

//   const orderObjectWithPricing = orderItemWithPricing[0];
//   const rendersWithPricing = orderObjectWithPricing.renderWithPrice;

//   const orderInitialFee = orderObjectWithPricing.renderWithPrice[0].initialFee;
//   //data-render-info="setup"
//   const orderSetup = document.querySelector('[data-render-info="setup"]');
//   if (orderSetup) {
//     orderSetup.innerHTML = orderInitialFee + ' €';
//   }

//   const subtotal = document.querySelector('[data-render-info="subtotal"]');
//   const total = document.querySelector('[data-render-info="total"]');
//   const tax = document.querySelector('[data-render-info="tax"]');

//   if (subtotal) {
//     subtotal.innerHTML = totalPaidPrice - totalPaidPrice * TAX + ' €';
//   }
//   if (tax) {
//     tax.innerHTML = totalPaidPrice * TAX + ' €';
//   }

//   if (total) {
//     total.innerHTML = totalPaidPrice + ' €';
//   }

//   rendersWithPricing.forEach((renderItem) => {
//     const orderRender = orderContainer?.cloneNode(true);
//     orderRender.style.display = 'block';

//     const renderTypeText = orderRender.querySelector('[data-render-info="render-type"]');
//     if (renderTypeText) {
//       renderTypeText.innerHTML = renderItem.renderCategory;
//     }
//     const renderPriceText = orderRender.querySelector('[data-render-info="type-price"]');
//     if (renderPriceText) {
//       renderPriceText.innerHTML = renderItem.renders[0].prices.renderPricing + ' €';
//     }

//     orderList.appendChild(orderRender);
//     const itemDetailsList = orderRender.querySelector('[render-item="detail-list"]');
//     const itemDetails = itemDetailsList.querySelector('[render-item="detail"]');

//     renderItem.renders.forEach((item) => {
//       const itemRender = itemDetails.cloneNode(true);
//       itemRender.style.display = 'flex';
//       try {
//         itemRender.querySelector('[data-render-info="woodtype"]').innerHTML =
//           item.details.inputs.woodtype;
//         itemRender.querySelector('[data-render-info="quantity"]').innerHTML =
//           item.details.inputs['render-count'];
//         itemRender.querySelector('[data-render-info="price"]').innerHTML =
//           item.details.pricing.prespectives + ' €';

//         itemRender.querySelector('[data-render-info="aspect-ratio"]').innerHTML =
//           item.details.inputs['aspect-ratio'];
//         itemRender.querySelector('[data-render-info="comment"]').innerHTML =
//           item.details.inputs['render-details-comment'];
//         if (item.details.inputs['uphostery'] === 'true') {
//           itemRender.querySelector('[data-render-info="other-material"]').innerHTML =
//             item.details.inputs['uphostery-material'];
//         } else {
//           itemRender.querySelector('[data-render-info="other-material-wrap"]').style.display =
//             'none';
//         }
//       } catch (error) {
//         console.error('Error rendering item:', error);
//       }

//       itemDetailsList.appendChild(itemRender);
//     });
//   });
// }

export function fillOrderDetails() {
  try {
    const TAX = 0.19;

    // Select necessary DOM elements
    const orderContainer = document.querySelector('[render-item="container"]');
    const orderList = document.querySelector('[render-item="list"]');
    const detailContainer = document.querySelector('[render-item="detail"]');
    const detailsList = document.querySelector('[render-item="detail-list"]');

    // Check if essential elements are found
    if (!orderContainer || !orderList || !detailContainer || !detailsList) {
      console.error('Order details page: Essential elements not found in the DOM.');
      return;
    }

    // Get order data from DOM and parse it
    const orderDataElement = document.querySelector('[data-render-info="json"]');
    if (!orderDataElement) {
      console.error('Order data element not found.');
      return;
    }

    let orderData;
    try {
      orderData = JSON.parse(orderDataElement.innerHTML);
    } catch (parseError) {
      console.error('Error parsing order data JSON:', parseError);
      return;
    }

    // Get current order name
    const currentOrderNameElement = document.querySelector('[data-current-order="name"]');
    if (!currentOrderNameElement) {
      console.error('Current order name element not found.');
      return;
    }
    const currentOrderName = currentOrderNameElement.innerHTML;

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

function sumRenderPricingAndPrespectives(data) {
  return data.reduce((acc, category) => {
    category.renders.forEach((render) => {
      acc += render.prices.prespectives + render.prices.renderPricing;
    });
    return acc;
  }, 0);
}
