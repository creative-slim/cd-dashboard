import Cookie from 'js-cookie';
import { displayRecentOrders } from 'src/dashboard/recentOrders';

export function afterLoginUiSetup(data) {
  displayRecentOrders();
  const user_imgs = document.querySelectorAll('[data-login="avatar"]');
  const usernames = document.querySelectorAll('[data-login="username"]');
  const loginElements = document.querySelectorAll('[data-login="login"]');

  const hiddenElements = document.querySelectorAll('[data-user="false"]');
  hiddenElements.forEach((element) => {
    //change data-user="false" to data-user="true"
    element.setAttribute('data-user', 'true');
  });
  console.log('🥹🥹🥹🥹🥹 ', user_imgs, usernames, loginElements);

  user_imgs.forEach((user_img) => {
    user_img.src = data.picture;
  });

  usernames.forEach((username) => {
    username.textContent = data.name;
  });

  loginElements.forEach((loginElement) => {
    loginElement.style.display = 'none';
  });
}

export function afterLogoutUiSetup() {
  const user_imgs = document.querySelectorAll('[data-login="avatar"]');
  const usernames = document.querySelectorAll('[data-login="username"]');
  const loginElements = document.querySelectorAll('[data-login="login"]');

  user_imgs.forEach((user_img) => {
    user_img.src = '';
  });

  usernames.forEach((username) => {
    username.textContent = '';
  });

  loginElements.forEach((loginElement) => {
    loginElement.style.display = 'block';
  });
}

let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

export async function syncUsersDB(userData, token) {
  console.log('syncing user FUNCTION ', userData, token);
  const user = {
    first_name: userData.given_name,
    email: userData.email,
    last_name: userData.family_name,
    auth0_id: userData.sub,
  };

  const response = await fetch(`${api}/api/user/adduser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  console.log(data);

  return data;
}

function updateUserStoredData(userData) {
  Cookie.set('user', JSON.stringify(userData), { expires: 1 });
}

async function getUserDataFromDB(token) {
  const response = await fetch(`${api}/api/user/userdetails`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
}

export async function getUserData(token) {
  const userData = Cookie.get('user');
  if (userData) {
    return JSON.parse(userData);
  }

  const data = await getUserDataFromDB(token);
  updateUserStoredData(data);

  return data;
}

export async function updatePricesInLocalStorage(token) {
  if (!token) return;

  const resp = await fetch(`${api}/api/paypal/get-prices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const prices = await resp.json();
  if (!prices) return;

  localStorage.setItem('prices', JSON.stringify(prices));
}
