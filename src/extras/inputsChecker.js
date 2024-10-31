export function errorModal(Msg) {
  try {
    // Validate the 'Msg' parameter
    if (typeof Msg !== 'string') {
      throw new TypeError('The "Msg" parameter must be a string.');
    }

    // Select the modal element
    const modal = document.querySelector('[data-modal="error"]');
    if (!modal) {
      throw new Error('Modal element not found: [data-modal="error"]');
    }

    // Select the modal content element
    const modalContent = modal.querySelector('p');
    if (!modalContent) {
      throw new Error('Modal content element not found inside the modal.');
    }

    // Select the modal close button
    const modalClose = modal.querySelector('.modal-close');
    if (!modalClose) {
      throw new Error('Modal close button not found inside the modal.');
    }

    // Set the modal content
    modalContent.textContent = Msg;

    // Show the modal
    modal.classList.add('show');

    // Remove any existing click event listeners to prevent multiple bindings
    const newModalClose = modalClose.cloneNode(true);
    modalClose.parentNode.replaceChild(newModalClose, modalClose);

    // Add click event listener to close the modal
    newModalClose.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  } catch (error) {
    console.error('An error occurred in errorModal:', error);
  }
}

export function areRequiredFieldsPopulated() {
  try {
    // Select the order form
    const orderForm = document.getElementById('wf-form-mainFormSubmission');
    if (!orderForm) {
      throw new Error("Form with ID 'wf-form-mainFormSubmission' not found.");
    }

    // Select all required fields within the form
    const requiredFields = orderForm.querySelectorAll('[required]');
    if (requiredFields.length === 0) {
      console.warn('No required fields found within the form.');
      return true; // Assuming the form is valid if there are no required fields
    }

    // Iterate over each required field
    for (let field of requiredFields) {
      // Check if field has a value property
      if (!('value' in field)) {
        console.warn(
          `Field ${field.name || field.id || 'unknown'} does not have a value property. Skipping validation for this field.`
        );
        continue; // Skip fields without a value property
      }

      // Trim the field value
      const value = field.value.trim();

      // Check if the field is empty
      if (!value) {
        console.warn(`Required field "${field.name || field.id || 'unknown'}" is empty.`);
        return false;
      }

      // If the field is a number input, check for positive number
      if (field.type === 'number' || field.dataset.type === 'number') {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue) || numberValue < 1) {
          console.warn(`Field "${field.name || field.id || 'unknown'}" must be a positive number.`);
          return false;
        }
      }

      // Additional validation for email fields
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          console.warn(
            `Field "${field.name || field.id || 'unknown'}" must be a valid email address.`
          );
          return false;
        }
      }
    }

    // All validations passed
    return true;
  } catch (error) {
    console.error('An error occurred in areRequiredFieldsPopulated:', error);
    return false;
  }
}

export function checkIfGuestEmailIsFilled() {
  try {
    // Select the email input field
    const emailField = document.querySelector('[data-pay-guest="email"]');
    if (!emailField) {
      throw new Error("Email field with ID 'email' not found.");
    }

    // Trim the email field value
    const emailValue = emailField.value.trim();

    // Check if the email field is empty
    if (!emailValue) {
      console.warn('Guest email field is empty.');
      return false;
    }

    // Check if the email field is a valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      console.warn('Guest email field must be a valid email address.');
      return false;
    }

    // Email field is valid
    return true;
  } catch (error) {
    console.error('An error occurred in checkIfGuestEmailIsFilled:', error);
    return false;
  }
}
