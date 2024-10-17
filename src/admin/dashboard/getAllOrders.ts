export default async function getAllOrders() {
  let api;
  if (process.env.NODE_ENV === 'development') {
    api = 'http://127.0.0.1:8787'; // Use local endpoint for development
  } else {
    api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
  }

  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('User token not found');
  }

  try {
    const response = await fetch(`${api}/api/admin/all-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}
