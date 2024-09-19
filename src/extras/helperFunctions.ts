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

export function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const cleanedKey = key.split('_')[0];
      acc[cleanedKey] = cleanObject(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}
