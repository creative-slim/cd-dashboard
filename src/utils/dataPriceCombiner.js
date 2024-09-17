export default function combineArrays(array1, object2) {
  let combinedArray = [];
  console.log('array1', array1);
  console.log('object2', object2);

  array1.forEach((element) => {
    const thisIdImages = object2.images.filter((el) => {
      if (el.id === element.id) {
        console.log('el image', el);
        return el.array;
      }
    });
    const thisIdFiles = object2.files.filter((el) => {
      if (el.id === element.id) {
        console.log('el file', el);
        return el.array;
      }
    });
    console.log('thisIdImages', thisIdImages);
    console.log('thisIdFiles', thisIdFiles);
    combinedArray.push({
      id: element.id,
      data: element.data || [],
      files: { images: thisIdImages, files: thisIdFiles } || { images: [], files: [] },
    });
  });

  return combinedArray;

  // Convert object2 to array
  let array2 = [];
  for (const key in object2.images) {
    array2.push({ id: key, array: object2.images[key] });
  }
  for (const key in object2.files) {
    array2.push({ id: key, files: object2.files[key] });
  }

  // Create a map for faster lookup of array2 items by id
  let array2Map = {};
  for (const item of array2) {
    array2Map[item.id] = item;
  }

  // Iterate through array1 and combine with corresponding array2 items
  for (const item1 of array1) {
    let combinedItem = { ...item1 };

    // Combine data
    combinedItem.data = item1.data.map((dataItem) => {
      return {
        render: { ...dataItem.render },
      };
    });

    // Combine files
    combinedItem.files = {
      images: [],
      files: [],
    };

    if (array2Map[item1.id]) {
      const item2 = array2Map[item1.id];

      if (item2.array) {
        if (Array.isArray(item2.array)) {
          combinedItem.files.images = item2.array;
        } else {
          combinedItem.files.images.push(item2.array);
        }
      }

      if (item2.files) {
        if (Array.isArray(item2.files)) {
          combinedItem.files.files = item2.files;
        } else {
          combinedItem.files.files.push(item2.files);
        }
      }
    }

    combinedArray.push(combinedItem);
  }

  return combinedArray;
}
