export function initializePaypal(
  paymentOptionsSelector,
  alertsSelector,
  ConfirmOrderButtonSelector,
  paymentStatus
) {
  const api = 'https://creative-directors-dropbox.sa-60b.workers.dev';

  const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js';
  const CURRENCY = 'EUR';
  const INTENT = 'capture';
  let selectedPackage = 'none';
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

  document.addEventListener('click', handleClick);

  loadScript(
    `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&currency=${CURRENCY}&intent=${INTENT}`
  )
    .then(() => {
      const alerts = document.querySelector(alertsSelector);

      const paypalButtons = paypal.Buttons({
        onClick: (data) => {
          const radioButtons = document.getElementsByName('package-select');
          for (let i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
              selectedPackage = radioButtons[i].id;
            }
          }
        },
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
        },
        createOrder: function (data, actions) {
          if (selectedPackage === 'none') {
            console.error('Please select a package');
            return;
          }
          return fetch(`${api}/api/paypal/create_order`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ intent: INTENT, package: selectedPackage }),
          })
            .then((response) => response.json())
            .then((order) => order.id);
        },
        onApprove: function (data, actions) {
          if (selectedPackage === 'none') {
            return;
          }
          const orderId = data.orderID;
          paymentStatus.payed = true;
          paymentStatus.paymentMethod = 'PayPal';
          return document
            .querySelector("[order-submit='approved']")
            .addEventListener('click', () => {
              fetch(`${api}/api/paypal/complete_order`, {
                method: 'post',
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({ intent: INTENT, order_id: orderId }),
              });
            });
          // .then(() => console.log('Payment approved!'));
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
