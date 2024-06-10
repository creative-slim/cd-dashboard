export function saveData(currentCard, container) {
  // Log function start
  console.log('------- save Data -------');
  // Get all the input elements
  const inputs = currentCard.querySelectorAll('input, textarea, select');
  console.log('current Card', currentCard);

  // Retrieve the data from local storage or initialize to an empty array if not present
  const storedLocalData = JSON.parse(localStorage.getItem('orderData')) || [];

  console.log('container', container);

  // Find the existing card data by its ID
  //?   const cardId = currentCard.closest('[data-big-card-id]')?.getAttribute('data-big-card-id');
  const cardId = container.closest('[data-big-card-id]')?.getAttribute('data-big-card-id');

  const checkIfRender = (element) => {
    const render = element.closest('[render-number]')?.getAttribute('render-number') || 0;
    return render > 0 ? render : null;
  };

  console.log('################################checkIfRender', checkIfRender(currentCard));

  const found = storedLocalData.find((element) => element.id === cardId);

  const renderNumber = (element) => {
    const number = element.closest('[render-number]')?.getAttribute('render-number') || 0;
    return number;
  };

  // Function to extract data from inputs and store them in an object
  const extractData = (inputElements) => {
    const data = {};
    inputElements.forEach((input) => {
      const number = renderNumber(input);
      console.log('renderNumber', number, input);
      //   if (number > 0) {
      if (!data[number]) {
        data[number] = { render: {} };
      }
      if (input.type === 'checkbox') {
        data[number].render[input.id] = input.checked ? 'true' : 'false';
      } else {
        data[number].render[input.id] = input.value;
      }
      //   }
    });
    return data;
  };

  const extractedData = extractData(inputs);

  if (found) {
    // Update the existing data
    Object.keys(extractedData).forEach((key) => {
      if (found.data[key]) {
        found.data[key].render = { ...found.data[key].render, ...extractedData[key].render };
      } else {
        found.data[key] = extractedData[key];
      }
    });
  } else {
    // Create a new entry if not found
    const inputData = {
      id: cardId,
      data: extractedData,
    };
    storedLocalData.push(inputData);
  }

  // Log the stored data
  console.log('storedLocalData', storedLocalData);

  // Save the updated data back to local storage
  localStorage.setItem('orderData', JSON.stringify(storedLocalData));
}
