// @ts-nocheck

import {
  downloadDropboxItem,
  getBatchThumbnails,
  checkFolderExistence,
  getPreviewLink,
} from "./dropBoxFn";

export async function getOrderFilesPaths(data) {
  return new Promise(async (resolve, reject) => {
    let paths = [];

    await Promise.all(
      data.entries.map(async (e) => {
        let dropboxItemFullPath = e.path_lower;
        const pathObj = { path: dropboxItemFullPath };
        paths.push(pathObj);
      })
    );
    resolve(paths);
  });
}

function getFileExtension(fileName) {
  // Use lastIndexOf and substring to extract the file extension
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // If there's no dot (.), return an empty string or handle as needed
    return "";
  } else {
    return fileName.substring(lastDotIndex + 1);
  }
}

export async function downloadJsonData(paths, accessKey) {
  return new Promise(async (resolve, reject) => {
    let data;
    await Promise.all(
      paths.map(async (e) => {
        if (getFileExtension(e.path) == "json") {
          data = await downloadDropboxItem(e.path, accessKey);
          // singleOrder.order.metadata = data;
          // userOrders.push(singleOrder);
          // singleOrder = JSON.parse(JSON.stringify(orderTemplate));
        }
      })
    );
    console.log("download json finished");
    resolve(data);
  });
}

export async function getThumbnailData(orderContentArray, accessKey) {
  return new Promise(async (resolve, reject) => {
    let paths = [];

    paths = await getOrderFilesPaths(orderContentArray);
    // console.log("🚀 ~ returnnewPromise ~ paths:", paths);
    let orderMetadata = (await downloadJsonData(paths, accessKey)) || "";
    // console.log("🚀 ~ returnnewPromise ~ test:", test);
    let res = await getBatchThumbnails(paths, accessKey);
    // console.log("🚀 ~ returnnewPromise ~ res:", res);
    const thumbnails = JSON.parse(res);

    // get the preview link for all the images and put then in the thumbnails array
    await Promise.all(
      thumbnails.entries.map(async (e) => {
        if (e[".tag"] == "success") {
          let previewLink = await getPreviewLink(
            e.metadata.path_lower,
            accessKey
          );
          e.metadata.previewLink = previewLink;
        }
      })
    );
    console.log("🚀 ~ returnnewPromise ~ thumbnails:", thumbnails);

    const thumbnailsAndJson = { thumbnails, orderMetadata };
    resolve(thumbnailsAndJson);
  });
}

export async function checkUserFolder(user, accessToken) {
  console.log("🚀 ~ checkUserFolder ~ user", user);

  return new Promise(async (resolve, reject) => {
    let result = await checkFolderExistence(user, accessToken);
    resolve(result);
  });
}
