import Cookie from 'js-cookie';

export function afterLoginUiSetup(data) {
  const user_img = document.querySelector('[data-login="avatar"]');
  const username = document.querySelector('[data-login="username"]');
  const loginElement = document.querySelector('[data-login="login"]');

  if (!user_img || !username || !loginElement) return;

  loginElement.style.display = 'none';
  user_img.src = data.picture;
  username.textContent = data.name;
}

export function afterLogoutUiSetup() {
  const user_img = document.querySelector('[data-login="avatar"]');
  const username = document.querySelector('[data-login="username"]');
  const loginElement = document.querySelector('[data-login="login"]');

  if (!user_img || !username || !loginElement) return;

  loginElement.style.display = 'block';
  user_img.src = '';
  username.textContent = '';
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
