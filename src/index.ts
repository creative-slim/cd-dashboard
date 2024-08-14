/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axios from 'axios';
import cookie from 'cookie';
import jsPDF from 'jspdf';
import lightbox from 'lightbox2';

import { areRequiredFieldsPopulated, errorModal } from '$extras/inputsChecker.js';
import { initInstances } from '$extras/uploaderInstances.js';
import {
  checkUserFolder,
  downloadJsonData,
  getOnMaterials,
  getOrderFilesPaths,
  getThumbnailData,
} from '$utils/dataHandlers';
import combineArrays from '$utils/dataPriceCombiner.js';
import {
  checkFolderExistence,
  downloadDropboxItem,
  getBatchThumbnails,
  getFolderList,
  uploader,
  uploadToDropbox,
} from '$utils/dropBoxFn';
import { frontEndElementsJS } from '$utils/frontEndElements';
import { greetUser } from '$utils/greet';
import { generateInvoice, generateInvoiceItem } from '$utils/invoiceGenerator';
import { initializePaypal } from '$utils/paypal.js';
import { saveInputToLocalHost } from '$utils/placeholderFormContent';
import cleanData from '$utils/renderDataCleaner.js';
import transformData from '$utils/transformData';
import {
  checkRequiredFields,
  hideSubmitLogger,
  loggerUpdate,
  reloadPage,
  sendInvoice,
  showSubmitLogger,
  uploadInvoice,
  uploadInvoiceToCMS,
} from '$utils/utilsFn.js';
import initWebflowFunctions from '$utils/webflow/initFn.js';
import orderAppFunctions from '$utils/webflow/orderApp.js';
import {
  checkUserAddressData,
  clearLocalStorageOnLogout,
  dataChecker,
  renderSetupParams,
  updateUserAddress,
} from '$utils/webflowScripts.js';

import { initAuth } from './auth/userAuth';

