export function fillOrderDetails() {
  const TAX = 0.19;
  const orderContainer = document.querySelector('[render-item="container"]');
  const orderList = document.querySelector('[render-item="list"]');
  const detailContainer = document.querySelector('[render-item="detail"]');
  const detailsList = document.querySelector('[render-item="detail-list"]');

  if (!orderContainer || !orderList || !detailContainer || !detailsList) {
    console.error('order details page : Order details not found');
    return;
  }

  let orderData = document.querySelector('[data-render-info="json"]')?.innerHTML;

  const currentOrderName = document.querySelector('[data-current-order="name"]')?.innerHTML;

  if (!orderData) {
    console.error('Order data not available');
    return;
  }
  orderData = JSON.parse(orderData);

  console.log('order data : ', orderData);

  const { orderItemsListWithPricing } = orderData.paymentDetails.order;
  const totalPaidPrice = orderData.paymentDetails.order.total;
  //find the object with the current order name
  const orderItemWithPricing = orderItemsListWithPricing.filter((order) => {
    console.log('order data inputs : ', order.data.inputs);
    return order.data.inputs['item-name'] === currentOrderName;
  });

  console.log('order item with pricing : ', orderItemWithPricing);

  const orderObjectWithPricing = orderItemWithPricing[0];
  const rendersWithPricing = orderObjectWithPricing.renderWithPrice;

  const orderInitialFee = orderObjectWithPricing.renderWithPrice[0].initialFee;
  //data-render-info="setup"
  const orderSetup = document.querySelector('[data-render-info="setup"]');
  if (orderSetup) {
    orderSetup.innerHTML = orderInitialFee + ' €';
  }

  const subtotal = document.querySelector('[data-render-info="subtotal"]');
  const total = document.querySelector('[data-render-info="total"]');
  const tax = document.querySelector('[data-render-info="tax"]');

  if (subtotal) {
    subtotal.innerHTML = totalPaidPrice - totalPaidPrice * TAX + ' €';
  }
  if (tax) {
    tax.innerHTML = totalPaidPrice * TAX + ' €';
  }

  if (total) {
    total.innerHTML = totalPaidPrice + ' €';
  }

  rendersWithPricing.forEach((renderItem) => {
    const orderRender = orderContainer?.cloneNode(true);
    orderRender.style.display = 'block';

    const renderTypeText = orderRender.querySelector('[data-render-info="render-type"]');
    if (renderTypeText) {
      renderTypeText.innerHTML = renderItem.renderCategory;
    }
    const renderPriceText = orderRender.querySelector('[data-render-info="type-price"]');
    if (renderPriceText) {
      renderPriceText.innerHTML = renderItem.renders[0].prices.renderPricing + ' €';
    }

    orderList.appendChild(orderRender);
    const itemDetailsList = orderRender.querySelector('[render-item="detail-list"]');
    const itemDetails = itemDetailsList.querySelector('[render-item="detail"]');

    renderItem.renders.forEach((item) => {
      const itemRender = itemDetails.cloneNode(true);
      itemRender.style.display = 'flex';
      try {
        itemRender.querySelector('[data-render-info="woodtype"]').innerHTML =
          item.details.inputs.woodtype;
        itemRender.querySelector('[data-render-info="quantity"]').innerHTML =
          item.details.inputs['render-count'];
        itemRender.querySelector('[data-render-info="price"]').innerHTML =
          item.details.pricing.prespectives + ' €';

        itemRender.querySelector('[data-render-info="aspect-ratio"]').innerHTML =
          item.details.inputs['aspect-ratio'];
        itemRender.querySelector('[data-render-info="comment"]').innerHTML =
          item.details.inputs['render-details-comment'];
        if (item.details.inputs['uphostery'] === 'true') {
          itemRender.querySelector('[data-render-info="other-material"]').innerHTML =
            item.details.inputs['uphostery-material'];
        } else {
          itemRender.querySelector('[data-render-info="other-material-wrap"]').style.display =
            'none';
        }
      } catch (error) {
        console.error('Error rendering item:', error);
      }

      itemDetailsList.appendChild(itemRender);
    });
  });
}

function sumRenderPricingAndPrespectives(data) {
  return data.reduce((acc, category) => {
    category.renders.forEach((render) => {
      acc += render.prices.prespectives + render.prices.renderPricing;
    });
    return acc;
  }, 0);
}
