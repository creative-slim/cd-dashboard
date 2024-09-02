export async function displayRecentOrders() {
  const template = document.querySelector('[data-order="template"]');

  let api;
  if (process.env.NODE_ENV === 'development') {
    api = 'http://127.0.0.1:8787'; // Use local endpoint for development
  } else {
    api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
  }

  if (!template) {
    console.error('Template not found');
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
    console.error('No data found');
    return;
  }

  const container = template.parentElement;
  container.innerHTML = '';

  data.forEach((order) => {
    const item = template.cloneNode(true);
    item.classList.remove('template');
    item.style.display = 'flex';

    const renderList = JSON.parse(order.fieldData['render-list']);

    console.log('#########renderList###########', renderList);
    console.log(order);

    item.querySelector('[data-order="name"]').textContent = renderList[0].render['item-name'];
    item.querySelector('[data-order="status"]').textContent = 'paid';
    item.querySelector('[data-order="price"]').textContent = `${renderList.reduce(
      (total, item) => total + (item.render.price || 0),
      0
    )} EUR`;

    container.appendChild(item);
  });

  template.remove();
  return data;
}
