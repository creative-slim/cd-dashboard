import { createAuth0Client } from '@auth0/auth0-spa-js';
import Cookie from 'js-cookie';

import {
  afterLoginUiSetup,
  afterLogoutUiSetup,
  getUserData,
  syncUsersDB,
  updatePricesInLocalStorage,
} from './AuthHandlers';

const USER_DATA_KEY = 'userData';
const USER_TOKEN_KEY = 'userToken';
const POST_LOGIN_REDIRECT_URL_KEYY = 'postLoginRedirectUrl';

const saveRedirectUrl = () =>
  localStorage.setItem(POST_LOGIN_REDIRECT_URL_KEYY, window.location.href);

const createAuthClient = async () => {
  return createAuth0Client({
    domain: 'renderstudio24.eu.auth0.com',
    clientId: 'HtRGeGXBxMx53TBVTX7GhHbDZfhfHRX6',
    authorizationParams: {
      redirect_uri: 'https://www.renderstudio24.de/',
      audience: 'https://auth0api.renderstudio24.de',
    },
  });
};

const handleLogin = async (client) => {
  try {
    saveRedirectUrl();
    await client.loginWithRedirect();
  } catch {
    alert('Login failed. Try again.');
  }
};

const handleLogout = async (client) => {
  try {
    await client.logout();
    [USER_DATA_KEY, USER_TOKEN_KEY].forEach((key) => localStorage.removeItem(key));
    Cookie.remove('user');
    afterLogoutUiSetup();
  } catch {
    alert('Logout failed. Try again.');
  }
};

const checkAuthentication = (client) => client.isAuthenticated().catch(() => false);

const useStoredUserData = () => {
  const storedUserData = localStorage.getItem(USER_DATA_KEY);
  if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    afterLoginUiSetup(userData);
  }
};

const fetchAndUpdateUserData = async (client) => {
  try {
    const userData = await client.getUser();
    const userToken = await client.getTokenSilently();

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_TOKEN_KEY, userToken);

    await Promise.all([getUserData(userToken), updatePricesInLocalStorage(userToken)]);
    afterLoginUiSetup(userData); // Update the UI after new data is fetched

    return { userData, userToken };
  } catch {
    return null;
  }
};

const handleLoginCallback = async (client) => {
  try {
    await client.handleRedirectCallback();
    const { userData, userToken } = await fetchAndUpdateUserData(client);
    if (userData && userToken) {
      await syncUsersDB(userData, userToken);
      const url = new URL(window.location.href);
      ['code', 'state'].forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, document.title, url);
    }
  } catch {
    alert('Login processing failed. Try again.');
  }
};

const redirectToLoginIfUnauthenticated = async (client) => {
  const isAuthenticated = await checkAuthentication(client);
  if (!isAuthenticated && window.location.pathname.startsWith('/user')) {
    await handleLogin(client);
  }
};

const checkUrlErrors = () => {
  if (new URL(window.location.href).searchParams.get('code') === 'null') {
    window.location.href = '/';
  }
};

export const initAuth = async () => {
  try {
    checkUrlErrors();

    const client = await createAuthClient();
    const loginElement = document.querySelector('[data-login="login"]');
    const logoutElement = document.querySelector('[data-login="logout"]');

    if (!loginElement || !logoutElement) return;

    loginElement.addEventListener('click', () => handleLogin(client));
    logoutElement.addEventListener('click', () => handleLogout(client));

    useStoredUserData(); // Trigger UI setup with stored data first

    const isAuthenticated = await checkAuthentication(client);
    if (isAuthenticated) {
      await fetchAndUpdateUserData(client); // Fetch and update the local storage with new data
    } else if (new URL(window.location.href).searchParams.has('code')) {
      await handleLoginCallback(client);
    } else {
      await redirectToLoginIfUnauthenticated(client);
    }
  } catch {
    console.error('Auth initialization failed');
  }
};
