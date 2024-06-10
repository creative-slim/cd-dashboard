function getDataFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function createItemHTML(item) {
  const container = document.createElement('div');
  container.classList.add('container-898989');

  const itemNameKey = Object.keys(item.render).find((key) => key.startsWith('item-name'));
  const itemName = item.render[itemNameKey];
  if (itemName) {
    const itemNameElement = document.createElement('div');
    itemNameElement.classList.add('item-name-898989');
    itemNameElement.textContent = itemName;
    container.appendChild(itemNameElement);
  }

  const dimensions = document.createElement('div');
  dimensions.classList.add('details-898989');
  const widthKey = Object.keys(item.render).find((key) => key.startsWith('width'));
  const heightKey = Object.keys(item.render).find((key) => key.startsWith('height'));
  const lengthKey = Object.keys(item.render).find((key) => key.startsWith('length'));

  const width = item.render[widthKey];
  const height = item.render[heightKey];
  const length = item.render[lengthKey];

  if (width || height || length) {
    dimensions.innerHTML = `
            ${width ? `<div>Width: ${width}</div>` : ''}
            ${height ? `<div>Height: ${height}</div>` : ''}
            ${length ? `<div>Length: ${length}</div>` : ''}
        `;
    container.appendChild(dimensions);
  }

  const renderDetails = document.createElement('div');
  renderDetails.classList.add('render-details-898989');
  const renderTypeKey = Object.keys(item.render).find((key) => key.startsWith('render-type'));
  const woodTypeKey = Object.keys(item.render).find((key) => key.startsWith('woodtype'));
  const countKey = Object.keys(item.render).find((key) => key.startsWith('count'));
  const upholsteryKey = Object.keys(item.render).find((key) => key.startsWith('upholstery'));
  const otherMaterialKey = Object.keys(item.render).find((key) => key.startsWith('other-material'));

  const renderType = item.render[renderTypeKey];
  const woodType = item.render[woodTypeKey];
  const count = item.render[countKey];
  const upholstery = item.render[upholsteryKey];
  const otherMaterial = item.render[otherMaterialKey];

  const renderDetailsHTML = `
        ${renderType ? `<div>Render Type: ${renderType}</div>` : ''}
        ${woodType ? `<div>Wood Type: ${woodType}</div>` : ''}
        ${count ? `<div>Count: ${count}</div>` : ''}
        ${upholstery ? `<div>Upholstery: ${upholstery}</div>` : ''}
        ${otherMaterial ? `<div>Other Material: ${otherMaterial}</div>` : ''}
    `;

  if (renderDetailsHTML.trim()) {
    renderDetails.innerHTML = renderDetailsHTML;
    container.appendChild(renderDetails);
  }

  return container;
}

function displayContent(element) {
  const data = getDataFromLocalStorage('orderData');
  const content = document.querySelector(element);
  content.innerHTML = ''; // Clear existing content

  data.forEach((entry) => {
    Object.values(entry.data).forEach((subEntry) => {
      const itemHTML = createItemHTML(subEntry);
      content.appendChild(itemHTML);
    });
  });
}

// Assuming the localStorage is already populated with the key 'orderData'
export default function initOrderSummary(orderSummaryAttribute) {
  setInterval(() => {
    displayContent(orderSummaryAttribute);
  }, 1000);
}
