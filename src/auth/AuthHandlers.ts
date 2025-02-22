import Cookie from 'js-cookie';
import { displayRecentOrders } from 'src/dashboard/recentOrders';
import getCurrentPage from 'src/general/getCurrentPage';
let recenetOrdersLoaded = false;
export function afterLoginUiSetup(data) {
  if (recenetOrdersLoaded === false) {
    if (getCurrentPage() === 'dashboard') {
      displayRecentOrders();
      recenetOrdersLoaded = true;
    }
  }
  const user_imgs = document.querySelectorAll('[data-login="avatar"]');
  const usernames = document.querySelectorAll('[data-login="username"]');
  const loginElements = document.querySelectorAll('[data-login="login"]');
  const userDropdown = document.querySelector('[data-login="dropdown"]');
  if (userDropdown) {
    userDropdown.classList.add('show');
  }

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
    // check if given_name is available
    if (data.given_name) {
      username.textContent = data.given_name;
      return;
    }
    if (data.name) {
      if (data.name.includes('@')) {
        username.textContent = data.nickname;
      } else {
        username.textContent = data.name;
      }
      return;
    }
  });

  loginElements.forEach((loginElement) => {
    loginElement.style.display = 'none';
  });
}

export function afterLogoutUiSetup() {
  const user_imgs = document.querySelectorAll('[data-login="avatar"]');
  const usernames = document.querySelectorAll('[data-login="username"]');
  const loginElements = document.querySelectorAll('[data-login="login"]');
  const userDropdown = document.querySelector('[data-login="dropdown"]');
  if (userDropdown) {
    userDropdown.classList.remove('show');
  }

  const hiddenElements = document.querySelectorAll('[data-user="true"]');
  hiddenElements.forEach((element) => {
    //change data-user="false" to data-user="true"
    element.setAttribute('data-user', 'false');
  });

  user_imgs.forEach((user_img) => {
    user_img.src = '';
  });

  usernames.forEach((username) => {
    username.textContent = '';
  });

  loginElements.forEach((loginElement) => {
    loginElement.style.display = 'flex';
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
  console.log('getUserData from cookie');

  //!disabled for now
  // const userData = Cookie.get('user');

  // if (userData) {
  //   return JSON.parse(userData);
  // }

  console.log('getUserData from DB');
  const data = await getUserDataFromDB(token);
  console.log('getUserData from DB', data);
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

//! not yet used
export function enableLockedContentToLoggedInUsers() {
  const lockedContent = document.querySelectorAll('[data-locked="true"]');
  lockedContent.forEach((element) => {
    element.setAttribute('data-locked', 'false');
    element.classList.remove('upcoming');
  });
  const guestInfos = document.querySelectorAll('[data-guest="user-data"]');
  guestInfos.forEach((element) => {
    element.remove();
  });
}

//! not yet used
export function lockContentToGuestUsers() {
  const lockedContent = document.querySelectorAll('[data-locked="false"]');
  lockedContent.forEach((element) => {
    element.setAttribute('data-locked', 'true');
    element.classList.add('upcoming');
    element.href = '#';
  });
  const guestInfos = document.querySelectorAll('[data-guest="user-data"]');
  guestInfos.forEach((element) => {
    element.style.display = 'block';
  });

  const invoiceDataWrapper = document.querySelector('[data-order="invoice-address-wrapper"]');
  if (invoiceDataWrapper) {
    invoiceDataWrapper.style.opacity = '0';
    invoiceDataWrapper.style.pointerEvents = 'none';
  }
}
