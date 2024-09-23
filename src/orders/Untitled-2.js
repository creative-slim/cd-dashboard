// Function to process the JSON data and update the DOM
function processJsonData(jsonData) {
  const template = document.querySelector('[data-render-info="template"]');
  
  
  // Assuming you've already calculated the total price using the previous code
  const totalSum = jsonData.reduce((sum, item) => sum + (parseFloat(item.render?.price) || 0), 0);

  // Set the tax percentage (you can change this value later)
  let taxPercentage = 0.1; // For example, 10%

  // Calculate the subtotal, tax, and total;
  let taxAmount = totalSum * taxPercentage;
  let subtotal = totalSum - taxAmount
  let total = totalSum; 

  // Fill the fields with the calculated values
  document.querySelector('[data-render-info="subtotal"]').textContent = "€ " + subtotal.toFixed(2) ;
  document.querySelector('[data-render-info="tax"]').textContent = "€ " + taxAmount.toFixed(2) ;
  document.querySelector('[data-render-info="total"]').textContent = "€ " + total.toFixed(2) ;


  if (!template) {
    console.error('Template not found');
    return;
  }

  // Ensure the template is visible before cloning
  template.style.display = 'flex';

  jsonData.forEach(item => {
    const renderData = item.render;

    if (renderData['render-type']) {
      const clone = template.cloneNode(true);

      clone.style.display = 'flex'; // Ensure the cloned element is visible

      // Populate the clone with data
      clone.querySelector('[data-render-info="render-type"]').textContent = renderData['render-type'];
      clone.querySelector('[data-render-info="upholstery"]').style.display = renderData['upholstery'] === "true" ? 'block' : 'none';
      clone.querySelector('[data-render-info="square"]').style.display = renderData['square'] === "true" ? 'block' : 'none';
      clone.querySelector('[data-render-info="portrait"]').style.display = renderData['portrait'] === "true" ? 'block' : 'none';
      clone.querySelector('[data-render-info="landscape"]').style.display = renderData['Landscape'] === "true" ? 'block' : 'none'; // Note capital 'L'
      clone.querySelector('[data-render-info="oter-material-wrap"]').style.display = renderData['other-material'] ? 'block' : 'none';

      clone.querySelector('[data-render-info="other-material"]').textContent = renderData['other-material'] || "";
      clone.querySelector('[data-render-info="comment"]').textContent = renderData['request-comment'] || "";
      clone.querySelector('[data-render-info="woodtype"]').textContent = renderData['woodtype'] || "";
      clone.querySelector('[data-render-info="quantity"]').textContent = renderData['render-count'] || "";
			clone.querySelector('[data-render-info="price"]').textContent = "€ " + parseFloat(renderData['price']).toFixed(2) || "";


      template.parentNode.appendChild(clone); // Append the clone to the DOM
    }
    else {
    document.querySelector('[data-render-info="setup"]').textContent = "€ " + parseFloat(renderData['price']).toFixed(2)  || "";
    }
  });
  console.log("subtotal: ", jsonData.subtotal)
  // Hide the template after processing
  //document.querySelector('[data-render-info="subtotal"]').textContent = renderData['price'] || "";
  template.style.display = 'none';
}

// Function to check for the presence of JSON data in the container
function checkForJsonData() {
  const jsonContainer = document.querySelector('[data-render-info="json"]');
  if (jsonContainer ) {
    try {
      const jsonData = JSON.parse(jsonContainer.textContent);
      processJsonData(jsonData);
    } catch (error) {
      console.error('Invalid JSON data:', error);
    }
  } else {
    console.error('JSON container not found');
  }
}

// Set up a MutationObserver to observe changes in the JSON container
const jsonContainer = document.querySelector('[data-render-info="json"]');

if (jsonContainer) { // Ensure jsonContainer is not null
  const observer = new MutationObserver(() => {
    checkForJsonData();
  });

  observer.observe(jsonContainer, { childList: true });
}

// Initial call to check for JSON data
checkForJsonData();
