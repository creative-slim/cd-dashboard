export function fillOrderDetails() {
  const orderContainer = document.querySelector('[render-item="container"]');
  const orderList = document.querySelector('[render-item="list"]');
  const detailContainer = document.querySelector('[render-item="detail"]');
  const detailsList = document.querySelector('[render-item="detail-list"]');

  if (!orderContainer || !orderList || !detailContainer || !detailsList) {
    console.error('order details page : Order details not found');
    return;
  }

  let orderData = document.querySelector('[data-render-info="json"]')?.innerHTML;

  if (!orderData) {
    console.error('Order data not available');
    return;
  }
  orderData = JSON.parse(orderData);

  console.log('order data : ', orderData);

  const { orderItemsListWithPricing } = orderData.paymentDetails.order;

  orderItemsListWithPricing.forEach((orderItem) => {
    //! gotta match the item name first , the orderItemsListWithPricing has all order items and this page has only 1 item , match the name
    const orderRender = orderContainer?.cloneNode(true);
    orderRender.style.display = 'flex';
    orderList.appendChild(orderRender);
    const itemDetailsList = orderRender.querySelector('[render-item="detail-list"]');
    const itemDetails = itemDetailsList.querySelector('[render-item="detail"]');

    orderItem.forEach((item) => {
      const itemRender = itemDetails.cloneNode(true);
      itemRender.style.display = 'flex';
      itemRender.querySelector('[data-render-info="woodtype"]').innerHTML = item.details.woodtype;
      itemRender.querySelector('[data-render-info="quantity"]').innerHTML =
        item.details['render-count'];
      itemRender.querySelector('[data-render-info="price"]').innerHTML =
        item.details.pricing.prespectives;
      itemDetailsList.appendChild(itemRender);
    });
  });
}
