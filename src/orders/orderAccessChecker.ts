let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

export default async function initOrderAccessChecker() {
  // run that function only on the order page
  if (!document.querySelector('[order-invoice]')) {
    console.log('no order page');

    return;
  }
  console.log('initOrderAccessChecker');
  await addInvoiceDataToOrderPage();
}

async function addInvoiceDataToOrderPage() {
  try {
    const addressElements = document.querySelectorAll('[order-invoice]');
    const orderData = await getPaymentDataIfUserIsAuthorized();
    console.log('orderData', orderData);
    console.log('addressElements', addressElements);

    if (!orderData) {
      console.error('Order data not available');
      return;
    }

    // Fill the invoice address fields with the order data from the API and match the key to the data attribute
    addressElements.forEach((element) => {
      const key = element.getAttribute('order-invoice');
      element.innerHTML = orderData.userAddress[key] || '';
    });
  } catch (error) {
    console.error('An error occurred while adding invoice data to the order page:', error);
  }
}

async function getPaymentDataIfUserIsAuthorized() {
  const orderSlug = window.location.href.split('/').pop();

  const token = localStorage.getItem('userToken');
  const resp = await fetch(`${api}/api/orders/order/${orderSlug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    console.error('Error fetching order:', resp);
    return false;
  }

  const data = await resp.json();

  return data;
}