window.Webflow ||= [];
window.Webflow.push(async () => {
  lightbox.option({
    resizeDuration: 200,
    wrapAround: true,
  });
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = 'https://cdn.jsdelivr.net/gh/lokesh/lightbox2@dev/dist/css/lightbox.min.css';

  // Add the link element to the head section of the HTML document
  document.head.appendChild(linkElement);

  const scr = document.createElement('script');
  scr.href = 'https://cdn.jsdelivr.net/gh/lokesh/lightbox2@dev/dist/js/lightbox-plus-jquery.js';

  // Add the link element to the head section of the HTML document
  document.head.appendChild(scr);

  // init instances
  initInstances();
  orderAppFunctions();
  initWebflowFunctions();

  //! API ENDPOINTS
  const server = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  const local = 'http://localhost:8787';

  //?change this to switch between local and server
  const api = process.env.NODE_ENV === 'development' ? local : server;

  //! END API ENDPOINTS

  const paymentStatus = {
    payed: false,
    paymentMethod: '',
  };

  const orderTemplate = {
    order: {
      type: '',
      name: '',
      dimensions: {
        width: '',
        height: '',
        length: '',
      },
      specialFunction: '',
      specialFunctionScene: false,
      material: '',
      color: '',
      images: [],
      extras: {
        viewangles: '',
        lightPreferences: '',
        roomType: '',
      },
      renderPackage: '',
      roomTypeDescription: '',
      metadata: {},
    },
  };

  /**
   * a single order template that resets after each call
   * to reset it :
   *   singleOrder = JSON.parse(JSON.stringify(orderTemplate));
   *  instead of : singleOrder = orderTemplate
   *  to seperate memory allocations
   */

  let singleOrder = JSON.parse(JSON.stringify(orderTemplate));

  const userOrders = [];

  const GetCurrentUserEmail = () => {
    const cookies = cookie.parse(document.cookie);
    console.log('cookies', cookies);

    return cookies['wf_uid'];
  };

  async function init() {
    console.log('init');
    const email = document.getElementById('wf-user-account-email');
    console.log('email ', email);

    // old form ID
    const form = document.getElementById('wf-form-mainFormSubmission');

    //const form = document.querySelector("[data-app-target='main-form']");

    const imageInputField = document.getElementById('imgsupload');
    const output = document.getElementById('output');
    const testbtn = document.getElementById('test-folder-content');

    /*** ELEMENT COMPONENET */

    const ordersWrapper = document.querySelector('[data-orders-wrapper]');
    const template = document.querySelector('[data-order-element]');

    const thumbnailContainer = document.querySelector('[data-thumbnails-container]');
    const thumbnailSlot = document.querySelector('[data-thumbnails-slot]');

    //!this is the issue
    // if (!template && !ordersWrapper) return;

    //CloneItem
    //const item = cloneNode(itemTemplate)

    /** */

    //get user from Cookie
    const CurrentUserEmail = GetCurrentUserEmail();
    // [0].entries[0].path_display

    let accessKey = '';
    //   /CD-uploads/user@email.com
    const userFolderStructure: string[] = [];
    // /CD-uploads/user@email.com/xx-xx-xx--xx:xx:xx
    const userVersionedUploads = [];

    /**
     * testing button eventlistener
     */
    // testbtn?.addEventListener("click", async function (e) {
    //   e.preventDefault();
    //   try {
    //     userVersionedUploads.map(async (e) => {
    //       const res = await getBatchThumbnails(e);
    //     });
    //   } catch (error) {
    //     console.log("error in test 2", error);
    //   }
    // });

    /**
     * *create view elements from template and serverUserData
     *
     * !VIEW UPDATA
     */
    function updateView(userData, templateElement) {
      const ordersWrapper = templateElement.parentElement!;

      templateElement.remove();

      //remove lottie
      const lottie = document.querySelector('#orders-loading-lottie');
      if (lottie) lottie.remove();

      const orderItems = userData.map((e, index) => {
        const elem = template?.cloneNode(true);
        elem.style.display = 'flex';

        const nameElement = elem.querySelector("[data-order-item='ph-name']");
        const thumbnails = elem.querySelector("[data-order-item='thumbnails']");
        const description = elem.querySelector("[data-order-item='ph-description']");

        // change elem data-attribute="draft" to "paid"

        // const paymentStatus = e.payment.status;
        // console.log("🚀 ~ updateView ~ paymentStatus", paymentStatus);

        // Check if payment.status is true

        console.log('🚀 ~ updateView ~ e.payment.status', e.payment.status);

        if (e.payment.status === 'true') {
          // If it's true, set data-attribute to "PAID"
          elem.setAttribute('data-attribute', 'paid');
        } else {
          // If it's false or any other value, set data-attribute to "Draft"
          elem.setAttribute('data-attribute', 'draft');
        }

        // elem.setAttribute("data-attribute", e.payment.status ?  );

        //name
        if (nameElement && e !== undefined) {
          nameElement.innerText = e.name || 'NO_NAME';
        }

        //description
        if (description && e !== undefined) {
          description.innerText =
            `${e.type} ${e.specialFunction ? ' with ' + e.specialFunction : ''} - ${e.material} - ${e.dimensions.width}mm x ${e.dimensions.height}mm x ${e.dimensions.length}mm : ${e.renderPackage}` ||
            'NO_DESCRIPTION';
        }

        //thumbnails

        function sliceStringAtNthSlash(inputString, n) {
          let nthSlashIndex = -1;

          // Find the index of the nth "/" character
          for (let i = 0, count = 0; i < inputString.length; i++) {
            if (inputString[i] === '/') {
              count++;
              if (count === n) {
                nthSlashIndex = i;
                break;
              }
            }
          }

          if (nthSlashIndex !== -1) {
            const slicedString = inputString.substring(0, nthSlashIndex);
            return slicedString;
          }
        }

        if (thumbnails) {
          const thumbnailswrapper = thumbnails.parentElement!;
          let images = '';
          e.images.map((i) => {
            // images += `<div class="upload-queue-images">
            //   <img src="${i.thumbnail}" alt="image">
            // </div>`;
            //!trying to Fix lightbox issue
            images += `<a href="${i.imagePreview}" data-lightbox="${sliceStringAtNthSlash(i.path, 4)}" alt="image">
            <img src="${i.thumbnail}" alt="image">
              </a>`;
          });
          // if images is empty just put "no images " instead
          if (images === '') {
            images = 'No Images';
          }
          thumbnails.innerHTML = images;
        }

        // Componants Animation :

        const btnOrder = elem.querySelector('#btn-details');
        const lightboxWrapper = btnOrder.querySelector('.order-lightbox-wrapper');
        const lightbox = btnOrder.querySelector('.order-lightbox');
        const detail_close = btnOrder.querySelector('.detail-close');

        btnOrder.addEventListener('click', () => {
          lightboxWrapper.style.display = 'flex';
          lightbox.style.opacity = '100%';
          detail_close.style.opacity = '100%';
          lightbox.style.transform = 'translateY(-10vh)';
        });

        document.body.addEventListener('click', (event) => {
          if (
            !lightbox.contains(event.target) &&
            // event.target !== detail_close &&
            event.target !== btnOrder
          ) {
            lightboxWrapper.style.display = 'none';
            lightbox.style.opacity = '0';
            detail_close.style.opacity = '0';
          }
        });

        // end animation

        //main thumbnail
        const mainThumb = elem.querySelector("[data-order-item='ph-main-img']");
        if (mainThumb && e.images[0] !== undefined) {
          if (mainThumb.hasAttribute('srcset')) mainThumb.removeAttribute('srcset');
          mainThumb.src = e.images[0].thumbnail;
        }
        //end main thumbnail

        // change elem data-attribute="draft" to "paid"

        //order details
        //name
        const orderName = elem.querySelector("[data-order-item='name']");
        if (orderName) {
          orderName.innerText = e.name || 'NO_NAME';
        }
        //dimensions
        const orderDimensions = elem.querySelector("[data-order-item='dimensions']");
        if (orderDimensions) {
          orderDimensions.innerText = `${e.dimensions.width}mm x ${e.dimensions.height}mm x ${e.dimensions.length}mm`;
        }
        //material
        const orderMaterial = elem.querySelector("[data-order-item='material']");
        if (orderMaterial) {
          orderMaterial.innerText = getOnMaterials(e.metadata);
        }
        //category
        const orderCategory = elem.querySelector("[data-order-item='category']");
        if (orderCategory) {
          orderCategory.innerText = e.type;
        }

        //finish
        const orderFinish = elem.querySelector("[data-order-item='color-finish']");
        if (orderFinish) {
          orderFinish.innerText = e.material;
        }
        //special function
        const orderSpecialFunction = elem.querySelector("[data-order-item='special-functions']");
        if (orderSpecialFunction) {
          orderSpecialFunction.innerText = e.specialFunction || 'No';
        }
        //special function scene
        const orderSpecialFunctionScene = elem.querySelector(
          "[data-order-item='special-functions-scene']"
        );
        if (orderSpecialFunctionScene) {
          orderSpecialFunctionScene.innerText = e.specialFunctionScene ? 'Yes' : 'No';
        }
        //view angles
        const orderViewAngles = elem.querySelector("[data-order-item='extra-view-angles']");
        if (orderViewAngles) {
          orderViewAngles.innerText = e.extras.viewangles;
        }
        //light preferences
        const orderLightPreferences = elem.querySelector("[data-order-item='light']");
        if (orderLightPreferences) {
          orderLightPreferences.innerText = e.extras.lightPreferences;
        }
        //room type
        const orderRoomType = elem.querySelector("[data-order-item='room-type']");
        if (orderRoomType) {
          orderRoomType.innerText = e.extras.roomType;
        }
        //render package
        //! needs to be changed
        const selectedRenderPackage = e.renderPackage;
        const number = selectedRenderPackage.match(/\d+/);

        const orderRenderPackage = elem.querySelector(`#details-package-${number}`);

        if (orderRenderPackage) {
          orderRenderPackage.style.display = 'block';

          // orderRenderPackage.innerText = e.renderPackage;
        }

        //end order details

        return elem;
      });
      ordersWrapper.append(...orderItems);
    }

    /**
     * list all materials that are on
     * @param metadata from dropbox
     * @returns string of materials
     */

    /**
     * get user data structure from dropbox
     */
    async function getUserDataStructure() {
      return new Promise(async (resolve, reject) => {
        try {
          const res = (await getFolderList('/CD-uploads/' + CurrentUserEmail, accessKey)) || '';

          if (res === '') {
            console.log('no folder found');
            return;
          }

          const data = JSON.parse(res);

          // Use Promise.all to wait for all asynchronous operations in the map
          await Promise.all(
            data.entries.map(async (element) => {
              userFolderStructure.push(element.path_lower);
            })
          );

          // Use Promise.all again to wait for all asynchronous operations in the second map
          await Promise.all(
            userFolderStructure.map(async (e) => {
              const result = await getFolderList(e, accessKey);
              const data = JSON.parse(result);
              userVersionedUploads.push(data);
            })
          );
          resolve(userVersionedUploads);
        } catch (error) {
          reject(error); // Reject with the error, no need for console.error here
        }
      });
    }

    /**
     * fill thumbnailSlot
     */
    async function injectThumbnail(data, htmlImage) {
      htmlImage.src = 'data:image/jpeg;base64,' + data;
    }

    //! to be removed
    async function updateToken() {
      const config = {
        method: 'get',
        url: 'https://creative-directors-dropbox.sa-60b.workers.dev/api/accesstoken',
      };
      await axios
        .request(config)
        .then((response) => {
          const res = JSON.stringify(response.data);
          accessKey = res.substring(1, res.length - 1);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    async function addDataToUserData(serverData) {
      const convertedOrder = transformData(serverData.orderMetadata);
      return new Promise(async (resolve, reject) => {
        await Promise.all(
          serverData.thumbnails.entries.map(async (e) => {
            if (e['.tag'] === 'success') {
              convertedOrder.order.images.push({
                name: e.metadata.name,
                path: e.metadata.path_display,
                thumbnail: 'data:image/jpeg;base64,' + e.thumbnail,
                imagePreview: e.metadata.previewLink.link,
              });
            }
          })
        );

        userOrders.push({ ...convertedOrder.order });
        //  - reset/clean singleOrder
        singleOrder = JSON.parse(JSON.stringify(orderTemplate));
        resolve(userOrders);
      });
    }

    //! to be removed
    async function getOrderEntries(dataset) {
      return new Promise(async (resolve, reject) => {
        await Promise.all(
          dataset.map(async (version, index) => {
            const tdata = await getThumbnailData(version, accessKey);
            await addDataToUserData(tdata);
            // console.log("🚀 ~ FINAL ~ userOrders:", userOrders);
          })
        );
        resolve(userOrders);
      });
    }

    // async function checkUserFolder(user, accessToken) {
    //   console.log("🚀 ~ checkUserFolder ~ user", user);

    //   return new Promise(async (resolve, reject) => {
    //     let result = await checkFolderExistence(user, accessToken);
    //     resolve(result);
    //   });
    // }
    /**
     * !MAIN INIT
     * init token update
     * init user Structure grabber
     */
    /*
    await updateToken()
      .then(() => checkUserFolder(CurrentUserEmail, accessKey))
      .then(() => getUserDataStructure())
      .then(() => {
        //remember the "return"
        let result = getOrderEntries(userVersionedUploads);
        return result;
      });
*/
    //!disabled for the new version that has no templates or orders to update , yet
    // .then((result) => {
    //   updateView(result, template);
    // });

    const imagesArray = [];

    if (imageInputField) {
      imageInputField.addEventListener('change', () => {
        const { files } = imageInputField;
        for (let i = 0; i < files.length; i++) {
          imagesArray.push(files[i]);
        }
        displayImages();
      });
    }
    function displayImages() {
      let images = '';
      imagesArray.forEach((image, index) => {
        console.log(' image array image : ', image.name, image.size, image.type);
        images += `<div class="upload-queue-images">
              <img src="${URL.createObjectURL(image)}" alt="image">
              <span onclick="deleteImage(${index})">&times;</span>
            </div>`;
      });
      output.innerHTML = images;
    }
    function deleteImage(index) {
      imagesArray.splice(index, 1);
      displayImages();
    }

    initializePaypal(
      '#payment_options',
      '#post-payment-alerts',
      '[order-submit="approved"]',
      paymentStatus
    );

    const updateOrderConfirmationID = (result) => {
      const orderConfirmationID = document.querySelectorAll('[data-confirmation="order-id"]');
      if (orderConfirmationID) {
        orderConfirmationID.forEach((e) => {
          e.innerHTML = result.data.fieldData['order-id'];
        });
      }
    };

    /**
     * pay later button
     */
    const payLater = document.getElementById('paylater-btn');

    if (payLater) {
      payLater.addEventListener('click', async (e) => {
        e.preventDefault();
        paymentStatus.payed = false;
        paymentStatus.paymentMethod = 'PayLater';
        // add dropshadow to the button
        payLater.style.boxShadow = '0px 0px 10px 0px #000000';

        console.log('paymentStatus', paymentStatus);
      });
    }
    //!
    //! //! ///! paas through paypal
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    // paymentStatus.payed = false;
    // paymentStatus.paymentMethod = 'PayLater';
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    //! //! //! MUST DELETE THIS
    /**
     * form submit handler
     */

    function checkUserData() {
      const placeOrderBtn = document.querySelector('[mirror-click="tab-place-order"]');
      if (!placeOrderBtn) return;
      placeOrderBtn.addEventListener('click', async () => {
        console.log('form submitted', checkUserAddressData());
        if (!checkUserAddressData()) {
          console.log('Please fill in your address details');
          // create a tag and add this attribute to it : <a mirror-click="address-modal-bg" href="#">Edit</a>
          // then click on it to open the address modal
          const editAddress = document.querySelector('[mirror-click="address-modal-bg"]');
          editAddress.click();
          return;
        }
      });
    }

    checkUserData();

    if (form)
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // checkUserAddressData

        document.querySelector("[order-submit='approved']").addEventListener('click', () => {
          console.log('clicked', this);
        });

        if (paymentStatus.paymentMethod === '') {
          alert('Please select a payment method');
          return;
        }

        // let requestNext = document.getElementById("request-next");
        // if (requestNext) {
        //   requestNext.style.opacity = "0";
        //   requestNext.style.pointerEvents = "none";
        // }
        function fetchDataFromLocalStorage() {
          const renderData = localStorage.getItem('orderData');
          const cleanArray = cleanData(JSON.parse(renderData));
          return cleanArray;
        }
        console.log('clean DATA ::##:: ', fetchDataFromLocalStorage());

        function fetchFilesFromLocalStorage() {
          const extraImgs = localStorage.getItem('orderFiles');
          const cleanArray = JSON.parse(extraImgs);
          return cleanArray;
        }
        console.log('clean FILES ::##:: ', fetchFilesFromLocalStorage());

        const localstorageData = fetchDataFromLocalStorage();
        const localstorageFiles = fetchFilesFromLocalStorage();

        const combinedArrays = combineArrays(localstorageData, localstorageFiles);
        console.log('combined files  :::--:: ', combinedArrays);

        const d = new Date();
        const DateID = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}--${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

        combinedArrays.push({ user: CurrentUserEmail });
        combinedArrays.push({ dateID: DateID });

        console.log('Final combinedArrays', combinedArrays);
        localStorage.setItem('combinedArrays', JSON.stringify(combinedArrays));

        async function uploadmetadata(combinedArrays, accesskey, subFolder) {
          return new Promise(async (resolve, reject) => {
            const requestOptions = {
              method: 'POST',
              body: JSON.stringify(combinedArrays),
              redirect: 'follow',
            };

            const uploadData = await fetch(api + '/api/uploadmetadata', requestOptions)
              .then((response) => response.json())
              .then(async (result) => {
                console.log('result from uploadmetadata .: ', result);
                //await uploadToDropbox(jsonString, pathWithExtension, accesskey);
                return result;
              })
              .catch((error) => console.log('error', error));

            resolve(uploadData);
          });
        }
        // !needs to be changed

        const f_email = CurrentUserEmail;

        // the submit button
        const submitLoading = form.querySelector("[order-submit='approved']");
        const loadingSVG = form.querySelector('[data-form="loading"]');
        console.log('**********************+');
        console.log({ submitLoading, loadingSVG });
        console.log('**********************+');

        function initLoading() {
          submitLoading.style.opacity = '80%';
          submitLoading.value = '';
          submitLoading.style.pointerEvents = 'none';
          loadingSVG.style.display = 'block';
        }

        function doneLoading() {
          submitLoading.style.opacity = '100%';
          submitLoading.value = 'DONE';
          submitLoading.style.pointerEvents = 'none';
          loadingSVG.style.display = 'none';
        }

        // Call the function with your array of images and other parameters
        showSubmitLogger();
        loggerUpdate(1);
        async function process() {
          try {
            disableAllButtons();
            const subFolder = CurrentUserEmail + '/' + DateID;
            initLoading();

            // get paymentDetails from localStorage
            const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));
            // Uncomment if needed
            // submitLoading.style.pointerEvents = 'none';

            //add total price to the combinedArrays
            combinedArrays.push({ paymentDetails });

            console.log('combinedArrays', combinedArrays);
            console.log('paymentDetails', paymentDetails);

            const Final = await uploadmetadata(combinedArrays, accessKey, subFolder);
            console.log('All images processed.');

            loggerUpdate(2);
            console.log('Final', Final);

            // Uncomment if needed
            const pdfFile = await generateInvoice({
              finalData: {
                combinedArrays,
                finalCMSresponse: Final,
              },
            });
            const pdfLink = await uploadInvoice(pdfFile, Final.fullPath);
            const userEmail = document.querySelector('[data-user-email]').innerText;
            const send = await sendInvoice(pdfLink.linkarray, userEmail);
            await uploadInvoiceToCMS(pdfLink.linkarray, Final.response);
            console.log({ pdfFile });

            // Example function call, comment out if not needed
            // uploadInvoice();

            loggerUpdate(3);
            loggerUpdate(4);
            // updateOrderConfirmationID(Final);
            loggerUpdate(5);

            setTimeout(() => {
              hideSubmitLogger();
            }, 2000);

            enableAllButtons();
            // clickTab(3);
            doneLoading();
            clearLocalStorage('upload_urls', 'FormInputHolder', 'paymentDetails', 'extraImgs');

            // Uncomment if needed
            // reloadPage();

            return Final;
          } catch (error) {
            console.error('Error processing images:', error);
          }
        }

        // Call the process function
        await process();
        goToHistory();
        checkGoToHistory();
      });
  }

  function goToHistory() {
    // Set a flag in local storage
    localStorage.setItem('goToHistory', 'true');
    // Reload the page
    window.location.reload();
  }

  // This function should be called on page load to check for the flag and click the tab if needed
  function checkGoToHistory() {
    const goToHistory = localStorage.getItem('goToHistory');
    if (goToHistory) {
      const tab = document.querySelector('[mirror-click="tab-history"]');
      if (tab) {
        tab.click();
      }
      // Remove the flag from local storage
      localStorage.removeItem('goToHistory');
    }
  }

  console.log('ENV ===> ', process.env.NODE_ENV);
  console.log(process.env.NODE_ENV === 'development' ? '_____*_LOCALHOST_*____' : '***_CDN_***');

  // function testInvoice() {
  //   document.querySelector('#invoice-test-btn')?.addEventListener('click', async () => {
  //     const paymentDetails = {
  //       finalData: {
  //         combinedArrays: [
  //           {
  //             id: '1',
  //             data: [
  //               {
  //                 render: {
  //                   'item-name': 'nico',
  //                   'item-width': '54',
  //                   'item-height': '54',
  //                   'item-length': '12',
  //                   'item-details': '12',
  //                   photos_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png',
  //                   'uploader-file-input-0.jpv5pcjg2pf': 'C:\\fakepath\\2.png',
  //                   'provided-3D-model': 'false',
  //                   threed_output_string: '',
  //                   'uploader-file-input-0.vh7k38pz7c': '',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'scene',
  //                   woodtype: 'beech',
  //                   'render-count': '5',
  //                   upholstery: 'false',
  //                   'other-material': '',
  //                   square: 'false',
  //                   portrait: 'false',
  //                   Landscape: 'false',
  //                   'request-comment': '',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'knockout',
  //                   woodtype: 'beech',
  //                   'render-count': '10',
  //                   upholstery: 'false',
  //                   'other-material': '',
  //                   square: 'false',
  //                   portrait: 'false',
  //                   Landscape: 'false',
  //                   'request-comment': '',
  //                 },
  //               },
  //             ],
  //             files: {
  //               images: [
  //                 {
  //                   id: '1',
  //                   array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png'],
  //                 },
  //               ],
  //               files: [],
  //             },
  //           },
  //           {
  //             id: '2',
  //             data: [
  //               {
  //                 render: {
  //                   'item-name': 'slim',
  //                   'item-width': '12',
  //                   'item-height': '55',
  //                   'item-length': '67',
  //                   'item-details': '',
  //                   photos_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png',
  //                   'uploader-file-input-0.falersl2x6o': 'C:\\fakepath\\1.png',
  //                   'provided-3D-model': 'false',
  //                   threed_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
  //                   'uploader-file-input-0.iyu9c1ra2k': 'C:\\fakepath\\xx.zip',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'scene',
  //                   woodtype: 'wallnut',
  //                   'render-count': '6',
  //                   upholstery: 'false',
  //                   'other-material': '',
  //                   square: 'false',
  //                   portrait: 'false',
  //                   Landscape: 'false',
  //                   'request-comment': '',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'knockout',
  //                   woodtype: 'beech',
  //                   'render-count': '4',
  //                   upholstery: 'true',
  //                   'other-material': 'lether',
  //                   square: 'true',
  //                   portrait: 'true',
  //                   Landscape: 'false',
  //                   'request-comment': '',
  //                 },
  //               },
  //             ],
  //             files: {
  //               images: [
  //                 {
  //                   id: '2',
  //                   array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png'],
  //                 },
  //               ],
  //               files: [
  //                 {
  //                   id: '2',
  //                   array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip'],
  //                 },
  //               ],
  //             },
  //           },
  //           {
  //             user: '4ce7669f050042d09499b786f19d4beb',
  //           },
  //           {
  //             dateID: '14-5-2024--6:33:16',
  //           },
  //           {
  //             paymentDetails: {
  //               order: {
  //                 result: 'success',
  //                 data: {
  //                   id: '14P847251X0838603',
  //                   status: 'CREATED',
  //                   links: [
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603',
  //                       rel: 'self',
  //                       method: 'GET',
  //                     },
  //                     {
  //                       href: 'https://www.sandbox.paypal.com/checkoutnow?token=14P847251X0838603',
  //                       rel: 'approve',
  //                       method: 'GET',
  //                     },
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603',
  //                       rel: 'update',
  //                       method: 'PATCH',
  //                     },
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603/capture',
  //                       rel: 'capture',
  //                       method: 'POST',
  //                     },
  //                   ],
  //                 },
  //                 order_data_json: {
  //                   intent: 'CAPTURE',
  //                   purchase_units: [
  //                     {
  //                       amount: {
  //                         currency_code: 'EUR',
  //                         value: '4425',
  //                         breakdown: {
  //                           item_total: {
  //                             currency_code: 'EUR',
  //                             value: '4425',
  //                           },
  //                         },
  //                       },
  //                       items: [
  //                         {
  //                           name: 'processing Fee',
  //                           quantity: '1',
  //                           description: 'service',
  //                           category: 'DIGITAL_GOODS',
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: 300,
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: 300,
  //                               },
  //                             },
  //                           },
  //                         },
  //                         {
  //                           name: 'nico',
  //                           quantity: '1',
  //                           description: 'nico',
  //                           category: 'DIGITAL_GOODS',
  //                           allRenderPricing: [
  //                             {
  //                               render: 400,
  //                               prespectives: 425,
  //                               woodtype: 300,
  //                             },
  //                             {
  //                               render: 150,
  //                               prespectives: 850,
  //                               woodtype: 0,
  //                             },
  //                           ],
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: '2125',
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: '2125',
  //                               },
  //                             },
  //                           },
  //                         },
  //                         {
  //                           name: 'slim',
  //                           quantity: '1',
  //                           description: 'slim',
  //                           category: 'DIGITAL_GOODS',
  //                           allRenderPricing: [
  //                             {
  //                               render: 400,
  //                               prespectives: 510,
  //                               woodtype: 300,
  //                             },
  //                             {
  //                               render: 150,
  //                               prespectives: 340,
  //                               woodtype: 300,
  //                             },
  //                           ],
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: '2000',
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: '2000',
  //                               },
  //                             },
  //                           },
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //                 total: 4425,
  //                 orderItems: [
  //                   {
  //                     name: 'processing Fee',
  //                     quantity: '1',
  //                     description: 'service',
  //                     category: 'DIGITAL_GOODS',
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: 300,
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: 300,
  //                         },
  //                       },
  //                     },
  //                   },
  //                   {
  //                     name: 'nico',
  //                     quantity: '1',
  //                     description: 'nico',
  //                     category: 'DIGITAL_GOODS',
  //                     allRenderPricing: [
  //                       {
  //                         render: 400,
  //                         prespectives: 425,
  //                         woodtype: 300,
  //                       },
  //                       {
  //                         render: 150,
  //                         prespectives: 850,
  //                         woodtype: 0,
  //                       },
  //                     ],
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: '2125',
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: '2125',
  //                         },
  //                       },
  //                     },
  //                   },
  //                   {
  //                     name: 'slim',
  //                     quantity: '1',
  //                     description: 'slim',
  //                     category: 'DIGITAL_GOODS',
  //                     allRenderPricing: [
  //                       {
  //                         render: 400,
  //                         prespectives: 510,
  //                         woodtype: 300,
  //                       },
  //                       {
  //                         render: 150,
  //                         prespectives: 340,
  //                         woodtype: 300,
  //                       },
  //                     ],
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: '2000',
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: '2000',
  //                         },
  //                       },
  //                     },
  //                   },
  //                 ],
  //               },
  //             },
  //           },
  //         ],
  //         finalCMSresponse: {
  //           result: 'success',
  //           response: [
  //             {
  //               id: '666bc823b0fca6955614f1ac',
  //               cmsLocaleId: null,
  //               lastPublished: '2024-06-14T04:33:39.094Z',
  //               lastUpdated: '2024-06-14T04:33:39.094Z',
  //               createdOn: '2024-06-14T04:33:39.094Z',
  //               isArchived: false,
  //               isDraft: false,
  //               fieldData: {
  //                 specialfunctionscene: false,
  //                 'furniture-dimension-h': 54,
  //                 'furniture-dimension-l': 12,
  //                 'furniture-dimension-w': 54,
  //                 'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //                 payment: 'PayPal Services',
  //                 'furniture-name': 'nico',
  //                 name: 'nico',
  //                 'color-finish': 'beech / beech',
  //                 comment: '12',
  //                 'order-id': 'REND-20240614-0004',
  //                 'order-date': 'Fri Jun 14 2024 06:33:37 GMT+0200 (Central European Summer Time)',
  //                 'additional-images-data':
  //                   '[{"render":{"item-name":"nico","item-width":"54","item-height":"54","item-length":"12","item-details":"12","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png","uploader-file-input-0.jpv5pcjg2pf":"C:\\\\fakepath\\\\2.png","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.vh7k38pz7c":""}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"5","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"10","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
  //                 slug: 'nico-8cd9d',
  //                 'test-image': {
  //                   fileId: '666b532975a6b137f75f43ea',
  //                   url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
  //                   alt: null,
  //                 },
  //                 'uploaded-images': [
  //                   {
  //                     fileId: '666b532975a6b137f75f43ea',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
  //                     alt: null,
  //                   },
  //                 ],
  //                 'user-id': '6620e095b1681d9809914b31',
  //               },
  //             },
  //             {
  //               id: '666bc8231ab1b49a4ff1bf7c',
  //               cmsLocaleId: null,
  //               lastPublished: '2024-06-14T04:33:39.158Z',
  //               lastUpdated: '2024-06-14T04:33:39.158Z',
  //               createdOn: '2024-06-14T04:33:39.158Z',
  //               isArchived: false,
  //               isDraft: false,
  //               fieldData: {
  //                 'file-link': 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
  //                 specialfunctionscene: false,
  //                 comment: null,
  //                 'furniture-dimension-h': 55,
  //                 'furniture-dimension-l': 67,
  //                 'furniture-dimension-w': 12,
  //                 'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //                 payment: 'PayPal Services',
  //                 'furniture-name': 'slim',
  //                 name: 'slim',
  //                 'color-finish': 'wallnut / beech',
  //                 'order-id': 'REND-20240614-0004',
  //                 'order-date': 'Fri Jun 14 2024 06:33:37 GMT+0200 (Central European Summer Time)',
  //                 'additional-images-data':
  //                   '[{"render":{"item-name":"slim","item-width":"12","item-height":"55","item-length":"67","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png","uploader-file-input-0.falersl2x6o":"C:\\\\fakepath\\\\1.png","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip","uploader-file-input-0.iyu9c1ra2k":"C:\\\\fakepath\\\\xx.zip"}},{"render":{"render-type":"scene","woodtype":"wallnut","render-count":"6","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"4","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"false","request-comment":""}}]',
  //                 slug: 'slim-d3a3d',
  //                 'test-image': {
  //                   fileId: '666b4df96f08ff6ffc53b436',
  //                   url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
  //                   alt: null,
  //                 },
  //                 'uploaded-images': [
  //                   {
  //                     fileId: '666b4df96f08ff6ffc53b436',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
  //                     alt: null,
  //                   },
  //                 ],
  //                 'user-id': '6620e095b1681d9809914b31',
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     };

  //     const paymentDetails2 = {
  //       finalData: {
  //         combinedArrays: [
  //           {
  //             id: '1',
  //             data: [
  //               {
  //                 render: {
  //                   'item-name': 'BIGBED',
  //                   'item-width': '1200',
  //                   'item-height': '1700',
  //                   'item-length': '3000',
  //                   'item-details': 'I want it big',
  //                   photos_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png',
  //                   'uploader-file-input-0.fvi5rbs8kzw': 'C:\\fakepath\\1.png',
  //                   'provided-3D-model': 'false',
  //                   threed_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
  //                   'uploader-file-input-0.1npr3qe67bb': 'C:\\fakepath\\xx.zip',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'scene',
  //                   woodtype: 'beech',
  //                   'render-count': '3',
  //                   upholstery: 'true',
  //                   'other-material': 'lether',
  //                   square: 'true',
  //                   portrait: 'true',
  //                   Landscape: 'true',
  //                   'request-comment': '',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'knockout',
  //                   woodtype: 'beech',
  //                   'render-count': '5',
  //                   upholstery: 'true',
  //                   'other-material': 'lether',
  //                   square: 'true',
  //                   portrait: 'true',
  //                   Landscape: 'true',
  //                   'request-comment': '',
  //                 },
  //               },
  //             ],
  //             files: {
  //               images: [
  //                 {
  //                   id: '1',
  //                   array: [
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png',
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png',
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png',
  //                   ],
  //                 },
  //               ],
  //               files: [
  //                 {
  //                   id: '1',
  //                   array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip'],
  //                 },
  //               ],
  //             },
  //           },
  //           {
  //             id: '2',
  //             data: [
  //               {
  //                 render: {
  //                   'item-name': 'TABLE',
  //                   'item-width': '1500',
  //                   'item-height': '1840',
  //                   'item-length': '2000',
  //                   'item-details': '',
  //                   photos_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png',
  //                   'uploader-file-input-0.rjseib9fotp': 'C:\\fakepath\\brb.webp',
  //                   'provided-3D-model': 'false',
  //                   threed_output_string:
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
  //                   'uploader-file-input-0.1jwpw1zirz6':
  //                     'C:\\fakepath\\SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26 (1).zip',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'scene',
  //                   woodtype: 'oak',
  //                   'render-count': '12',
  //                   upholstery: 'true',
  //                   'other-material': 'lether',
  //                   square: 'true',
  //                   portrait: 'true',
  //                   Landscape: 'true',
  //                   'request-comment': 'smoooll',
  //                 },
  //               },
  //               {
  //                 render: {
  //                   'render-type': 'knockout',
  //                   woodtype: 'beech',
  //                   'render-count': '5',
  //                   upholstery: 'true',
  //                   'other-material': 'lether',
  //                   square: 'true',
  //                   portrait: 'true',
  //                   Landscape: 'true',
  //                   'request-comment': '',
  //                 },
  //               },
  //             ],
  //             files: {
  //               images: [
  //                 {
  //                   id: '2',
  //                   array: [
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp',
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png',
  //                   ],
  //                 },
  //               ],
  //               files: [
  //                 {
  //                   id: '2',
  //                   array: [
  //                     'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
  //                   ],
  //                 },
  //               ],
  //             },
  //           },
  //           {
  //             user: '4ce7669f050042d09499b786f19d4beb',
  //           },
  //           {
  //             dateID: '14-5-2024--7:50:32',
  //           },
  //           {
  //             paymentDetails: {
  //               order: {
  //                 result: 'success',
  //                 data: {
  //                   id: '04M79818KT996911V',
  //                   status: 'CREATED',
  //                   links: [
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V',
  //                       rel: 'self',
  //                       method: 'GET',
  //                     },
  //                     {
  //                       href: 'https://www.sandbox.paypal.com/checkoutnow?token=04M79818KT996911V',
  //                       rel: 'approve',
  //                       method: 'GET',
  //                     },
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V',
  //                       rel: 'update',
  //                       method: 'PATCH',
  //                     },
  //                     {
  //                       href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V/capture',
  //                       rel: 'capture',
  //                       method: 'POST',
  //                     },
  //                   ],
  //                 },
  //                 order_data_json: {
  //                   intent: 'CAPTURE',
  //                   purchase_units: [
  //                     {
  //                       amount: {
  //                         currency_code: 'EUR',
  //                         value: '4425',
  //                         breakdown: {
  //                           item_total: {
  //                             currency_code: 'EUR',
  //                             value: '4425',
  //                           },
  //                         },
  //                       },
  //                       items: [
  //                         {
  //                           name: 'processing Fee',
  //                           quantity: '1',
  //                           description: 'service',
  //                           category: 'DIGITAL_GOODS',
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: 300,
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: 300,
  //                               },
  //                             },
  //                           },
  //                         },
  //                         {
  //                           name: 'BIGBED',
  //                           quantity: '1',
  //                           description: 'BIGBED',
  //                           category: 'DIGITAL_GOODS',
  //                           allRenderPricing: [
  //                             {
  //                               render: 400,
  //                               prespectives: 255,
  //                               woodtype: 300,
  //                             },
  //                             {
  //                               render: 150,
  //                               prespectives: 425,
  //                               woodtype: 0,
  //                             },
  //                           ],
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: '1530',
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: '1530',
  //                               },
  //                             },
  //                           },
  //                         },
  //                         {
  //                           name: 'TABLE',
  //                           quantity: '1',
  //                           description: 'TABLE',
  //                           category: 'DIGITAL_GOODS',
  //                           allRenderPricing: [
  //                             {
  //                               render: 400,
  //                               prespectives: 1020,
  //                               woodtype: 300,
  //                             },
  //                             {
  //                               render: 150,
  //                               prespectives: 425,
  //                               woodtype: 300,
  //                             },
  //                           ],
  //                           unit_amount: {
  //                             currency_code: 'EUR',
  //                             value: '2595',
  //                             breakdown: {
  //                               item_total: {
  //                                 currency_code: 'EUR',
  //                                 value: '2595',
  //                               },
  //                             },
  //                           },
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //                 total: 4425,
  //                 orderItems: [
  //                   {
  //                     name: 'processing Fee',
  //                     quantity: '1',
  //                     description: 'service',
  //                     category: 'DIGITAL_GOODS',
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: 300,
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: 300,
  //                         },
  //                       },
  //                     },
  //                   },
  //                   {
  //                     name: 'BIGBED',
  //                     quantity: '1',
  //                     description: 'BIGBED',
  //                     category: 'DIGITAL_GOODS',
  //                     allRenderPricing: [
  //                       {
  //                         render: 400,
  //                         prespectives: 255,
  //                         woodtype: 300,
  //                       },
  //                       {
  //                         render: 150,
  //                         prespectives: 425,
  //                         woodtype: 0,
  //                       },
  //                     ],
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: '1530',
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: '1530',
  //                         },
  //                       },
  //                     },
  //                   },
  //                   {
  //                     name: 'TABLE',
  //                     quantity: '1',
  //                     description: 'TABLE',
  //                     category: 'DIGITAL_GOODS',
  //                     allRenderPricing: [
  //                       {
  //                         render: 400,
  //                         prespectives: 1020,
  //                         woodtype: 300,
  //                       },
  //                       {
  //                         render: 150,
  //                         prespectives: 425,
  //                         woodtype: 300,
  //                       },
  //                     ],
  //                     unit_amount: {
  //                       currency_code: 'EUR',
  //                       value: '2595',
  //                       breakdown: {
  //                         item_total: {
  //                           currency_code: 'EUR',
  //                           value: '2595',
  //                         },
  //                       },
  //                     },
  //                   },
  //                 ],
  //               },
  //             },
  //           },
  //         ],
  //         finalCMSresponse: {
  //           result: 'success',
  //           response: [
  //             {
  //               id: '666bda421ba7f1ace30d3e51',
  //               cmsLocaleId: null,
  //               lastPublished: '2024-06-14T05:50:58.086Z',
  //               lastUpdated: '2024-06-14T05:50:58.086Z',
  //               createdOn: '2024-06-14T05:50:58.086Z',
  //               isArchived: false,
  //               isDraft: false,
  //               fieldData: {
  //                 'file-link': 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
  //                 specialfunctionscene: false,
  //                 'furniture-dimension-h': 1700,
  //                 'furniture-dimension-l': 3000,
  //                 'furniture-dimension-w': 1200,
  //                 'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //                 payment: 'PayPal Services',
  //                 'furniture-name': 'BIGBED',
  //                 name: 'BIGBED',
  //                 'color-finish': 'beech / beech',
  //                 comment: 'I want it big',
  //                 'order-id': 'REND-20240614-0006',
  //                 'order-date': 'Fri Jun 14 2024 07:50:55 GMT+0200 (Central European Summer Time)',
  //                 'additional-images-data':
  //                   '[{"render":{"item-name":"BIGBED","item-width":"1200","item-height":"1700","item-length":"3000","item-details":"I want it big","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png","uploader-file-input-0.fvi5rbs8kzw":"C:\\\\fakepath\\\\1.png","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip","uploader-file-input-0.1npr3qe67bb":"C:\\\\fakepath\\\\xx.zip"}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"3","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"5","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}}]',
  //                 'test-image': {
  //                   fileId: '666b4df96f08ff6ffc53b436',
  //                   url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
  //                   alt: null,
  //                 },
  //                 slug: 'bigbed',
  //                 'uploaded-images': [
  //                   {
  //                     fileId: '666b4df96f08ff6ffc53b436',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
  //                     alt: null,
  //                   },
  //                   {
  //                     fileId: '666b532975a6b137f75f43ea',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
  //                     alt: null,
  //                   },
  //                   {
  //                     fileId: '666b4df98ed0ea987ad6b06f',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df98ed0ea987ad6b06f_3.png',
  //                     alt: null,
  //                   },
  //                 ],
  //                 'user-id': '6620e095b1681d9809914b31',
  //               },
  //             },
  //             {
  //               id: '666bda42062d41a9129f4e2c',
  //               cmsLocaleId: null,
  //               lastPublished: '2024-06-14T05:50:58.035Z',
  //               lastUpdated: '2024-06-14T05:50:58.035Z',
  //               createdOn: '2024-06-14T05:50:58.035Z',
  //               isArchived: false,
  //               isDraft: false,
  //               fieldData: {
  //                 'file-link':
  //                   'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
  //                 specialfunctionscene: false,
  //                 comment: null,
  //                 'furniture-dimension-h': 1840,
  //                 'furniture-dimension-l': 2000,
  //                 'furniture-dimension-w': 1500,
  //                 'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //                 payment: 'PayPal Services',
  //                 'furniture-name': 'TABLE',
  //                 name: 'TABLE',
  //                 'color-finish': 'oak / beech',
  //                 'order-id': 'REND-20240614-0006',
  //                 'order-date': 'Fri Jun 14 2024 07:50:55 GMT+0200 (Central European Summer Time)',
  //                 'additional-images-data':
  //                   '[{"render":{"item-name":"TABLE","item-width":"1500","item-height":"1840","item-length":"2000","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png","uploader-file-input-0.rjseib9fotp":"C:\\\\fakepath\\\\brb.webp","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip","uploader-file-input-0.1jwpw1zirz6":"C:\\\\fakepath\\\\SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26 (1).zip"}},{"render":{"render-type":"scene","woodtype":"oak","render-count":"12","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":"smoooll"}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"5","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}}]',
  //                 slug: 'table',
  //                 'test-image': {
  //                   fileId: '666bda41062d41a9129f4e0e',
  //                   url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e0e_brb.webp',
  //                   alt: null,
  //                 },
  //                 'uploaded-images': [
  //                   {
  //                     fileId: '666bda41062d41a9129f4e0b',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e0b_brb.webp',
  //                     alt: null,
  //                   },
  //                   {
  //                     fileId: '666bda41062d41a9129f4e23',
  //                     url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e23_Untitled.png',
  //                     alt: null,
  //                   },
  //                 ],
  //                 'user-id': '6620e095b1681d9809914b31',
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     };

  //     const cmsOutput = [
  //       {
  //         id: '666bdf5eeda387e0e3879517',
  //         cmsLocaleId: null,
  //         lastPublished: '2024-06-14T06:12:46.483Z',
  //         lastUpdated: '2024-06-14T06:12:46.483Z',
  //         createdOn: '2024-06-14T06:12:46.483Z',
  //         isArchived: false,
  //         isDraft: false,
  //         fieldData: {
  //           specialfunctionscene: false,
  //           comment: null,
  //           'furniture-dimension-h': 21,
  //           'furniture-dimension-l': 654,
  //           'furniture-dimension-w': 54,
  //           'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //           payment: 'PayPal Services',
  //           'furniture-name': 'nico',
  //           name: 'nico',
  //           'color-finish': 'beech',
  //           'order-id': 'REND-20240614-0010',
  //           'order-date': 'Fri Jun 14 2024 08:12:42 GMT+0200 (Central European Summer Time)',
  //           'additional-images-data':
  //             '[{"render":{"item-name":"nico","item-width":"54","item-height":"21","item-length":"654","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713@1@k.jpg","uploader-file-input-0.k32682jzfqp":"C:\\\\fakepath\\\\mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713@1@k.jpg","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.1bwuvfd8p03":""}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"12","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
  //           slug: 'nico-cc062',
  //           'test-image': {
  //             fileId: '666bdf5ceda387e0e38792f6',
  //             url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5ceda387e0e38792f6_mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713%401%40k.jpeg',
  //             alt: null,
  //           },
  //           'uploaded-images': [
  //             {
  //               fileId: '666bdf5ceda387e0e38792f6',
  //               url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5ceda387e0e38792f6_mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713%401%40k.jpeg',
  //               alt: null,
  //             },
  //           ],
  //           'user-id': '6620e095b1681d9809914b31',
  //         },
  //       },
  //       {
  //         id: '666bdf5c200bc6a1f54bd7f4',
  //         cmsLocaleId: null,
  //         lastPublished: '2024-06-14T06:12:44.564Z',
  //         lastUpdated: '2024-06-14T06:12:44.564Z',
  //         createdOn: '2024-06-14T06:12:44.564Z',
  //         isArchived: false,
  //         isDraft: false,
  //         fieldData: {
  //           specialfunctionscene: false,
  //           comment: null,
  //           'furniture-dimension-h': 34,
  //           'furniture-dimension-l': 56,
  //           'furniture-dimension-w': 34,
  //           'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //           payment: 'PayPal Services',
  //           'furniture-name': '321321',
  //           name: '321321',
  //           'color-finish': 'beech',
  //           'order-id': 'REND-20240614-0010',
  //           'order-date': 'Fri Jun 14 2024 08:12:42 GMT+0200 (Central European Summer Time)',
  //           'additional-images-data':
  //             '[{"render":{"item-name":"321321","item-width":"34","item-height":"34","item-length":"56","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683@1@k.jpg","uploader-file-input-0.8ev12rh8lof":"C:\\\\fakepath\\\\night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683@1@k.jpg","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.xrw069ygho":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"3","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
  //           slug: '321321-ec190',
  //           'test-image': {
  //             fileId: '666bdf5c200bc6a1f54bd7c2',
  //             url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5c200bc6a1f54bd7c2_night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683%401%40k.jpeg',
  //             alt: null,
  //           },
  //           'uploaded-images': [
  //             {
  //               fileId: '666bdf5c200bc6a1f54bd7c2',
  //               url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5c200bc6a1f54bd7c2_night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683%401%40k.jpeg',
  //               alt: null,
  //             },
  //           ],
  //           'user-id': '6620e095b1681d9809914b31',
  //         },
  //       },
  //     ];

  //     const pdfLink =
  //       'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Invoice_REND-20240614-0010';

  //     // Uncomment if needed
  //     const pdfFile = await generateInvoice(paymentDetails2);
  //     // const TEST_invoiceToCms = uploadInvoiceToCMS(pdfLink, cmsOutput);

  //     console.log({ pdfFile });
  //   });
  // }

  // testInvoice();
  initAuth();
  init();
  // checkRequiredFields();

  // function that disables all buttons and links on the page
  function disableAllButtons() {
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach((button) => {
      button.disabled = true;
    });
  }
  // function that enables all buttons and links on the page
  function enableAllButtons() {
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }

  // function that clears the passed names from local storage
  function clearLocalStorage(...names) {
    // names.forEach((name) => {
    //   localStorage.removeItem(name);
    // });
    const keeper = localStorage.getItem('tabStates');
    localStorage.clear();
    localStorage.setItem('tabStates', keeper);
  }

  // saveInputToLocalHost();
  frontEndElementsJS();
  //!use this after Final success
  //!clickTab(3);

  //***** webflow Elements Functions //

  //update user address through the add/update user address form popout
  updateUserAddress();
  clearLocalStorageOnLogout();

  // dataChecker();

  // const returndata = {
  //   result: 'success',
  //   data: {
  //     id: '661e834ccbc2eba3caf47129',
  //     cmsLocaleId: null,
  //     lastPublished: '2024-04-16T13:55:24.048Z',
  //     lastUpdated: '2024-04-16T13:55:24.048Z',
  //     createdOn: '2024-04-16T13:55:24.048Z',
  //     isArchived: false,
  //     isDraft: false,
  //     fieldData: {
  //       specialfunctionscene: false,
  //       'file-link': 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Archive.zip',
  //       'furniture-dimension-h': 54,
  //       'furniture-dimension-l': 54,
  //       'furniture-dimension-w': 12,
  //       'order-state': '3a8b108b469a23d52b620cb75b914d77',
  //       payment: 'PayPal',
  //       'furniture-name': 'XYZ',
  //       name: 'XYZ',
  //       specialfunction: '',
  //       'color-finish': 'Walnut',
  //       'dimensions-comment': 'this is a comment',
  //       'order-id': 'REND-20240416-0010',
  //       'order-date': 'Tue Apr 16 2024 15:55:22 GMT+0200 (Central European Summer Time)',
  //       'additional-images-data':
  //         '[{"sceneKnockout":"Knockout","woodType":"oak","amount":"6","comment":""},{"sceneKnockout":"Scene","woodType":"walnut","amount":"2","comment":""},{"sceneKnockout":"Scene","woodType":"whiteoak","amount":"4","comment":""}]',
  //       slug: 'xyz-3f5bc',
  //       'uploaded-images': [
  //         {
  //           fileId: '66165218cafe597f9bd457d1',
  //           url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/66165218cafe597f9bd457d1_11.jpeg',
  //           alt: null,
  //         },
  //       ],
  //       'test-image': {
  //         fileId: '66165218cafe597f9bd457d1',
  //         url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/66165218cafe597f9bd457d1_11.jpeg',
  //         alt: null,
  //       },
  //       'user-id': '6617f9475a49a8be5bcf0aa9',
  //     },
  //   },
  // };

  // const fullPath = '/CD-uploads/d1f1f37422a24359982cfe07d39c69b9/17-3-2024--11:4:58';

  // const pdfFile = await generateInvoice(returndata.data.fieldData);

  // const pdfLink = await uploadInvoice(pdfFile, fullPath);
  // const userEmail = document.querySelector("[data-user='email']").innerText;
  // const send = await sendInvoice(pdfLink.linkarray, userEmail);

  // console.log({ pdfFile, pdfLink, send });
});
