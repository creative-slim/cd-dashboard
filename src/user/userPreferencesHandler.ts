import Cookie from 'js-cookie';

let api;
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:8787'; // Use local endpoint for development
} else {
  api = 'https://creative-directors-dropbox.sa-60b.workers.dev'; // Use production endpoint
}

export default async function handleUserPreferences() {
  console.log('🙉  -- handleUserPreferences ');
  await userPreferForm();
}

async function userPreferForm() {
  console.log('👨🏻‍💻  -- userPreferForm ');
  const form = document.querySelector('[data-user="preferences"]');
  if (!form) {
    console.log('👨🏻‍💻 -- form not found ');
    return;
  }

  const submitBtn = form.querySelector('input[type="submit"]');

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = {};
    console.log('🙉  -- formData ', formData);
    formData.forEach((value, key) => {
      user[key] = value;
    });
    console.log(' 👨 user ', user);

    const token = localStorage.getItem('userToken');
    const resp = await fetch(`${api}/api/user/updateuserdetails`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    // update user data in Cookies
    if (resp.ok) {
      //!problematic because it changes the json keys
      Cookie.set('user', JSON.stringify(reverseMapUserData(user)), { expires: 1 });
    }

    const data = await resp.json();
    console.log('👨🏻‍💻 -- data ', data);
  });
  return;
}

// get user data from Cookies under user and fill the form
export function fillUserInformationInPreferencesUI() {
  console.log(' -- fillUserInformationInPreferencesUI ');
  const storedData = Cookie.get('user');
  if (!storedData) {
    console.log('+++++++++ -- storedData not found ');
    return;
  }
  const user = JSON.parse(storedData);

  if (!user) {
    console.log('+++++++++ -- user not found ');
    return;
  }

  const form = document.querySelector('[data-user="preferences"]');
  if (!form) {
    console.log('+++++++++++ -- form not found ');
    return;
  }

  const adaptedData = mapUserData(user);
  console.log('+++++++++++ -- adaptedData ', adaptedData);
  console.log('+++++++++++ -- user ', user);

  const formData = new FormData(form);
  formData.forEach((value, key) => {
    console.log('+++++++++++ -- key ', key, adaptedData[key]);
    if (adaptedData[key]) {
      form.querySelector(`[name="${key}"]`).value = adaptedData[key];
      // console.log('+++++++++++ -- key ', key, adaptedData[key]);
    }
  });
  return;
}

function mapUserData(user) {
  return {
    'user-mail': user.email,
    'user-first-name': user.first_name,
    'user-last-name': user.last_name,
    'user-phone': user.phone,
    street: user.street,
    'house-number': user.housenumber,
    'extra-address': user.additional_address,
    zip: user.zip,
    city: user.city,
    state: '', // The original object does not contain a state property
    country: user.country,
    contact_person: user.contactperson,
    customer_ref: user.auth0_id,
    USTIDNR: user.ust_idnr,
    company: user.company,
    contact_option: '', // The original object does not contain a contact_option property
    feature_update_alerts: user.feature_update_alerts,
    promotion_alerts: user.promotion_alerts,
    support_alerts: user.support_alerts,
    order_updates: user.order_updates,
  };
}

function reverseMapUserData(original) {
  return {
    email: original['user-mail'],
    first_name: original['user-first-name'],
    last_name: original['user-last-name'],
    phone: original['user-phone'],
    street: original.street,
    housenumber: original['house-number'],
    additional_address: original['extra-address'],
    zip: original.zip,
    city: original.city,
    country: original.country,
    contactperson: original.contact_person,
    auth0_id: original.customer_ref,
    ust_idnr: original.USTIDNR,
    company: original.company,
    feature_update_alerts: original.feature_update_alerts,
    promotion_alerts: original.promotion_alerts,
    support_alerts: original.support_alerts,
    order_updates: original.order_updates,
  };
}
