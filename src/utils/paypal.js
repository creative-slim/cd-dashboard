export function initializePaypal(
  paymentOptionsSelector,
  alertsSelector,
  ConfirmOrderButtonSelector,
  paymentStatus
) {
  let api;
  if (process.env.NODE_ENV === 'development') {
    api = 'http://127.0.0.1:8787'; // Use local endpoint for development
    console.log('DEV___PAYPAL____###');
  } else {
    api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
    console.log('CDN_PAYPAL_');
  }

  const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js';
  const CURRENCY = 'EUR';
  const INTENT = 'capture';
  let selectedPackage = 'none';
  let orderDetails = {
    selectedPackage: 'none',
    extraImages: [],
  };
  const PAYPAL_CLIENT_ID =
    'AevfJAscX9MKaFWcK--S7rgLBotKliHnYIc94ShGUS3yNpc_Vt7z92LLmH4Tfwl49uRWpesdR6VBbtVx';

  if (!PAYPAL_CLIENT_ID) {
    console.error('PayPal client ID is missing. Make sure to add it to your .env file.');
    return;
  }

  // check the existence of the required elements
  if (!document.querySelector(paymentOptionsSelector)) {
    console.error('Payment options container is missing.');
    return;
  }

  if (!document.querySelector(alertsSelector)) {
    console.error('Alerts container is missing.');
    return;
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function handleClose(event) {
    event.target.closest('.ms-alert').remove();
  }

  function handleClick(event) {
    if (event.target.classList.contains('ms-close')) {
      handleClose(event);
    }
  }

  function getFormDataFromLocalStorage() {
    const keys = Object.keys(localStorage);
    // Filter keys that start with "form_data"
    const formDataKeys = keys.filter((key) => key.startsWith('form_data'));
    // Retrieve values corresponding to those keys
    const formDataValues = formDataKeys.map((key) => localStorage.getItem(key));

    return JSON.parse(formDataValues);
  }

  function filterObjectsByNames(formData) {
    const desiredNames = ['woodtype', 'package-select', 'special-function-toggle'];
    const filteredData = {};

    formData.forEach((item) => {
      if (desiredNames.includes(item.name)) {
        filteredData[item.name] = item;
      }
    });

    return filteredData;
  }

  document.addEventListener('click', handleClick);

  loadScript(
    `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&currency=${CURRENCY}&intent=${INTENT}`
  )
    .then(() => {
      const alerts = document.querySelector(alertsSelector);
      if (paymentStatus.paymentMethod.toUpperCase() === 'payLater'.toUpperCase()) {
        console.log('Pay Later');
        return;
      }
      let paymentDetails;
      const paypalButtons = paypal.Buttons({
        onClick: (data) => {
          const radioButtons = document.getElementsByName('package-select');
          for (let i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
              orderDetails.selectedPackage = radioButtons[i].id;
            }
          }
          const extraImages = localStorage.getItem('extraImgs');
          if (extraImages) {
            console.log('Extra images:', JSON.parse(extraImages));
            orderDetails.extraImages = JSON.parse(extraImages);
          }
          const packageData = filterObjectsByNames(getFormDataFromLocalStorage());
          if (packageData.length === 0) {
            console.error('No package data found!');
            return;
          }
          orderDetails.packageData = packageData;
        },
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
        },
        createOrder: async function (data, actions) {
          if (orderDetails.selectedPackage === 'none') {
            console.error('Please select a package : order creation failed!');
            return;
          }
          console.log('Creating payment order...FETCHING NOW', {
            intent: INTENT,
            package: orderDetails.selectedPackage,
          });
          const request = await fetch(`${api}/api/paypal/create_order`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            //! Send the additional data
            body: JSON.stringify({ intent: INTENT, package: orderDetails }),
          })
            .then((response) => response.json())
            .then((order) => {
              console.log('Payment order CREATED', order);
              localStorage.setItem(
                'paymentDetails',
                JSON.stringify({
                  additionalImagesArray: order.additionalImagesArray,
                  totalAmount: order.totalAmount,
                })
              );
              return order.data.id;
            });
          console.log('Payment order REQUEST', await request);
          return request;
        },
        onApprove: async function (data, actions) {
          if (orderDetails.selectedPackage === 'none') {
            console.error('Please select a package : approval failed!');
            return;
          }
          console.log('Approving payment order...++++++', data);
          const orderId = data.orderID;
          paymentStatus.payed = true;
          paymentStatus.paymentMethod = 'PayPal';
          return document
            .querySelector("[order-submit='approved']")
            .addEventListener('click', async () => {
              fetch(`${api}/api/paypal/complete_order`, {
                method: 'post',
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({ intent: INTENT, order_id: orderId }),
              })
                .then((response) => {
                  console.log('Response:', response);

                  return response.json();
                })
                .then((orderDetails) => {
                  console.log('Order details:', orderDetails);
                  paymentDetails = orderDetails.data.purchase_units[0].payments.captures[0].amount;
                  paypalButtons.close();
                });
            });
          // .then((orderDetails) => {
          //   const intentObject = INTENT === 'authorize' ? 'authorizations' : 'captures';
          //   alerts.innerHTML = `<div class=\'ms-alert ms-action\'>Thank you ${orderDetails.payer.name.given_name} ${orderDetails.payer.name.surname} for your payment of ${orderDetails.purchase_units[0].payments[intentObject][0].amount.value} ${orderDetails.purchase_units[0].payments[intentObject][0].amount.currency_code}!</div>`;
          //   paypalButtons.close();
          // })
          // .catch((error) => {
          //   console.error('Error processing PayPal payment:', error);
          //   alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Occurred!</p></div>`;
          // });
        },
        onCancel: function () {
          alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p></div>`;
        },
        onError: function (err) {
          console.error('PayPal Error:', err);
        },
      });

      try {
        paypalButtons.render(paymentOptionsSelector);
      } catch (error) {
        console.error('Error rendering PayPal buttons:', error);
      }
    })
    .catch((error) => {
      console.error('Error loading PayPal SDK:', error);
    });
}
