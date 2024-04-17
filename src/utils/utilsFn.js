export const uploadInvoice = async (pdfFile, fullPath) => {
  console.log('uploadInvoice', pdfFile, fullPath);
  const formData = new FormData();
  const prod = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  const dev = 'http://127.0.0.1:8787';

  const endpoint = '/api/cd/uploadinvoice';

  formData.append('file', pdfFile);
  formData.append('fullPath', fullPath);

  try {
    const response = await fetch(prod + endpoint, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    const linkarray = generateLinksArray(data.data);
    return { linkarray, data };
  } catch (err) {
    console.error(err);
    return null;
  }
};

function generateLinksArray(image_names) {
  const formattedString = image_names
    .map((name) => 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/' + name)
    .join(',');
  console.table(formattedString);
  return formattedString;
}

// send envoice per email
export const sendInvoice = async (linkarray, reciever) => {
  console.log('sendInvoice', linkarray, reciever);
  const prod = 'https://mailing.sa-60b.workers.dev';
  const dev = 'http://127.0.0.1:8787';

  const endpoint = `/api/mail/cd/invoice/${reciever}`;
  const data = {
    reciever,
    linkarray,
  };
  try {
    const response = await fetch(prod + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

// function that checks if the fields that has data attribute 'required' are filled
export const checkRequiredFields = () => {
  const form = document.querySelector('#wf-form-mainFormSubmission');
  const requiredFields = form.querySelectorAll('.w--tab-active [required]');
  const nextButton = form.querySelector('[data-tab-nav="next"]');
  nextButton.setAttribute('disabled', true);
  console.log('requiredFields', requiredFields);

  nextButton.addEventListener('click', () => {
    console.log('clicked');
    if (requiredFields.length === 0) {
      return;
    }

    requiredFields.forEach((field) => {
      field.addEventListener('input', () => {
        const filledFields = Array.from(requiredFields).filter((field) => field.value !== '');
        if (requiredFields.length === filledFields.length) {
          nextButton.removeAttribute('disabled');
        } else {
          nextButton.setAttribute('disabled', true);
        }
      });
    });
  });
};
