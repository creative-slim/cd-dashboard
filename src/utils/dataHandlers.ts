// @ts-nocheck

import {
  checkFolderExistence,
  downloadDropboxItem,
  getBatchThumbnails,
  getPreviewLink,
} from './dropBoxFn';

export async function getOrderFilesPaths(data) {
  return new Promise(async (resolve, reject) => {
    const paths = [];

    await Promise.all(
      data.entries.map(async (e) => {
        const dropboxItemFullPath = e.path_lower;
        const pathObj = { path: dropboxItemFullPath };
        paths.push(pathObj);
      })
    );
    resolve(paths);
  });
}

function getFileExtension(fileName) {
  // Use lastIndexOf and substring to extract the file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // If there's no dot (.), return an empty string or handle as needed
    return '';
  }
  return fileName.substring(lastDotIndex + 1);
}

export async function downloadJsonData(paths, accessKey) {
  return new Promise(async (resolve, reject) => {
    let data;
    await Promise.all(
      paths.map(async (e) => {
        if (getFileExtension(e.path) == 'json') {
          data = await downloadDropboxItem(e.path, accessKey);
          // singleOrder.order.metadata = data;
          // userOrders.push(singleOrder);
          // singleOrder = JSON.parse(JSON.stringify(orderTemplate));
        }
      })
    );
    console.log('download json finished');
    resolve(data);
  });
}

export async function getThumbnailData(orderContentArray, accessKey) {
  return new Promise(async (resolve, reject) => {
    let paths = [];

    paths = await getOrderFilesPaths(orderContentArray);
    // console.log("🚀 ~ returnnewPromise ~ paths:", paths);
    const orderMetadata = (await downloadJsonData(paths, accessKey)) || '';
    // console.log("🚀 ~ returnnewPromise ~ test:", test);
    const res = await getBatchThumbnails(paths, accessKey);
    // console.log("🚀 ~ returnnewPromise ~ res:", res);
    const thumbnails = JSON.parse(res);

    // get the preview link for all the images and put then in the thumbnails array
    await Promise.all(
      thumbnails.entries.map(async (e) => {
        if (e['.tag'] == 'success') {
          const previewLink = await getPreviewLink(e.metadata.path_lower, accessKey);
          e.metadata.previewLink = previewLink;
        }
      })
    );
    console.log('🚀 ~ returnnewPromise ~ thumbnails:', thumbnails);

    const thumbnailsAndJson = { thumbnails, orderMetadata };
    resolve(thumbnailsAndJson);
  });
}

export async function checkUserFolder(user, accessToken) {
  console.log('🚀 ~ checkUserFolder ~ user', user);

  return new Promise(async (resolve, reject) => {
    const result = await checkFolderExistence(user, accessToken);
    resolve(result);
  });
}

export function getOnMaterials(metadata) {
  const onMaterials = [];

  // Check each material property in the metadata
  for (const key in metadata) {
    if (metadata.hasOwnProperty(key) && metadata[key] === 'on' && key.startsWith('material')) {
      // Extract the material name from the property name
      const materialName = key.replace('material', '');
      onMaterials.push(materialName);
    }
    if (
      key.startsWith('comment') &&
      metadata.hasOwnProperty(key) &&
      metadata[key] != '' &&
      !key.startsWith('commentToggle')
    ) {
      const commentName = metadata[key];
      console.log('commentName', commentName);

      onMaterials.push(commentName);
    }
  }

  // Join the onMaterials array into a comma-separated string
  const result = onMaterials.join(', ');

  return result;
}
