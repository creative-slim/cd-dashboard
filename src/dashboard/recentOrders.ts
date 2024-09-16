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

  data.forEach((order) => {
    const item = template.cloneNode(true);
    item.classList.remove('template');
    item.style.display = 'flex';

    const renderList = JSON.parse(order.fieldData['render-list']);

    //console.log('#########order###########', order);
    const collectionSlug = '07abe1fd-4015-4890-8299-1da02fa50c4f';
    item.addEventListener('click', () => {
      window.location.href = `/${collectionSlug}/${order.fieldData['slug']}`;
    });

    //console.log('#########renderList###########', renderList);
    //console.log(order);

    item.querySelector('[data-order="name"]').textContent = renderList[0].render['item-name'];
    item.querySelector('[data-order="status"]').textContent = 'bezahlt';
    const totalPrice = renderList.reduce((total, item) => total + (item.render.price || 0), 0);
    item.querySelector('[data-order="price"]').textContent = `${totalPrice.toFixed(2)} €`;

    container.appendChild(item);
  });

  template.remove();
  return data;
}
