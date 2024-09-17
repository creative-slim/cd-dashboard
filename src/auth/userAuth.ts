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
const POST_LOGIN_REDIRECT_URL_KEY = 'postLoginRedirectUrl';

const saveRedirectUrl = () => {
  console.log(' ----------->>>> Saving redirect URL:', window.location.href);
  localStorage.setItem(POST_LOGIN_REDIRECT_URL_KEY, window.location.href);
};

const createAuthClient = async () => {
  console.log(' ----------->>>> Creating Auth0 Client...');
  return createAuth0Client({
    domain: 'renderstudio24.eu.auth0.com',
    clientId: 'HtRGeGXBxMx53TBVTX7GhHbDZfhfHRX6',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'https://auth0api.renderstudio24.de',
      useRefreshTokens: true, // Enable refresh tokens to maintain session
    },
    cacheLocation: 'localstorage', // Ensure session is stored across reloads and devices
  });
};

const handleLogin = async (client) => {
  try {
    saveRedirectUrl();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log(' ----------->>>> Is mobile:', isMobile);

    if (isMobile) {
      // On mobile, use loginWithRedirect for better reliability
      await client.loginWithRedirect();
    } else {
      // On desktop, popup works fine
      await client.loginWithPopup().then(() => window.location.reload());
    }
  } catch (error) {
    //console.error('Login failed:', error);
    alert('Login failed. Try again.');
  }
};

const handleLogout = async (client) => {
  try {
    console.log(' ----------->>>> Logging out...');
    await client.logout();
    [USER_DATA_KEY, USER_TOKEN_KEY].forEach((key) => {
      console.log(`Removing ${key} from localStorage`);
      localStorage.removeItem(key);
    });
    Cookie.remove('user');
    afterLogoutUiSetup();
    console.log(' ----------->>>> Logout successful');
  } catch (error) {
    //console.error('Logout failed:', error);
    alert('Logout failed. Try again.');
  }
};

const checkAuthentication = async (client) => {
  try {
    console.log(' ----------->>>> Checking authentication status...');
    const isAuthenticated = await client.isAuthenticated();
    console.log(' ----------->>>> Is authenticated:', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    //console.error('Error checking authentication:', error);
    return false;
  }
};

const useStoredUserData = () => {
  console.log(' ----------->>>> Checking for stored user data...');
  const storedUserData = localStorage.getItem(USER_DATA_KEY);
  if (storedUserData) {
    console.log(' ----------->>>> User data found in localStorage:', storedUserData);
    const userData = JSON.parse(storedUserData);
    afterLoginUiSetup(userData);
  } else {
    console.log(' ----------->>>> No user data found in localStorage');
  }
};

const fetchAndUpdateUserData = async (client) => {
  try {
    console.log(' ----------->>>> Fetching user data from Auth0...');

    // Try to retrieve the token silently, with refresh token enabled
    const userToken = await client.getTokenSilently().catch(async (error) => {
      console.warn('Silent token retrieval failed, trying popup:', error);

      // On failure, fallback to popup
      return client.getTokenWithPopup();
    });

    console.log(' ----------->>>> User token received:', userToken);

    // Now retrieve user data
    const userData = await client.getUser();

    console.log(' ----------->>>> User data received:', userData);

    // Store the user token in cookie for mobile compatibility
    Cookie.set(USER_TOKEN_KEY, userToken, { expires: 1, secure: true, sameSite: 'None' });
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_TOKEN_KEY, userToken);

    await Promise.all([getUserData(userToken), updatePricesInLocalStorage(userToken)]);
    afterLoginUiSetup(userData);

    return { userData, userToken };
  } catch (error) {
    //console.error('Failed to fetch and update user data:', error);
    return null;
  }
};

const handleLoginCallback = async (client) => {
  try {
    console.log(' ----------->>>> Handling login callback...');
    await client.handleRedirectCallback();
    const { userData, userToken } = await fetchAndUpdateUserData(client);

    if (userData && userToken) {
      console.log(' ----------->>>> Syncing user data with the database...');
      await syncUsersDB(userData, userToken);

      const url = new URL(window.location.href);
      ['code', 'state'].forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, document.title, url);
      console.log(' ----------->>>> URL parameters cleaned up after login');
    }
  } catch (error) {
    //console.error('Login callback failed:', error);
    alert('Login processing failed. Try again.');
  }
};

const redirectToLoginIfUnauthenticated = async (client) => {
  const isAuthenticated = await checkAuthentication(client);
  if (!isAuthenticated && window.location.pathname.startsWith('/user')) {
    console.log(' ----------->>>> User not authenticated, redirecting to login...');
    await handleLogin(client);
  }
};

const checkUrlErrors = () => {
  const url = new URL(window.location.href);
  console.log(' ----------->>>> Checking for URL errors...');
  if (url.searchParams.get('code') === 'null') {
    console.log(' ----------->>>> Invalid "code" parameter in URL, redirecting to homepage...');
    window.location.href = '/';
  }
};

export const initAuth = async () => {
  try {
    console.log(' ----------->>>> Initializing Auth...');
    checkUrlErrors();

    const client = await createAuthClient();
    console.log(' ----------->>>> Auth0 client created:', client);

    const loginElement = document.querySelector('[data-login="login"]');
    const logoutElement = document.querySelector('[data-login="logout"]');

    if (!loginElement || !logoutElement) {
      console.log(' ----------->>>> Login or logout elements not found on page');
      return;
    }

    console.log(' ----------->>>> Adding event listeners for login and logout...');
    loginElement.addEventListener('click', () => handleLogin(client));
    logoutElement.addEventListener('click', () => handleLogout(client));

    useStoredUserData(); // Trigger UI setup with stored data first

    const isAuthenticated = await checkAuthentication(client);
    console.log(' ----------->>>> User authenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log(' ----------->>>> User is authenticated, fetching and updating user data...');
      await fetchAndUpdateUserData(client); // Fetch and update the local storage with new data
    } else if (new URL(window.location.href).searchParams.has('code')) {
      console.log(' ----------->>>> Login code found in URL, handling login callback...');
      await handleLoginCallback(client);
    } else {
      console.log(' ----------->>>> User is not authenticated, checking redirect...');
      await redirectToLoginIfUnauthenticated(client);
    }
  } catch (error) {
    //console.error('Auth initialization failed:', error);
  }
};
