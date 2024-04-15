export function updateUserAddress() {
  const formWrapper = document.querySelector('[data-modal="address"]');
  if (!formWrapper) {
    return;
  }
  const form = formWrapper.querySelector('form');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    let api = 'https://creative-directors-dropbox.sa-60b.workers.dev';

    const response = await fetch(api + '/api/cd/webflow/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      formWrapper.getElementsByClassName('w-form-done')[0].style.display = 'block';
      form.style.display = 'none';
    } else {
      formWrapper.getElementsByClassName('w-form-fail')[0].style.display = 'block';
    }
  });
}
