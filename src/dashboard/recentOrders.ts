export async function displayRecentOrders() {
  const template = document.querySelector('[data-order="template"]');

  let api;
  if (process.env.NODE_ENV === 'development') {
    api = 'http://127.0.0.1:8787'; // Use local endpoint for development
  } else {
    api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
  }

  if (!template) {
    // //console.error('Template not found');
    return;
  }
  const token = localStorage.getItem('userToken');
  const resp = await fetch(`${api}/api/orders/latest-orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await resp.json();
  if (!data) {
    //console.error('No data found');
    return;
  }

  const container = template.parentElement;
  // container.innerHTML = '';
  const loader = container.querySelector("[data-history='loader']");
  loader.style.display = 'none';

  if (data.length === 0) {
    // const noOrders = document.createElement('div');
    const emptystate = container.querySelector('[data-orders="empty"]');
    const allOrdersBtn = container.querySelector('[data-orders="button"]');
    emptystate.style.display = 'flex';
    allOrdersBtn.style.display = 'none';
    // container.innerHTML =
    // noOrders.textContent = 'Sie haben keine Bestellungen.';
    // container.appendChild(noOrders);
    return;
  }

  console.log('#########data###########', data);
  data.forEach((order) => {
    const item = template.cloneNode(true);
    item.classList.remove('template');
    item.style.display = 'flex';

    const renderList = JSON.parse(order.fieldData['payment-info']);

    console.log('#########order###########', order);
    const collectionSlug = '07abe1fd-4015-4890-8299-1da02fa50c4f';
    item.addEventListener('click', () => {
      window.location.href = `/${collectionSlug}/${order.fieldData['slug']}`;
    });
    const paymentDetailsWithOrderDetails = renderList.paymentDetails.order;
    if (!paymentDetailsWithOrderDetails) {
      //console.error('No payment details found');
      return;
    }
    const currentItem = paymentDetailsWithOrderDetails.orderItemsListWithPricing.filter((item) => {
      return item.data.inputs['item-name'] === order.fieldData.name;
    });
    console.log('#########paymentDetailsWithOrderDetails###########', currentItem[0]);
    const itemToDisplay = currentItem[0];

    item.querySelector('[data-order="name"]').textContent = itemToDisplay.data.inputs['item-name'];
    item.querySelector('[data-order="status"]').textContent = 'bezahlt';
    const totalPrice = sumRenderPricingAndPrespectives(itemToDisplay.renderWithPrice);
    item.querySelector('[data-order="price"]').textContent = `${totalPrice.toFixed(2)} €`;

    container.appendChild(item);
  });

  template.remove();
  return data;
}

function sumRenderPricingAndPrespectives(data) {
  return data.reduce((acc, category) => {
    category.renders.forEach((render) => {
      acc += render.prices.prespectives + render.prices.renderPricing;
    });
    return acc;
  }, 0);
}
