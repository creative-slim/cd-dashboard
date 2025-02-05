import { initInstances } from '$extras/uploaderInstances.js';
import combineArrays from '$utils/dataPriceCombiner.js';
import { frontEndElementsJS } from '$utils/frontEndElements';
import { generateInvoice } from '$utils/invoiceGenerator';
import { initializePaypal } from '$utils/paypal.js';
import cleanData from '$utils/renderDataCleaner.js';
import {
  getInvoiceDataForCurrentOrder,
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

import initMainAdminDashboard from './admin/dashboard/main';
import { initAuth } from './auth/userAuth';
import testInvoice from './extras/testInvoice';
import getCurrentPage from './general/getCurrentPage';
import getEndpoint from './general/getEndpoint';
import initOrderAccessChecker from './orders/orderAccessChecker';
import { fillOrderDetails } from './orders/orderDetailsPage';
import { couponHandler } from './place_order/couponHandler';
// import CartUI from './place_order/cart';
import App from './place_order/orderApp';
import { initOrderHistory } from './user/orderHistory';
import initUserRelatedFunctions from './user/userMainExport';
window.Webflow ||= [];
window.Webflow.push(async () => {
  // init instances
  console.groupCollapsed('initAuth');

  initAuth();
  console.groupEnd('initAuth');

  // initInstances();
  // orderAppFunctions(); //! FUNCTION >> switching to class based approach
  if (getCurrentPage() === 'order-app') new App(); //? CLASS >>  switching to class based approach
  if (getCurrentPage() === 'order-details') {
    fillOrderDetails();

    initOrderAccessChecker();
  }

  // cart
  initWebflowFunctions();
  initUserRelatedFunctions();

  if (getCurrentPage() === 'order-history') {
    const info = await initOrderHistory();
  }
  if (getCurrentPage() === 'admin-dashboard') {
    initMainAdminDashboard();
  }

  //! API ENDPOINTS
  // const server = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  // const local = 'http://localhost:8787';

  //?change this to switch between local and server
  const api = getEndpoint();

  //! END API ENDPOINTS

  const paymentStatus = {
    payed: false,
    paymentMethod: '',
  };

  const GetCurrentUserEmail = () => {
    //get user data from localstorage
    const userData = localStorage.getItem('userData');
    if (!userData) {
      //console.error('!! No user data found in local storage');
      const emailField = document.querySelector('[data-pay-guest="email"]');
      if (emailField && emailField.value !== '') {
        return emailField.value;
      }
      return;
    }
    const user = JSON.parse(userData);
    if (!userData && !user.email) {
      //console.error('!! No user email found');
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
    // paymentStatus.payed = false; //! to be removed
    // paymentStatus.paymentMethod = 'PayLater'; //! to be removed

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
          return JSON.parse(renderData);
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

        // const combinedArrays = combineArrays(localstorageData, localstorageFiles);
        const combinedArrays: {
          order: any;
          localstorageFiles: any;
          dateID?: string;
          user?: string;
        } = { order: localstorageData, localstorageFiles }; //! to be removed
        // console.log('combined files  :::--:: ', combinedArrays);

        const d = new Date();
        const DateID = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}--${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

        //! change to get user email from localstorage (loged in user)

        combinedArrays.user = GetCurrentUserEmail();
        combinedArrays.dateID = DateID;
        // console.log(' 🔥 🔥 - Final combinedArrays', combinedArrays);
        localStorage.setItem('combinedArrays', combinedArrays);
        async function uploadmetadata(combinedArrays) {
          // const token = localStorage.getItem('userToken');
          // if (!token) {
          //   console.error('No token found in local storage');
          //   return;
          // }
          return new Promise(async (resolve, reject) => {
            const requestOptions = {
              method: 'POST',
              body: JSON.stringify(combinedArrays),
              redirect: 'follow',
              headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${token}`,
              },
            };

            const uploadData = await fetch(api + '/api/submit-order', requestOptions)
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
        const submitInnerText = form.querySelector('#scroll-to-pay');
        // console.log('**********************+');
        // console.log({ submitLoading, loadingSVG });
        // console.log('**********************+');

        function initLoading() {
          if (!submitLoading || !loadingSVG) {
            console.error('No submit button or loading SVG found');
            return null;
          }
          submitLoading.style.opacity = '80%';
          submitLoading.value = '';
          // submitLoading.style.pointerEvents = 'none'; //! Uncomment if needed
          loadingSVG.style.display = 'block';
          submitInnerText.style.color = 'transparent';
        }

        function doneLoading() {
          if (!submitLoading || !loadingSVG) return;
          submitLoading.style.opacity = '100%';
          submitLoading.value = 'DONE';
          // submitLoading.style.pointerEvents = 'none'; //! Uncomment if needed
          loadingSVG.style.display = 'none';
          submitInnerText.style.color = 'black';
        }

        // Call the function with your array of images and other parameters
        showSubmitLogger();
        loggerUpdate(1);
        async function process() {
          try {
            // disableAllButtons();
            try {
              initLoading();
            } catch (error) {
              console.error('Error in initLoading:', error);
            } // get paymentDetails from localStorage
            const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
            // Uncomment if needed
            // submitLoading.style.pointerEvents = 'none';
            //? new adding user invoice address to the combinedArrays
            const userAddress = getInvoiceDataForCurrentOrder();

            if (userAddress) {
              combinedArrays.userAddress = userAddress;
            } else {
              // alert('Please fill in your address details');
              console.error('No user address found , passing empty object');
              combinedArrays.userAddress = {};
              // return;
            }

            //add total price to the combinedArrays
            combinedArrays.paymentDetails = paymentDetails;
            console.time('generateInvoice');
            const pdfFile = await generateInvoice({
              combinedArrays,
              paymentDetails,
            });
            console.timeEnd('generateInvoice');

            console.time('uploadInvoice');
            console.groupCollapsed('uploadInvoice');
            const pdfLink = await uploadInvoice(pdfFile);
            console.groupEnd('uploadInvoice');
            console.timeEnd('uploadInvoice');
            combinedArrays.pdfFile = pdfLink.linkarray;

            console.time('uploadmetadata');
            const Final = await uploadmetadata(combinedArrays);
            console.timeEnd('uploadmetadata');

            cleanLoggerUI();

            loggerUpdate(2);

            console.log('pdfFile', {
              combinedArrays,
              finalCMSresponse: Final,
            });

            const userEmail = GetCurrentUserEmail();
            loggerUpdate(3);

            sendInvoice(pdfLink.linkarray, userEmail);

            // uploadInvoiceToCMS(pdfLink.linkarray, Final.response);
            // console.log({ pdfFile });

            // Example function call, comment out if not needed
            // uploadInvoice();

            loggerUpdate(4);
            // updateOrderConfirmationID(Final);
            loggerUpdate(5);

            setTimeout(() => {
              hideSubmitLogger();
            }, 2000);

            enableAllButtons();
            // clickTab(3);
            doneLoading();

            try {
              goToConfirmationPage(combinedArrays);
            } catch (error) {
              console.error('Error going to confirmation page:', error);
            }

            clearLocalStorage(
              'upload_urls',
              'FormInputHolder',
              'paymentDetails',
              'extraImgs',
              'orderData',
              'orderFiles'
            );

            // Uncomment if needed
            // reloadPage();

            return Final;
          } catch (error) {
            //console.error('Error processing images:', error);
          }
        }

        // Call the process function
        await process();
        // goToHistory();
        // checkGoToHistory();
      });
  }

  function cleanLoggerUI() {
    const allLoaders = document.querySelectorAll('[submit-logger]');
    allLoaders.forEach((loader) => {
      loader.classList.remove('logger-load');
      loader.classList.remove('logger-done');
    });
  }

  function goToConfirmationPage(combinedArrays) {
    console.log('goToConfirmationPage', combinedArrays);

    const confirmation = document.querySelector('[data-order="confirmation-tab"]');
    const order = document.querySelector('[data-order="order-tab"]');

    // console.log('confirmation', confirmation);
    // console.log('order', order);
    if (confirmation && order) {
      // console.log('goin to confirmation page');
      order.classList.remove('w--tab-active');
      confirmation.classList.add('w--tab-active');
      //scroll to the top of the page
      window.scrollTo(0, 0);
    }

    try {
      populateConfirmationPage(combinedArrays);
    } catch (error) {
      console.error('Error populating confirmation page:', error);
    }
  }
  function populateConfirmationPage(combinedArrays) {
    console.log('populateConfirmationPage', combinedArrays);
    const email = GetCurrentUserEmail();
    const emailSpot = document.querySelector('[data-confirmation="mail"]');
    if (emailSpot) {
      emailSpot.textContent = email;
    }

    //data-confirmation="container"
    const container = document.querySelector('[data-confirmation="container"]');
    //data-confirmation="load"
    const load = document.querySelector('[data-confirmation="load"]');
    if (load) {
      load.style.display = 'none';
    }

    if (container) {
      container.style.display = 'flex';
      container.parentElement.style.opacity = '1';
    }

    // data-confirmation="order-id"
    const orderID = document.querySelector('[data-confirmation="order-id"]');
    if (orderID) {
      const ID = combinedArrays.paymentDetails.order.orderID;
      orderID.textContent = ID;
    }

    //data-confirmation="invoice-link"
    const invoiceLink = document.querySelector(
      '[data-confirmation="invoice-link"]'
    ) as HTMLAnchorElement;
    if (invoiceLink) {
      const Link = combinedArrays.pdfFile;
      invoiceLink.href = Link;
      invoiceLink.target = '_blank';
    }
  }

  console.log('ENV ===> ', process.env.NODE_ENV);
  console.log(
    process.env.NODE_ENV === 'development' ? '_____*_LOCALHOST_*____' : '*++**_CDN_**++*'
  );

  testInvoice();
  init();
  showContent();
  preSelectRadio();
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
    names.forEach((name) => {
      localStorage.removeItem(name);
    });
    // const keeper = localStorage.getItem('userToken');
    // localStorage.clear();
    // localStorage.setItem('userToken', keeper);
  }

  function showContent() {
    const loader = document.querySelector('[data-history="loader"]');
    const content = document.querySelector('[data-load="hidden"]');
    if (content) {
      content.setAttribute('data-load', 'visible');
    }
    if (loader) {
      //set style to none
      loader.style.display = 'none';
    }
  }

  function preSelectRadio() {
    const radio = document.querySelector('[data-name="three-d-modelling"]');
    if (radio) {
      radio.click();
    }
  }

  // saveInputToLocalHost();
  frontEndElementsJS();
  //!use this after Final success
  //!clickTab(3);

  //***** webflow Elements Functions //

  //update user address through the add/update user address form popout
  updateUserAddress();
  clearLocalStorageOnLogout();
  couponHandler();

  // dataChecker();
});
