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

export const uploadInvoiceToCMS = async (pdfFileLink, cmsItemsArray) => {
  const prod = 'https://creative-directors-dropbox.sa-60b.workers.dev';
  const dev = 'http://127.0.0.1:8787';

  const endpoint = `/api/webflow/cms/invoice`;
  for (const item of cmsItemsArray) {
    const data = {
      itemID: item.id,
      invoiceLink: pdfFileLink,
    };
    try {
      const response = await fetch(prod + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Response:', result);
    } catch (err) {
      console.error(err);
    }
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
    const filledFields = Array.from(requiredFields).filter((field) => field.value !== '');
    if (requiredFields.length === filledFields.length) {
      nextButton.removeAttribute('disabled');
    } else {
      nextButton.setAttribute('disabled', true);
    }
  });
};

// function that takes in a string and animate a div to show that string inside it
export const submitLogger = (msg, color = 'white') => {
  const log = document.querySelector('[data-submit="logger"]');
  log.innerHTML += `<p style="color:${color}">${msg}</p>`;
};

export const loggerUpdate = (state) => {
  const states = {
    1: 'state-1',
    2: 'state-2',
    3: 'state-3',
    4: 'state-4',
  };
  const current = document.querySelector(`[submit-logger="${states[state]}"]`);
  if (current) {
    const loaderLottie = current.querySelector('[submit-logger="loading"]');
    loaderLottie.style.display = 'block';
  }

  const prev = document.querySelector(`[submit-logger="${states[state - 1]}"]`);
  if (!prev) return;
  const children = Array.from(prev.children);
  if (children.length === 0) {
    return;
  }
  const prevloaderLottie = prev.querySelector('[submit-logger="loading"]');

  prevloaderLottie.style.display = 'none';

  children.forEach((child) => {
    child.classList.add('done');
  });
};

export const showSubmitLogger = () => {
  const submitLogger = document.querySelector('[data-submit="logger"]');
  if (submitLogger) {
    submitLogger.style.display = 'block';
  }
};

// hide the submit logger
export const hideSubmitLogger = () => {
  const submitLogger = document.querySelector('[data-submit="logger"]');
  if (submitLogger) {
    submitLogger.style.display = 'none';
  }
};

// function that makes every clickable element in the DOM reload the webpage
export const reloadPage = () => {
  document.querySelectorAll('a', 'button').forEach((element) => {
    element.addEventListener('click', () => {
      location.reload();
    });
  });
};
