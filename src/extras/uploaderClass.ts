export default class FileUploader {
  mainWrapper: any;
  dropZone: any;
  output: any;
  submitprevention: HTMLElement | null;
  uploaderID: any;
  fileInput: any;
  cardID: any;
  containerID: any;
  loading: any;
  doneLoading: any;
  defaultView: any;
  loadingError: any;
  fileType: any;
  activeError: boolean;
  errorTimeout: any;
  preventionClassName: string;
  number_of_files: any;
  files_size_limit: any;
  drop_zone_id: any;
  eventOrMember: any;
  image_names: never[];
  images_data: never[];
  namesArray: any;
  name: any;
  /*
   * drop: id of the drop zone
   * output: id of the output div
   * name: name of the class instance
   * namesArray: name of the hidden input that will hold the image names
   * eventOrMember: name of the event or member
   * submitprevention: id of the submit button to prevent it from submitting
   * preventionClassName: class name to add to the submit button to prevent it from submitting
   * errorPopup: id of the error popup
   */

  constructor(
    wrapper,
    // output,
    name
    // namesArray,
    // eventOrMember
    // errorPopup
  ) {
    this.mainWrapper = wrapper || null;
    if (!this.mainWrapper) {
      console.error(' 🙈 Wrapper not found , Uploader Disabled');
      return;
    }
    console.log('this.mainWrapper : ', this.mainWrapper);
    this.dropZone = this.mainWrapper.querySelector('[data-drop-zone-id]') || null;
    if (!this.dropZone) {
      console.error(' 🙈 Drop zone not found , dropzone Uploader Disabled');
      return;
    }

    console.log('this.dropZone : ', this.dropZone);

    // this.output = document.getElementById(output);

    this.output = this.mainWrapper.querySelector('[uploader-element="output"]') || null;

    this.submitprevention = document.getElementById('order-submit-button');
    this.uploaderID = this.dropZone.dataset.uploaderId || null;
    this.fileInput = this.dropZone.querySelector('input[type="file"]') || null;
    this.cardID = this.dropZone.dataset.uploadCard || null;
    this.containerID =
      this.dropZone.closest('[data-big-card-id]').getAttribute('data-big-card-id') || null;
    this.fileInput.id = `uploader-file-input-${Math.random().toString(36)}`;
    this.fileInput.nextElementSibling.setAttribute('for', this.fileInput.id);
    this.loading = this.dropZone.querySelector('[uploader-status="loading"]') || null;
    this.doneLoading = this.dropZone.querySelector('[uploader-status="done"]');
    this.defaultView = this.dropZone.querySelector('[uploader-status="default"]');
    // this.loadingError = document.getElementById(errorPopup);
    this.loadingError = this.mainWrapper.querySelector('[uploader-status="error"]');

    // this.fileType = eventOrMember;

    this.fileType = this.dropZone.dataset.type || 'image';
    this.activeError = false;
    this.errorTimeout = (this.loadingError && this.loadingError.dataset.timeout) ?? 3000;
    this.preventionClassName = 'button-off';

    this.number_of_files = this.dropZone ?? this.dropZone.dataset.filesLimit ?? 1;
    this.files_size_limit = this.dropZone ?? this.dropZone.dataset.filesSizeLimit ?? 1000000;
    this.drop_zone_id = this.dropZone ?? this.dropZone.dataset.dropZoneId ?? 'multi';

    this.eventOrMember = this.fileType;
    // console.log('this.fileType : ', this.fileType);
    this.image_names = [];
    this.images_data = [];
    this.loading.style.transform = 'scale(0)';
    this.doneLoading.style.transform = 'scale(0)';
    this.loadingError.style.display = 'none';

    this.namesArray = this.dropZone
      .closest('[data-upload="wrapper"]')
      .querySelector('[uploader-output="string"]');

    this.name = name;
    // this.namesArray = namesArray;

    // console.log('this : ', this);
    this.dropZone.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.dropZone.addEventListener('drop', this.dropHandler.bind(this));
    this.fileInput.addEventListener('change', this.fileInputChangeHandler.bind(this));
  }

  preventSubmit(condition) {
    if (condition) {
      this.submitprevention.classList.add(this.preventionClassName);
    } else {
      this.submitprevention.classList.remove(this.preventionClassName);
    }
  }

  async uploadFile(file) {
    const formData = new FormData();
    const cdProd = 'https://creative-directors-dropbox.sa-60b.workers.dev';
    const dev = 'http://127.0.0.1:8787';

    const cdEndpoint = '/api/cd/bucket/imagesupload';

    formData.append('file', file);

    try {
      const response = await fetch(cdProd + cdEndpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
    } catch (err) {
      //console.error(err);
      return null;
    }
  }

  generateLinksArray(image_names) {
    const cdBucket = 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/';
    const formattedString = image_names.map((name) => cdBucket + name).join(',');
    //console.log(formattedString);

    return formattedString;
  }

  isFileTypeAllowed(file) {
    const allowedTypes = [];
    if (this.fileType === '3D') {
      allowedTypes.push(
        'application/zip',
        'application/x-zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/rar',
        'application/x-rar',
        'application/x-7z-compressed'
      );
    } else {
      allowedTypes.push(
        'image/bmp',
        'image/gif',
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'image/webp'
      );
    }
    return allowedTypes.includes(file.type);
  }

  dragOverHandler(ev) {
    ev.preventDefault();
  }

  // displayImages(imageslist) {
  //   let images = '';
  //   const files = '';
  //   imageslist.forEach((image, index) => {
  //     //console.log("+++++++", image.name);

  //     if (this.isFileTypeAllowed(image) && this.fileType === '3D') {
  //       //console.log("is zip");
  //       images += `<div class="upload-queue-files" style="display:flex;"><p class="filename">${
  //         image.name
  //       }</p><p class="filesize">${(image.size * 0.000001).toFixed(
  //         2
  //       )} MB</p><span class="delete-icon" onclick="window.${
  //         this.name
  //       }.deleteImage(${index},'${image.name}')">&times;</span></div>`;
  //     } else {
  //       //console.log("is img");

  //       images += `<div class="upload-queue-item" style="display:flex;">
  //       <img class="upload-queue-image" src="${URL.createObjectURL(image)}" alt="image">
  //       <span class="delete-icon" onclick="window.${this.name}.deleteImage(${index},'${image.name}')">&times;</span>
  //       </div>`;
  //     }
  //   });
  //   this.output.innerHTML = images;
  // }

  displayImages(imageslist) {
    // Clear the previous content
    this.output.innerHTML = '';

    imageslist.forEach((image, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('upload-queue-item');
      itemDiv.style.display = 'flex';

      if (this.isFileTypeAllowed(image) && this.fileType === '3D') {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('upload-queue-files');
        fileDiv.style.display = 'flex';

        const filenameP = document.createElement('p');
        filenameP.classList.add('filename');
        filenameP.textContent = image.name;

        const filesizeP = document.createElement('p');
        filesizeP.classList.add('filesize');
        filesizeP.textContent = (image.size * 0.000001).toFixed(2) + ' MB';

        const deleteSpan = document.createElement('span');
        deleteSpan.classList.add('delete-icon');
        deleteSpan.innerHTML = '&times;';
        deleteSpan.addEventListener('click', () => {
          this.deleteImage(index, image.name);
        });

        fileDiv.appendChild(filenameP);
        fileDiv.appendChild(filesizeP);
        fileDiv.appendChild(deleteSpan);

        this.output.appendChild(fileDiv);
      } else {
        const img = document.createElement('img');
        img.classList.add('upload-queue-image');
        img.src = URL.createObjectURL(image);
        img.alt = 'image';

        const deleteSpan = document.createElement('span');
        deleteSpan.classList.add('delete-icon');
        deleteSpan.innerHTML = '&times;';
        deleteSpan.addEventListener('click', () => {
          this.deleteImage(index, image.name);
        });

        itemDiv.appendChild(img);
        itemDiv.appendChild(deleteSpan);

        this.output.appendChild(itemDiv);
      }
    });
  }
  removeFileFromArray(array, fileName) {
    for (let i = 0; i < array.length; i++) {
      const url = array[i];
      const parts = url.split('/');
      const name = parts[parts.length - 1];

      if (name === fileName) {
        array.splice(i, 1);
        i--;
      }
    }
  }

  // deleteImage(index, nameToDelete) {
  //   this.images_data.splice(index, 1);
  //   this.displayImages(this.images_data);
  //   const linksString = this.generateLinksArray(this.images_data.map((x) => x.name));
  //   // console.log('############', linksString);
  //   this.removeFileFromArray(linksString, nameToDelete);
  //   this.namesArray.value = linksString;
  //   this.insertIntoLocalStorage({ id: this.cardID, array: linksString, name: nameToDelete });
  // }

  deleteImage(index, nameToDelete) {
    // Remove the image data from images_data
    this.images_data.splice(index, 1);

    // Remove the corresponding image name from image_names
    const sanitizedFileName = nameToDelete.split(' ').join('_');
    const nameIndex = this.image_names.indexOf(sanitizedFileName);
    if (nameIndex > -1) {
      this.image_names.splice(nameIndex, 1);
    }

    // Update the display
    this.displayImages(this.images_data);

    // Generate the updated links string
    const linksString = this.generateLinksArray(this.image_names);

    // Update the hidden input value
    this.namesArray.value = linksString;

    // Update the local storage
    this.insertIntoLocalStorage({ id: this.containerID, array: linksString }, true); // true to replace the array  instead of merging it
  }

  // insertIntoLocalStorage(objectToInsert) {
  //   debugger;
  //   // Determine the appropriate array name based on the file extension
  //   const filenames = objectToInsert.array.split(',').map((item) => item.trim());
  //   let arrayName = filenames.some((item) => item.endsWith('.zip')) ? 'files' : 'images';
  //   if (objectToInsert.name) {
  //     arrayName = objectToInsert.name.endsWith('.zip') ? 'files' : 'images';
  //   }

  //   // Retrieve the current 'orderFiles' object from local storage
  //   const orderFiles = JSON.parse(localStorage.getItem('orderFiles')) || {
  //     images: [],
  //     files: [],
  //   };

  //   // Check if an object with the same ID already exists
  //   const existingObjectIndex = orderFiles[arrayName].findIndex(
  //     (obj) => obj.id === objectToInsert.id
  //   );

  //   if (existingObjectIndex !== -1) {
  //     // Merge the arrays if the object with the same ID exists
  //     let existingFilenames = orderFiles[arrayName][existingObjectIndex].array;
  //     if (!Array.isArray(existingFilenames)) {
  //       existingFilenames = existingFilenames.split(',').map((item) => item.trim());
  //     }
  //     const mergedFilenames = [...new Set(existingFilenames.concat(filenames))];
  //     orderFiles[arrayName][existingObjectIndex].array = mergedFilenames;
  //   } else {
  //     // Insert the new object if it doesn't exist
  //     objectToInsert.array = filenames;
  //     orderFiles[arrayName].push(objectToInsert);
  //   }

  //   // Update the local storage with the new 'orderFiles' object
  //   localStorage.setItem('orderFiles', JSON.stringify(orderFiles));
  // }

  insertIntoLocalStorage(objectToInsert, shouldReplace = false) {
    // Determine the appropriate array name based on this.fileType
    const arrayName = this.fileType === '3D' ? 'files' : 'images';

    const filenames = objectToInsert.array
      ? objectToInsert.array.split(',').map((item) => item.trim())
      : [];

    // Retrieve the current 'orderFiles' object from local storage
    const orderFiles = JSON.parse(localStorage.getItem('orderFiles')) || {
      images: [],
      files: [],
    };

    // Check if an object with the same ID already exists
    const existingObjectIndex = orderFiles[arrayName].findIndex(
      (obj) => obj.id === objectToInsert.id
    );

    if (existingObjectIndex !== -1) {
      if (shouldReplace) {
        // Replace the existing array with the new one
        orderFiles[arrayName][existingObjectIndex].array = filenames;
      } else {
        // Merge the arrays if the object with the same ID exists
        let existingFilenames = orderFiles[arrayName][existingObjectIndex].array;
        if (!Array.isArray(existingFilenames)) {
          existingFilenames = existingFilenames.split(',').map((item) => item.trim());
        }
        const mergedFilenames = [...new Set(existingFilenames.concat(filenames))];
        orderFiles[arrayName][existingObjectIndex].array = mergedFilenames;
      }
    } else {
      // Insert the new object if it doesn't exist
      objectToInsert.array = filenames;
      orderFiles[arrayName].push(objectToInsert);
    }

    // Update the local storage with the new 'orderFiles' object
    localStorage.setItem('orderFiles', JSON.stringify(orderFiles));
  }

  async uploadImages(files) {
    if (this.images_data.length + files.length > this.number_of_files) {
      this.loadingError.style.display = 'flex';

      this.activeError = true;

      this.loadingError.innerText = 'You may only upload ' + this.number_of_files + ' File(s)';
      setTimeout(() => {
        this.loadingError.style.display = 'none';

        this.activeError = false;
      }, this.errorTimeout);

      return;
    }

    return new Promise(async (resolve, reject) => {
      this.loading.style.transform = 'scale(1)';
      this.defaultView.style.transform = 'scale(0)';
      this.doneLoading.style.transform = 'scale(0)';
      this.loadingError.style.display = 'none';

      this.preventSubmit(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!this.isFileTypeAllowed(file)) {
          this.loadingError.style.display = 'flex';

          this.activeError = true;

          this.loadingError.innerText = file.name + ' has an invalid Filetype';
          setTimeout(() => {
            this.loadingError.style.display = 'none';

            this.activeError = false;
          }, this.errorTimeout);
          continue;
        }

        if (file.size > this.files_size_limit) {
          this.loadingError.style.display = 'flex';

          this.activeError = true;

          this.loadingError.innerText = file.name + ' was not uploaded, File is too big';
          setTimeout(() => {
            this.loadingError.style.display = 'none';
            this.activeError = false;
          }, this.errorTimeout);
          continue;
        }

        this.image_names.push(file.name.split(' ').join('_'));
        this.images_data.push(file);
        const response = await this.uploadFile(file);
        // console.log(`... file[${i}].name = ${file.name}`);
      }

      const fullLink = this.generateLinksArray(this.image_names);
      this.namesArray.value = fullLink;
      this.insertIntoLocalStorage({ id: this.containerID, array: fullLink });
      // console.log({ containerID: this.containerID, cardID: this.cardID, 'full link': fullLink });
      this.displayImages(this.images_data);
      resolve('done');
    });
  }

  dropHandler(ev) {
    ev.preventDefault();
    //console.log("File(s) dropped");

    if (ev.dataTransfer.files.length > this.number_of_files) {
      this.loadingError.style.display = 'flex';
      this.activeError = true;
      this.loadingError.innerText = 'You may only upload ' + this.number_of_files + ' File(s)';
      setTimeout(() => {
        this.loadingError.style.display = 'none';
        this.activeError = false;
      }, this.errorTimeout);
      return;
    }
    const maxFileSize = 3.9 * 1024 * 1024; // 3.9 MB in bytes
    //testing for file size
    for (const file of ev.dataTransfer.files) {
      if (file.size > maxFileSize && this.fileType !== '3D') {
        this.loadingError.style.display = 'flex';
        this.activeError = true;
        this.loadingError.innerText = 'File(s) exceed maximum size of 3.9 MB';
        setTimeout(() => {
          this.loadingError.style.display = 'none';
          this.activeError = false;
        }, this.errorTimeout);
        return;
      }
    }

    this.uploadImages(ev.dataTransfer.files).then((res) => {
      this.loading.style.transform = 'scale(0)';
      this.defaultView.style.transform = 'scale(0)';
      this.doneLoading.style.transform = 'scale(1)';
      this.preventSubmit(false);
    });
  }

  fileInputChangeHandler(ev) {
    // debugger;
    const { files } = ev.target;
    //console.log(files, this.images_data);

    if (files.length + this.images_data.length > this.number_of_files) {
      this.loadingError.style.display = 'flex';
      this.activeError = true;
      this.loadingError.innerText = 'You may only upload ' + this.number_of_files + ' File(s)';
      setTimeout(() => {
        this.loadingError.style.display = 'none';
        this.activeError = false;
      }, this.errorTimeout);

      return;
    }
    const maxFileSize = 3.9 * 1024 * 1024; // 3.9 MB in bytes
    for (const file of files) {
      if (file.size > maxFileSize && this.fileType !== '3D') {
        this.loadingError.style.display = 'flex';
        this.activeError = true;
        this.loadingError.innerText = 'File(s) exceed maximum size of 3.9 MB';
        setTimeout(() => {
          this.loadingError.style.display = 'none';
          this.activeError = false;
        }, this.errorTimeout);
        return;
      }

      //! 500MB for 3D files
      if (file.size > 500 * 1024 * 1024 && this.fileType === '3D') {
        this.loadingError.style.display = 'flex';
        this.activeError = true;
        this.loadingError.innerText = 'File(s) exceed maximum size of 500 MB';
        setTimeout(() => {
          this.loadingError.style.display = 'none';
          this.activeError = false;
        }, this.errorTimeout);
        return;
      }
    }

    this.uploadImages(files).then((res) => {
      this.loading.style.transform = 'scale(0)';
      this.defaultView.style.transform = 'scale(0)';
      this.doneLoading.style.transform = 'scale(1)';
      this.preventSubmit(false);
    });
  }
}
