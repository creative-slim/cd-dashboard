// @ts-nocheck
import axios from 'axios';
import cookie from 'cookie';
import jsPDF from 'jspdf';
import lightbox from 'lightbox2';

import {
  checkUserFolder,
  downloadJsonData,
  getOrderFilesPaths,
  getThumbnailData,
} from '$utils/dataHandlers';
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
import { generateInvoice } from '$utils/invoiceGenerator';
import { saveInputToLocalHost } from '$utils/placeholderFormContent';

window.Webflow ||= [];
window.Webflow.push(() => {
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

  greetUser('hellonnfrom local');

  //! API ENDPOINTS
  const server = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  const local = 'http://localhost:8787';

  //?change this to switch between local and server
  const api = local;

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
    // const form = document.getElementById("wf-form-render-submission");

    const form = document.querySelector("[data-app-target='main-form']");

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
        if (nameElement && e != undefined) {
          nameElement.innerText = e.name || 'NO_NAME';
        }

        //description
        if (description && e != undefined) {
          description.innerText =
            `${e.type} ${
              e.specialFunction ? ' with ' + e.specialFunction : ''
            } - ${e.material} - ${e.dimensions.width}mm x ${
              e.dimensions.height
            }mm x ${e.dimensions.length}mm : ${e.renderPackage}` || 'NO_DESCRIPTION';
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
            images += `<a href="${
              i.imagePreview
            }" data-lightbox="${sliceStringAtNthSlash(i.path, 4)}" alt="image">
            <img src="${i.thumbnail}" alt="image">
              </a>`;
          });
          // if images is empty just put "no images " instead
          if (images == '') {
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
        if (mainThumb && e.images[0] != undefined) {
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

    function getOnMaterials(metadata) {
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

    /**
     * update access token
     */
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

    function transformData(originalData) {
      return {
        order: {
          type: originalData['furniture-type'] || '',
          name: originalData['furniture-name'] || '',
          payment: {
            status: originalData.paymentStatus || 'false',
            method: originalData.paymentMethod || '',
          },
          dimensions: {
            width: originalData['furniture-dimension-w'] || '',
            height: originalData['furniture-dimension-h'] || '',
            length: originalData['furniture-dimension-l'] || '',
          },
          specialFunction: originalData['special-functions'] || '',
          specialFunctionScene: false,
          material: originalData['color-finish'] || '',
          color: '',
          images: [],
          extras: {
            viewangles: originalData['render-extra-viewangle'] || '',
            lightPreferences: originalData['lighting-comment'] || '',
            roomType: originalData['room-type'] || '',
          },
          renderPackage: originalData['package-select'] || '',
          roomTypeDescription: originalData['dimensions-comment'] || '',
          metadata: {
            categoryComment: originalData['category-comment'] || '',
            categoryWood: originalData['category-wood'] || '',
            categoryMetal: originalData['category-metal'] || '',
            categoryPlastic: originalData['category-plastic'] || '',
            categoryStone: originalData['category-stone'] || '',
            categoryGlass: originalData['category-glass'] || '',
            commentMaterial: originalData['comment-material'] || '',
            commentWood: originalData['Comment-Wood'] || '',
            materialOak: originalData['material-oak'] || '',
            materialWalnut: originalData['material-walnut'] || '',
            materialBeech: originalData['material-beech'] || '',
            materialWhiteOak: originalData['material-whiteoak'] || '',
            materialSteel: originalData['material-steel'] || '',
            materialAluminium: originalData['material-aluminium'] || '',
            materialBrass: originalData['material-brass'] || '',
            commentToggleMetal: originalData['comment-toggle-metal'] || '',
            commentMetal: originalData['Comment-Metal'] || '',
            materialAcrylic: originalData['material-acrylic'] || '',
            materialPolyethylene: originalData['material-polyethylene'] || '',
            materialPVC: originalData['material-pvc'] || '',
            commentPlastic: originalData['Comment-Plastic'] || '',
            materialMarble: originalData['material-marble'] || '',
            materialGranite: originalData['material-granite'] || '',
            materialQuartz: originalData['material-quartz'] || '',
            commentStone: originalData['Comment-Stone'] || '',
            materialTempredGlass: originalData['material-tempredglass'] || '',
            materialFrostedGlass: originalData['material-frostedglass'] || '',
            commentGlass: originalData['Comment-Glass'] || '',
            lightingMorning: originalData['lighting-morning'] || '',
            lightingNoon: originalData['lighting-noon'] || '',
            lightingComment: originalData['lighting-comment'] || '',
            functionShow: originalData['function-show'] || '',
          },
        },
      };
    }

    async function addDataToUserData(serverData) {
      const convertedOrder = transformData(serverData.orderMetadata);
      return new Promise(async (resolve, reject) => {
        await Promise.all(
          serverData.thumbnails.entries.map(async (e) => {
            if (e['.tag'] == 'success') {
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
    /**
     * get Order Entries With Full Link of the element/image/Entry
     */
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

    function url_to_head(url) {
      return new Promise(function (resolve, reject) {
        console.log('inside url_to_head PayPal');

        const script = document.createElement('script');
        script.src = url;
        script.onload = function () {
          console.log('script loaded');
          resolve();
        };
        script.onerror = function () {
          reject('Error loading script.');
        };
        document.head.appendChild(script);
      });
    }
    const handle_close = (event) => {
      event.target.closest('.ms-alert').remove();
    };
    const handle_click = (event) => {
      if (event.target.classList.contains('ms-close')) {
        handle_close(event);
      }
    };
    document.addEventListener('click', handle_click);
    const paypal_sdk_url = 'https://www.paypal.com/sdk/js';
    const client_id =
      'AevfJAscX9MKaFWcK--S7rgLBotKliHnYIc94ShGUS3yNpc_Vt7z92LLmH4Tfwl49uRWpesdR6VBbtVx';
    // "AVoZD4EtMXeCRZRcUYr2hfVEfQjZ64IC2HuWi7k9g3kVNegnVazLjJIToMUcnfO3PEjKPWLxaRxz8kkG";
    const currency = 'EUR';
    const intent = 'capture';

    console.log('paypal_sdk_url', paypal_sdk_url);

    // let alerts = document.getElementById("alerts");
    let package = 'none';

    // var packagesWrapper = document.querySelector(".package-select-wrapper")

    //PayPal Code
    //https://developer.paypal.com/sdk/js/configuration/#link-queryparameters

    url_to_head(
      paypal_sdk_url + '?client-id=' + client_id + '&currency=' + currency + '&intent=' + intent
    )
      .then(() => {
        console.log('paypal sdk loaded');

        const alerts = document.getElementById('post-payment-alerts'); //!change this to match the id of the div you want to display the alerts in
        const paypal_buttons = paypal.Buttons({
          // https://developer.paypal.com/sdk/js/reference
          onClick: (data) => {
            // https://developer.paypal.com/sdk/js/reference/#link-oninitonclick
            // Custom JS here

            const radioButtons = document.getElementsByName('package-select');
            console.log('radioButtons', radioButtons);

            for (let i = 0; i < radioButtons.length; i++) {
              if (radioButtons[i].checked) {
                package = radioButtons[i].id;
              } else {
                console.log('Please select a package');
              }
            }
          },
          style: {
            //https://developer.paypal.com/sdk/js/reference/#link-style
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'paypal',
          },

          createOrder: function (data, actions) {
            //https://developer.paypal.com/docs/api/orders/v2/#orders_create

            if (package === 'none') {
              return;
            }

            return fetch(
              'https://creative-directors-dropbox.sa-60b.workers.dev/api/paypal/create_order',
              {
                method: 'post',
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({ intent: intent, package: package }),
              }
            )
              .then((response) => response.json())
              .then((order) => {
                return order.id;
              });
          },

          onApprove: function (data, actions) {
            if (package === 'none') {
              return;
            }
            const order_id = data.orderID;
            return (
              fetch(
                'https://creative-directors-dropbox.sa-60b.workers.dev/api/paypal/complete_order',
                {
                  method: 'post',
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                  },
                  body: JSON.stringify({
                    intent: intent,
                    order_id: order_id,
                  }),
                }
              )
                .then((response) => response.json())
                .then((order_details) => {
                  console.log(order_details); //https://developer.paypal.com/docs/api/orders/v2/#orders_capture!c=201&path=create_time&t=response

                  paymentStatus.payed = true;
                  paymentStatus.paymentMethod =
                    order_details.purchase_units[0].payments.captures[0].payment_method_name ||
                    'default : PayPal';
                  console.log('paymentStatus', paymentStatus);

                  const intent_object = intent === 'authorize' ? 'authorizations' : 'captures';
                  //Custom Successful Message
                  alerts.innerHTML =
                    `<div class=\'ms-alert ms-action\'>Thank you ` +
                    order_details.payer.name.given_name +
                    ` ` +
                    order_details.payer.name.surname +
                    ` for your payment of ` +
                    order_details.purchase_units[0].payments[intent_object][0].amount.value +
                    ` ` +
                    order_details.purchase_units[0].payments[intent_object][0].amount
                      .currency_code +
                    `!</div>`;

                  //Close out the PayPal buttons that were rendered
                  paypal_buttons.close();
                })
                //!invoice generation here
                .then(() => {
                  const invoiceData = {
                    name: 'slim',
                    type: 'bed',
                    renderPackage: 'package1',
                  };
                  console.log('invoiceData', invoiceData);
                  generateInvoice(invoiceData);

                  // remove paylater button if payment is made
                  const payLater = document.getElementById('paylater-btn');
                  if (payLater) {
                    payLater.style.display = 'none';
                  }
                })
                .catch((error) => {
                  console.log(error);
                  alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Ocurred!</p>  </div>`;
                })
            );
          },

          onCancel: function (data) {
            alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p>  </div>`;
          },

          onError: function (err) {
            console.log(err);
          },
        });
        console.log('paypal buttons created');

        paypal_buttons.render('#payment_options');
      })
      .then(() => {
        console.log('paypal buttons rendered');
      })
      .catch((error) => {
        console.error(error);
      });

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

    /**
     * form submit handler
     */
    if (form)
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (paymentStatus.paymentMethod == '') {
          alert('Please select a payment method');
          return;
        }

        // let requestNext = document.getElementById("request-next");
        // if (requestNext) {
        //   requestNext.style.opacity = "0";
        //   requestNext.style.pointerEvents = "none";
        // }

        const d = new Date();
        const DateID = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}--${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

        const formData = new FormData(form);

        formData.append('paymentMethod', paymentStatus.paymentMethod);

        formData.append('paymentStatus', paymentStatus.payed);

        formData.append('user', CurrentUserEmail);
        formData.append('dateID', DateID);

        // Convert FormData to Object

        const formDataObject = {}; //! not yet used ( remove this when done )
        formData.forEach(function (value, key) {
          //! not yet used ( remove this when done )
          formDataObject[key] = value; //! not yet used ( remove this when done )
        }); //! not yet used ( remove this when done )

        {
          // FormData Elements
          const furnitureName = formData.get('furniture-name');
          const furnitureType = formData.get('furniture-type');
          const furnitureDimensionW = formData.get('furniture-dimension-w');
          const furnitureDimensionL = formData.get('furniture-dimension-l');
          const furnitureDimensionH = formData.get('furniture-dimension-h');
          const material = formData.get('material');
          const colorFinish = formData.get('color-finish');
          const specialFunctions = formData.get('special-functions');
          const functionShow = formData.get('function-show');
          const renderPackage = formData.get('render-package');
          const renderExtraViewAngle = formData.get('render-extra-viewangle');
          const renderLight = formData.get('Render-Light');
          const roomType = formData.get('room-type');
          const extraText = formData.get('extra-text');
        }

        async function uploadmetadata(formdata, accesskey, subFolder) {
          return new Promise(async (resolve, reject) => {
            const uploadID = subFolder; //..userEmail/dateID..

            const requestOptions = {
              method: 'POST',
              body: JSON.stringify(formdata),
              redirect: 'follow',
            };

            await fetch(api + '/api/uploadmetadata', requestOptions)
              .then((response) => response.json())
              .then(async (result) => {
                console.log('result from uploadmetadata .: ', result);
                const jsonString = JSON.stringify(result, null, 2);
                const pathWithExtension = '/CD-uploads/' + uploadID + '/metadata.json';
                //await uploadToDropbox(jsonString, pathWithExtension, accesskey);
              })
              .catch((error) => console.log('error', error));

            resolve('metadata uploaded');
          });
        }

        // !needs to be changed

        const f_email = CurrentUserEmail;

        async function processImages(imagesArray: Array<File>, f_email, accessKey: string) {
          const subFolder = f_email + '/' + DateID;

          //! disabled for Cloudflare transfer
          // await checkFolderExistence(f_email, accessKey);
          // await checkFolderExistence(subFolder, accessKey);

          // Add images URL from the output string

          // -- threed_output_string / photos_output_string

          // Upload the images
          //!disabling images upload due to alternative method through Cloudfare worker
          /*
          for (let index = 0; index < imagesArray.length; index++) {
            await uploader(f_email, subFolder, imagesArray[index], accessKey);
          }
          */

          //? adding new call to cloudflare worker to upload images

          const images_url_string = document.getElementById('photos_output_string');

          const images_url_array = images_url_string.value.split(',').map((item) => {
            return item.trim();
          });

          console.log('this is the array : ', images_url_array);
        }

        // ------------

        // Call the function with your array of images and other parameters

        processImages(imagesArray, f_email, accessKey)
          .then(async () => {
            const subFolder = CurrentUserEmail + '/' + DateID;

            await uploadmetadata(formDataObject, accessKey, subFolder);
            console.log('All images processed.');
            // if payment mothed is other than "" then submit button will be enabled

            // submitLoading.style.opacity = "80%";
            // submitLoading.innerText = "DONE";
            // //! change this back to NONE
            // submitLoading.style.pointerEvents = "auto";

            // reroute to /order-confirmation
            window.location.href = '/order-confirmation';
          })
          .catch((error) => {
            console.error('Error processing images:', error);
          });

        localStorage.removeItem('upload_urls');
        window.localStorage.removeItem('FormInputHolder');
      });
  }

  console.log('ENV ===> ', process.env.NODE_ENV);

  init();

  // saveInputToLocalHost();
  frontEndElementsJS();
});
