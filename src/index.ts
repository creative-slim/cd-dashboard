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
import testInvoice from './extras/testInvoice';
import { initOrderHistory } from './user/orderHistory';
import initUserRelatedFunctions from './user/userMainExport';

window.Webflow ||= [];
window.Webflow.push(async () => {
  // init instances
  initAuth();
  initInstances();
  orderAppFunctions();
  initWebflowFunctions();
  initUserRelatedFunctions();

  if (window.location.pathname === '/user/order-history') {
    console.log('order history page');

    const info = await initOrderHistory();
    console.log('initOrderHistory results : ', info);
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
    if (!userData && !user.email) {
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

            debugger;
            const pdfFile = await generateInvoice({
              finalData: {
                combinedArrays,
                finalCMSresponse: Final,
              },
            });

            const pdfLink = await uploadInvoice(pdfFile, Final.fullPath);
            // const userEmail = document.querySelector('[data-user-email]')?.innerText;
            const send = await sendInvoice(pdfLink.linkarray, 'sa@creative-directors.com');
            await uploadInvoiceToCMS(pdfLink.linkarray, Final.response);
            console.log({ pdfFile });

            // Example function call, comment out if not needed
            uploadInvoice();

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

  testInvoice();
  init();
  showContent();
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
