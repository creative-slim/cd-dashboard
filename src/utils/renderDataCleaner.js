export default function cleanData(data) {
  return data.map((item) => {
    let newItem = { id: item.id, data: [] };
    item.data.forEach((subItem) => {
      let newSubItem = {};
      for (let key in subItem.render) {
        // Split the key on "__" and take the first part
        let newKey = key.split('__')[0];
        newSubItem[newKey] = subItem.render[key];
      }
      newItem.data.push({ render: newSubItem });
    });
    return newItem;
  });
}
