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

    const data = await resp.json();
    console.log('👨🏻‍💻 -- data ', data);
  });
  return;
}
