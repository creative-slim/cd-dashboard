export function restructureData(input) {
  return input.map((item) => {
    const structuredData = [];
    let currentParent = null;

    item.data.forEach((dataItem) => {
      const renderData = dataItem.render;
      const itemNameKey = Object.keys(renderData).find((key) => key.startsWith('item-name'));
      if (itemNameKey) {
        if (currentParent) structuredData.push(currentParent);
        currentParent = { ...renderData, renders: [] };
      } else if (currentParent) {
        currentParent.renders.push(renderData);
      }
    });
    if (currentParent) structuredData.push(currentParent);
    return {
      id: item.id,
      data: structuredData,
    };
  });
}

export function cleanObject(data) {
  // Helper function to clean key names
  const cleanKey = (key) => key.split('__')[0];

  // Recursive function to clean the object
  const cleanData = (obj) => {
    // Check if it's an array
    if (Array.isArray(obj)) {
      return obj.map((item) => cleanData(item));
    }

    // Check if it's an object
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // Clean the key
        const newKey = cleanKey(key);
        // Recursively clean the value
        acc[newKey] = cleanData(value);
        return acc;
      }, {});
    }

    // Return the value if it's not an object or array
    return obj;
  };

  // Start cleaning the root object
  return cleanData(data);
}
