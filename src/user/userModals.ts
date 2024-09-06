// check if the user is already authenticated
import Cookie from 'js-cookie';
// check if local storage has the user data ( address )
// prompt the user to login if not authenticated
// promt the user to input their address if they are authenticated but no address
//! API ENDPOINTS
const server = 'https://creative-directors-dropbox.sa-60b.workers.dev';
const local = 'http://localhost:8787';

//?change this to switch between local and server
const api = process.env.NODE_ENV === 'development' ? local : server;

export async function userAddressModal() {
  const modal = document.querySelector('[data-modal="address"]');
  if (!modal) return;
  // modal?.removeAttribute('style');
  modal?.classList.add('show');
  await addressModalSubmitHandler();

  const closeButton = modal.querySelector('.modal-close');
  closeButton.addEventListener('click', () => {
    modal.classList.remove('show');
  });
}

export function checkUserDetails() {
  const userData = Cookie.get('user');
  if (!userData) {
    console.error(' No user data found');
    return;
  }

  const user = JSON.parse(userData);
  console.log('🙉  -- user ', user);
  checkRequiredFields(user);
}

//!++++++++++++++++++++++++++++++++

async function downloadUserDetails() {
  const token = localStorage.getItem('userToken');
  const resp = await fetch(`${api}/api/user/userdetails`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (resp.status === 200) {
    const data = await resp.json();
    console.log('🙉  -- data ', data);
    Cookie.set('user', JSON.stringify(data), { expires: 1 });
    return true;
  }

  return false;
}

export function checkRequiredFields(user) {
  const reqArray = ['fisrt_name', 'last_name', 'street', 'city', 'housenumber', 'country', 'zip'];

  let missingFields = false;
  reqArray.forEach((field) => {
    console.log('🙉  -- field ', field);
    if (!user[field]) {
      missingFields = true;
    }
  });

  if (missingFields) {
    console.log('🙉  -- missingField ', missingFields);
    userAddressModal();
  }

  console.log(' -- reqArray ', reqArray);

  return;
}

async function addressModalSubmitHandler() {
  //! API ENDPOINTS
  const server = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  const local = 'http://localhost:8787';

  //?change this to switch between local and server
  const api = process.env.NODE_ENV === 'development' ? local : server;

  const modal = document.querySelector('[data-modal="address"]');
  if (!modal) return;
  const token = localStorage.getItem('userToken');

  const submitBtn = modal.querySelector('input[type="submit"]');
  const form = modal.querySelector('form');
  if (!form) return;

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = {};
    console.log('🙉  -- formData ', formData);
    formData.forEach((value, key) => {
      console.log('🙉  -- key ', key);
      console.log('🙉  -- value ', value);
      user[key] = value;
    });

    console.log('🙉  -- user ', user);
    const resp = await fetch(`${api}/api/user/updateuser`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    if (resp.status === 200) {
      console.log('🙉  -- resp ', resp);
      const successMessage = modal.querySelector('.w-form-done');
      // change display to block
      successMessage.style.display = 'block';
      await downloadUserDetails();
      //add 1 sec delay
      setTimeout(() => {
        successMessage.style.display = 'none';
        modal.classList.remove('show');
      }, 1000);
      return true;
    }
    console.error('Error updating user data');
    const errorMessage = modal.querySelector('.w-form-fail');
    // change display to block
    errorMessage.style.display = 'block';
    //add 1 sec delay
    setTimeout(() => {
      errorMessage.style.display = 'none';
      modal.classList.remove('show');
    }, 1000);

    modal.classList.remove('show');
    return false;
  });
}
