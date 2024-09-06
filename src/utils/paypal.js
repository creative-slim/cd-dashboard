import { areRequiredFieldsPopulated, errorModal } from '$extras/inputsChecker.js';
import cleanData from '$utils/renderDataCleaner.js';

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
  const accessToken = localStorage.getItem('userToken');
  let orderDetails = [];
  // const PAYPAL_CLIENT_ID =
  //   'AevfJAscX9MKaFWcK--S7rgLBotKliHnYIc94ShGUS3yNpc_Vt7z92LLmH4Tfwl49uRWpesdR6VBbtVx';
  const PAYPAL_CLIENT_ID =
    'AWAxiue-z2L3vnEGgR5TM72wYvA38X_Y3yf5pggqld2MyM0IXekXvqfIKC7H1VPGq7pCs_WJ-hWIJE96';

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

  function fetchDataFromLocalStorage() {
    const renderData = localStorage.getItem('orderData');

    const cleanArray = cleanData(JSON.parse(renderData));
    return cleanArray;
  }

  document.addEventListener('click', handleClick);

  // get elemt by attribute data-payment=paypal-elements-wrapper
  const paymentOptionsWrapper = document.querySelector("[data-payment='paypal-elements-wrapper']");
  if (!paymentOptionsWrapper) {
    console.error('PayPal elements wrapper not found!');
    return;
  }
  const paymentMethodeConfirmationUIelement = document.querySelector(
    "[data-payment='payment-methode-confirmation']"
  );
  if (!paymentMethodeConfirmationUIelement) {
    console.error('Payment methode confirmation UI element not found!');
    return;
  }

  function paypalOrderConfirmationUI(orderDetails) {
    const alerts = document.querySelector(alertsSelector);
    alerts.innerHTML = `<div class='ms-alert ms-action'>
      <p> ORDER CREATED </p>
    </div>`;
    paymentMethodeConfirmationUIelement.style.display = 'flex';
  }

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
        onClick: (data, actions) => {
          // check if all fields are filled
          if (!areRequiredFieldsPopulated()) {
            actions.reject();
            errorModal('Bitte füllen Sie alle erforderlichen Felder aus.');
            // alert('Please fill in all required fields');
            return actions.reject();
          }
          orderDetails = fetchDataFromLocalStorage();
        },
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
        },
        createOrder: async function (data, actions) {
          // Check if all fields are filled

          if (!orderDetails || orderDetails.length === 0) {
            console.error('Please select a package : order creation failed!');
            return;
          }
          console.log('Creating payment order...FETCHING NOW', {
            intent: INTENT,
            package: orderDetails,
          });
          const request = await fetch(`${api}/api/paypal/create_order`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              authorization: `Bearer ${accessToken}`,
            },
            //! Send the additional data
            body: JSON.stringify({ intent: INTENT, orderDetails }),
          })
            .then((response) => response.json())
            .then((order) => {
              console.log('Payment order CREATED', order);
              localStorage.setItem('paymentDetails', JSON.stringify({ order }));

              return order.data.id;
            });
          console.log('Payment order REQUEST', await request);
          return request;
        },
        onApprove: async function (data, actions) {
          if (!orderDetails || orderDetails.length === 0) {
            console.error('Please select a package : order creation failed!');
            return;
          }
          console.log('Approving payment order...++++++', data);
          paypalOrderConfirmationUI(data);
          paypalButtons.close();
          const orderId = data.orderID;
          paymentStatus.payed = true;
          paymentStatus.paymentMethod = 'PayPal';
          const submitBtn = document.querySelector("[order-submit='approved']");
          submitBtn.addEventListener('click', async () => {
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
              })
              // then click on the submit button
              .catch((error) => {
                console.error('Error processing PayPal payment:', error);
              });
          });

          submitBtn.click();

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

          setTimeout(() => {
            alerts.innerHTML = '';
          }, 1500);
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
