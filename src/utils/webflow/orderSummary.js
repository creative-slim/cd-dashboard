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
  const widthKey = Object.keys(item.render).find((key) => key.startsWith('item-width'));
  const heightKey = Object.keys(item.render).find((key) => key.startsWith('item-height'));
  const lengthKey = Object.keys(item.render).find((key) => key.startsWith('item-length'));

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

  const detailsKey = Object.keys(item.render).find((key) => key.startsWith('item-details'));
  const details = item.render[detailsKey];
  if (details) {
    const detailsElement = document.createElement('div');
    detailsElement.classList.add('details-898989');
    detailsElement.textContent = `Details: ${details}`;
    container.appendChild(detailsElement);
  }

  const renderDetails = document.createElement('div');
  renderDetails.classList.add('render-details-898989');
  const renderTypeKey = Object.keys(item.render).find((key) => key.startsWith('render-type'));
  const woodTypeKey = Object.keys(item.render).find((key) => key.startsWith('woodtype'));
  const countKey = Object.keys(item.render).find((key) => key.startsWith('render-count'));
  const upholsteryKey = Object.keys(item.render).find((key) => key.startsWith('upholstery'));
  const otherMaterialKey = Object.keys(item.render).find((key) => key.startsWith('other-material'));
  const squareKey = Object.keys(item.render).find((key) => key.startsWith('square'));
  const portraitKey = Object.keys(item.render).find((key) => key.startsWith('portrait'));
  const landscapeKey = Object.keys(item.render).find((key) => key.startsWith('Landscape'));
  const commentKey = Object.keys(item.render).find((key) => key.startsWith('request-comment'));

  const renderType = item.render[renderTypeKey];
  const woodType = item.render[woodTypeKey];
  const count = item.render[countKey];
  const upholstery = item.render[upholsteryKey];
  const otherMaterial = item.render[otherMaterialKey];
  const square = item.render[squareKey];
  const portrait = item.render[portraitKey];
  const landscape = item.render[landscapeKey];
  const comment = item.render[commentKey];

  const renderDetailsHTML = `
            ${renderType ? `<div>Render Type: ${renderType}</div>` : ''}
            ${woodType ? `<div>Wood Type: ${woodType}</div>` : ''}
            ${count ? `<div>Count: ${count}</div>` : ''}
            ${upholstery ? `<div>Upholstery: ${upholstery}</div>` : ''}
            ${otherMaterial ? `<div>Other Material: ${otherMaterial}</div>` : ''}
            ${square ? `<div>Square: ${square}</div>` : ''}
            ${portrait ? `<div>Portrait: ${portrait}</div>` : ''}
            ${landscape ? `<div>Landscape: ${landscape}</div>` : ''}
            ${comment ? `<div>Comment: ${comment}</div>` : ''}
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
    entry.data.forEach((subEntry) => {
      const itemHTML = createItemHTML(subEntry);
      content.appendChild(itemHTML);
    });
  });
}

// Assuming the localStorage is already populated with the key 'orderData'
export default function initOrderSummary(orderSummaryAttribute) {
  setInterval(() => {
    displayContent(orderSummaryAttribute);
  }, 300);
}

// Initialize the order summary
// initOrderSummary('#order-summary');
