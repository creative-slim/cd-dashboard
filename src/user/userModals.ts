// check if the user is already authenticated
import Cookie from 'js-cookie';

import initInvoiceAddress from './userInvoiceAddress';
// check if local storage has the user data ( address )
// prompt the user to login if not authenticated
// promt the user to input their address if they are authenticated but no address
//! API ENDPOINTS
let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

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
    //console.error(' No user data found');
    return;
  }

  const user = JSON.parse(userData);
  //console.log('🙉  -- user ', user);
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
    //console.log('🙉  -- data ', data);
    Cookie.set('user', JSON.stringify(data), { expires: 1 });
    return true;
  }

  return false;
}

export function checkRequiredFields(user) {
  const reqArray = ['first_name', 'last_name', 'street', 'city', 'housenumber', 'country', 'zip'];

  let missingFields = false;
  reqArray.forEach((field) => {
    //console.log('🙉  -- field ', field);
    if (!user[field]) {
      //console.error('🙉  -- missingField ', field);
      missingFields = true;
    }
  });

  if (missingFields) {
    //console.log('🙉  -- missingField ', missingFields);
    userAddressModal();
  }

  //console.log(' -- reqArray ', reqArray);

  return;
}

async function addressModalSubmitHandler() {
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
    //console.log('🙉  -- formData ', formData);
    formData.forEach((value, key) => {
      //console.log('🙉  -- key ', key);
      //console.log('🙉  -- value ', value);
      user[key] = value;
    });

    //console.log('🙉  -- user ', user);
    const resp = await fetch(`${api}/api/user/updateuser`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    if (resp.status === 200) {
      //console.log('🙉  -- resp ', resp);
      const successMessage = modal.querySelector('.w-form-done');
      Cookie.set('user', JSON.stringify(transformUpdateModalFormatToUserData(user)), {
        expires: 1,
      });
      initInvoiceAddress();

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
    //console.error('Error updating user data');
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

// fill the address fields with the modal data
export function fillAddressFields() {
  const userData = Cookie.get('user');
  if (!userData) return;
  const user = JSON.parse(userData);

  const adaptedData = transformUserDataToUpdateModalFormat(user);

  const form = document.querySelector('[data-modal="address"] form');
  if (!form) return;

  for (const key in adaptedData) {
    const input = form.querySelector(`[name="${key}"]`);
    if (!input) continue;
    input.value = adaptedData[key];
  }
}

function transformUserDataToUpdateModalFormat(userData) {
  return {
    'update-first-name': userData.first_name || '',
    'update-last-name': userData.last_name || '',
    'update-phone': userData.phone || '',
    'update-contactperson': userData.contactperson || '',
    'update-idnr': userData.ust_idnr || '',
    'update-company': userData.company || '',
    'update-street': userData.street || '',
    'update-house-number': userData.housenumber || '',
    'update-additional': userData.additional_address || '',
    'update-zip': userData.zip || '',
    'update-city': userData.city || '',
    'update-country': userData.country || '',
  };
}

function transformUpdateModalFormatToUserData(modalData) {
  return {
    first_name: modalData['update-first-name'] || '',
    last_name: modalData['update-last-name'] || '',
    phone: modalData['update-phone'] || '',
    contactperson: modalData['update-contactperson'] || '',
    ust_idnr: modalData['update-idnr'] || '',
    company: modalData['update-company'] || '',
    street: modalData['update-street'] || '',
    housenumber: modalData['update-house-number'] || '',
    additional_address: modalData['update-additional'] || '',
    zip: modalData['update-zip'] || '',
    city: modalData['update-city'] || '',
    country: modalData['update-country'] || '',
  };
}
