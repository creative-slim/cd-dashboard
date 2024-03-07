// @ts-nocheck
import axios from "axios";

export async function createFolderDropbox(name, accessToken) {
  return new Promise(async (resolve, reject) => {
    const config = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "/CD-uploads/" + name,
        autorename: false,
      }),
    };

    try {
      const response = await fetch(
        "https://api.dropboxapi.com/2/files/create_folder_v2",
        config
      );

      if (!response.ok) {
        const error = new Error(
          `Error creating folder: ${response.statusText}`
        );
        reject(error);
      }

      console.log("Folder created successfully!");
      resolve();
    } catch (error) {
      console.error("Error creating folder:", error);
      reject(error);
    }
  });
}

export async function checkFolderExistence(name, accessToken) {
  return new Promise(async (resolve, reject) => {
    const config = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "/CD-uploads/" + name,
      }),
    };

    try {
      const response = await fetch(
        "https://api.dropboxapi.com/2/files/get_metadata",
        config
      );

      if (!response.ok) {
        if (response.status === 409) {
          console.log(
            "Folder does not exist, creating...",
            "/CD-uploads/" + name
          );
          await createFolderDropbox(name, accessToken);
        } else {
          const error = new Error(
            `Error checking folder: ${response.statusText}`
          );
          reject(error);
        }
      } else {
        console.log("Folder already exists!", "/CD-uploads/" + name);
        resolve();
      }
    } catch (error) {
      console.error("Error checking folder:", error);
      reject(error);
    }
  });
}

export async function uploadToDropbox(
  fileData: File,
  fullPath: string,
  accessToken: string
) {
  console.log(" $$$$$$ FN() uploadToDropbox Started ... ");
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: fullPath,
        mode: "add",
        autorename: true,
        mute: false,
        strict_conflict: false,
      }),
    },
  };

  try {
    const response = await axios.post(
      "https://content.dropboxapi.com/2/files/upload",
      fileData,
      config
    );
    console.log("File uploaded successfully to Dropbox:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading to Dropbox:", error);
    throw error;
  }
}

export const uploader = async (
  userEmail: string,
  subFolder: string,
  image: File,
  accesskey: string
) => {
  try {
    const accessToken = accesskey;
    const file = image;
    const user = userEmail;
    const uploadID = subFolder; //..userEmail/dateID..

    const pathWithExtension = "/CD-uploads/" + uploadID + "/" + file.name;

    await checkFolderExistence(user, accessToken);
    await uploadToDropbox(file, pathWithExtension, accessToken);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded successfully!" }),
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error uploading file" }),
    };
  }
};

export async function getFolderList(path: string, accessToken: string) {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify({
      path: path,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.dropboxapi.com/2/files/list_folder",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        // console.log("response.data", response.data);
        resolve(JSON.stringify(response.data)); // Resolve the promise with the data
      })
      .catch((error) => {
        reject(error); // Reject the promise with the error
      });
  });
}

export async function getBatchThumbnails(
  entriesPathList: string[],
  accessToken: string
) {
  return new Promise(async (resolve, reject) => {
    let PathListWithSize = [];
    await Promise.all(
      entriesPathList.map((path) => {
        PathListWithSize.push({
          path: path.path,
          //THIS IS THE SIZE OF THE THUMBNAIL
          size: {
            ".tag": "w256h256",
          },
        });
      })
    );

    let data = JSON.stringify({
      entries: PathListWithSize,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://content.dropboxapi.com/2/files/get_thumbnail_batch",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        resolve(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// get image preview from dropbox api

export async function getPreviewLink(path: string, accessToken: string) {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify({
      path: path,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.dropboxapi.com/2/files/get_temporary_link",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function downloadDropboxItem(path, accessKey) {
  return new Promise((resolve, reject) => {
    console.log("path", path);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://content.dropboxapi.com/2/files/download",
      headers: {
        Authorization: "Bearer " + accessKey,
        //'{"path":"/CD-uploads/sa@creative-directors.com/5-8-2023--16:28:40/structure.json"}'
        "Dropbox-API-Arg": `{"path":"${path}"}`,
      },
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

export async function saveUrlToDropbox(filePath, fileUrl, accessToken) {
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
  };

  const data = {
    path: filePath,
    url: fileUrl,
  };

  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/2/files/save_url",
      data,
      config
    );
    console.log("URL saved to Dropbox successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving URL to Dropbox:", error);
    throw error;
  }
}

export async function getImageLink() {}

// "/CD-uploads/102346645cfc4069b861847d10f8668f/10-0-2024--16:3:10"
