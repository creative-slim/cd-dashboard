import { createAuth0Client } from '@auth0/auth0-spa-js';
import Cookie from 'js-cookie';

import {
  afterLoginUiSetup,
  getUserData,
  syncUsersDB,
  updatePricesInLocalStorage,
} from './AuthHandlers';

export async function initAuth() {
  console.log('****************  initAuth ****************');

  // Check if user data exists in localStorage
  const storedUserData = localStorage.getItem('userData');
  const storedUserToken = localStorage.getItem('userToken');

  if (storedUserData && storedUserToken) {
    // If data exists in localStorage, use it
    console.log('Using stored user data:', JSON.parse(storedUserData));
    afterLoginUiSetup(JSON.parse(storedUserData));
  }

  const loginElement = document.querySelector('[data-login="login"]');
  const logoutElement = document.querySelector('[data-login="logout"]');

  if (!loginElement || !logoutElement) {
    console.error('no login/logout element');
    return;
  }

  // console.log('loginElement', loginElement);
  loginElement.addEventListener('click', async () => {
    await client.loginWithRedirect();
  });
  logoutElement.addEventListener('click', async () => {
    await client.logout();

    // Clear user data from localStorage on logout
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    Cookie.remove('user');

    // Optional: You can also trigger any UI updates needed after logout
    // afterLogoutUiSetup();
  });

  // Create the Auth0 client
  const client = await createAuth0Client({
    domain: 'best-renders.us.auth0.com',
    clientId: 'KcqCRysHkhaeEb4wQAUkqsRTOAEJneVW',
    authorizationParams: {
      redirect_uri: 'https://render-studio-24.webflow.io/',
      audience: 'https://www.bestrenders24.com/api',
    },
    prompt: 'login',
  });

  // Check if the user is already authenticated
  const isAuthenticated = await client.isAuthenticated();

  if (isAuthenticated) {
    // User is already logged in, fetch fresh data
    const userData = await client.getUser();
    const userToken = await client.getTokenSilently();
    // console.log(token expiratoire date)

    // Save fresh user data and token in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userToken', userToken);
    // Get user data from cookies or fetch from the API
    await getUserData(userToken);
    await updatePricesInLocalStorage(userToken);
    console.log('User is already logged in:', userData);
    // console.log('User token:', userToken);

    // Change UI based on user data
    afterLoginUiSetup(userData);
    return;
  }

  // Handle the callback if there's a "code" parameter in the URL
  const url = new URL(window.location.href);
  const shouldHandleCallback = url.searchParams.has('code');
  if (shouldHandleCallback) {
    await client.handleRedirectCallback();

    // Fetch the user data and token after handling the callback
    const userData = await client.getUser();
    const userToken = await client.getTokenSilently();

    // Get user data from cookies or fetch from the API
    await getUserData(userToken);
    await updatePricesInLocalStorage(userToken);

    // check if the user exists in the DB or add the user to the database
    const userExists = await syncUsersDB(userData, userToken);
    console.log('syncing user :::: ', userExists);

    // Save fresh user data and token in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userToken', userToken);

    console.log('User data updated after redirect:', userData);
    console.log('User token updated after redirect:', userToken);

    // Update UI
    afterLoginUiSetup(userData);

    //! might be problematic , investigate
    window.location.href = window.location.origin;
    return;
  }
}
