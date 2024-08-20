import { initInstances } from '$extras/uploaderInstances.js';
import combineArrays from '$utils/dataPriceCombiner.js';
import { frontEndElementsJS } from '$utils/frontEndElements';
import { generateInvoice } from '$utils/invoiceGenerator';
import { initializePaypal } from '$utils/paypal.js';
import cleanData from '$utils/renderDataCleaner.js';
import {
  hideSubmitLogger,
  loggerUpdate,
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
  updateUserAddress,
} from '$utils/webflowScripts.js';

import { initAuth } from './auth/userAuth';
import { initOrderHistory } from './user/orderHistory';

window.Webflow ||= [];
window.Webflow.push(async () => {
  // init instances
  initAuth();
  initInstances();
  orderAppFunctions();
  initWebflowFunctions();

  if (window.location.pathname === '/user/order-history') {
    console.log('order history page');

    const info = await initOrderHistory();
    console.log('info', info);
  }

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

  const GetCurrentUserEmail = () => {
    //get user data from localstorage
    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.error('!! No user data found in local storage');
      return;
    }
    const user = JSON.parse(userData);
    if (!user.email) {
      console.error('!! No user email found');
      return;
    }
    return user.email;
  };

  async function init() {
    console.log('init');

    // old form ID
    const form = document.getElementById('wf-form-mainFormSubmission');

    //get user from localstorage (loged in user)
    const CurrentUserEmail = GetCurrentUserEmail();
    // [0].entries[0].path_display

    initializePaypal(
      '#payment_options',
      '#post-payment-alerts',
      '[order-submit="approved"]',
      paymentStatus
    );

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

    //! //! ///! paas through paypal
    //! //! //! MUST DELETE THIS
    // paymentStatus.payed = false;
    // paymentStatus.paymentMethod = 'PayLater';

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

        //! change to get user email from localstorage (loged in user)

        combinedArrays.push({ user: CurrentUserEmail });
        combinedArrays.push({ dateID: DateID });

        console.log(' 🔥 🔥 - Final combinedArrays', combinedArrays);
        localStorage.setItem('combinedArrays', JSON.stringify(combinedArrays));

        async function uploadmetadata(combinedArrays) {
          const token = localStorage.getItem('userToken');
          if (!token) {
            console.error('No token found in local storage');
            return;
          }
          return new Promise(async (resolve) => {
            const requestOptions = {
              method: 'POST',
              body: JSON.stringify(combinedArrays),
              redirect: 'follow',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            };

            const uploadData = await fetch(api + '/api/uploadmetadata', requestOptions)
              .then((response) => response.json())
              .then(async (result) => {
                console.log('result from uploadmetadata .: ', result);
                //await uploadToDropbox(jsonString, pathWithExtension, accesskey);
                return result;
              })
              .catch((error) => console.error('error', error));

            resolve(uploadData);
          });
        }
        // the submit button
        const submitLoading = form.querySelector("[order-submit='approved']");
        const loadingSVG = form.querySelector('[data-form="loading"]');
        console.log('**********************+');
        console.log({ submitLoading, loadingSVG });
        console.log('**********************+');

        function initLoading() {
          if (!submitLoading || !loadingSVG) return;
          submitLoading.style.opacity = '80%';
          submitLoading.value = '';
          submitLoading.style.pointerEvents = 'none';
          loadingSVG.style.display = 'block';
        }

        function doneLoading() {
          if (!submitLoading || !loadingSVG) return;
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
            initLoading();

            // get paymentDetails from localStorage
            const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));
            // Uncomment if needed
            // submitLoading.style.pointerEvents = 'none';

            //add total price to the combinedArrays
            combinedArrays.push({ paymentDetails });

            console.log('🔥combinedArrays', combinedArrays);
            console.log('paymentDetails', paymentDetails);

            const Final = await uploadmetadata(combinedArrays);
            console.log('All images processed.');

            loggerUpdate(2);
            console.log('Final', Final);

            // Uncomment if needed
            // const pdfFile = await generateInvoice({
            //   finalData: {
            //     combinedArrays,
            //     finalCMSresponse: Final,
            //   },
            // });

            // const pdfLink = await uploadInvoice(pdfFile, Final.fullPath);
            // const userEmail = document.querySelector('[data-user-email]')?.innerText;
            // const send = await sendInvoice(pdfLink.linkarray, userEmail);
            // await uploadInvoiceToCMS(pdfLink.linkarray, Final.response);
            // console.log({ pdfFile });

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
        // goToHistory();
        // checkGoToHistory();
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
});
