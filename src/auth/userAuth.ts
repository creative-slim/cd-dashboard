import { createAuth0Client } from '@auth0/auth0-spa-js';
import Cookie from 'js-cookie';

import {
  afterLoginUiSetup,
  afterLogoutUiSetup,
  getUserData,
  syncUsersDB,
  updatePricesInLocalStorage,
} from './AuthHandlers';

// Constants for localStorage keys
const USER_DATA_KEY = 'userData';
const USER_TOKEN_KEY = 'userToken';
const POST_LOGIN_REDIRECT_URL_KEY = 'postLoginRedirectUrl';

async function createAuthClient() {
  try {
    return await createAuth0Client({
      domain: 'renderstudio24.eu.auth0.com',
      clientId: 'HtRGeGXBxMx53TBVTX7GhHbDZfhfHRX6',
      authorizationParams: {
        redirect_uri: 'https://preview.renderstudio24.de/',
        audience: 'https://auth0api.renderstudio24.de',
      },
    });
  } catch (error) {
    console.error('Failed to create Auth0 client:', error);
    throw error;
  }
}

function saveRedirectUrl() {
  localStorage.setItem(POST_LOGIN_REDIRECT_URL_KEY, window.location.href);
}

async function handleLogin(client) {
  try {
    saveRedirectUrl();
    await client.loginWithRedirect();
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred during login. Please try again.');
  }
}

async function handleLogout(client) {
  try {
    await client.logout();
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
    Cookie.remove('user');
    afterLogoutUiSetup();
  } catch (error) {
    console.error('Error during logout:', error);
    alert('An error occurred during logout. Please try again.');
  }
}

async function checkAuthentication(client) {
  try {
    return await client.isAuthenticated();
  } catch (error) {
    console.error('Failed to check authentication status:', error);
    return false;
  }
}

async function fetchUserData(client) {
  try {
    const userData = await client.getUser();
    const userToken = await client.getTokenSilently();

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_TOKEN_KEY, userToken);

    await getUserData(userToken);
    await updatePricesInLocalStorage(userToken);
    afterLoginUiSetup(userData);

    return { userData, userToken };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

async function handleLoginCallback(client) {
  try {
    await client.handleRedirectCallback();
    const { userData, userToken } = await fetchUserData(client);
    if (userData && userToken) {
      await syncUsersDB(userData, userToken);
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url);
    }
  } catch (error) {
    console.error('Error handling login callback:', error);
    alert('An error occurred while processing your login. Please try again.');
  }
}

// **New function to redirect to login if not authenticated and under `/user` path**
async function redirectToLoginIfUnauthenticated(client) {
  const isAuthenticated = await checkAuthentication(client);
  const currentPath = window.location.pathname;

  if (!isAuthenticated && currentPath.startsWith('/user')) {
    console.log('User is not authenticated and on /user path, redirecting to login...');
    await handleLogin(client);
  }
}

function checkUrlErrors() {
  //check if the url is valid, if the url has null in it then go back to home page
  const url = new URL(window.location.href);
  if (url.searchParams.get('code') === 'null') {
    window.location.href = '/';
  }
}
export async function initAuth() {
  console.log('****************  initAuth ****************');

  try {
    checkUrlErrors();

    const client = await createAuthClient();

    const loginElement = document.querySelector('[data-login="login"]');
    const logoutElement = document.querySelector('[data-login="logout"]');

    if (!loginElement || !logoutElement) {
      console.error('Login/logout elements are missing from the DOM.');
      return;
    }

    loginElement.addEventListener('click', () => handleLogin(client));
    logoutElement.addEventListener('click', () => handleLogout(client));

    const isAuthenticated = await checkAuthentication(client);
    console.log('Is Authenticated:', isAuthenticated); // Debugging line

    if (isAuthenticated) {
      await fetchUserData(client);
      return;
    }

    const url = new URL(window.location.href);
    const shouldHandleCallback = url.searchParams.has('code');
    console.log('Should Handle Callback:', shouldHandleCallback); // Debugging line

    if (shouldHandleCallback) {
      await handleLoginCallback(client);
    } else {
      // **Redirect to login if the user is not authenticated and is under /user path**
      await redirectToLoginIfUnauthenticated(client);
    }
  } catch (error) {
    console.error('Error in initAuth:', error); // Improved error handling
  }
}
