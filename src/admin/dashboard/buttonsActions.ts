let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

// cancel Order

// revision

// resend email

// fullfill order
export function fullfillOrder(orderId: string) {
  const url = `${api}/api/admin/fullfill-order/${orderId}`;
  const token = localStorage.getItem('userToken');
  const data = {
    orderId: orderId,
  };

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
