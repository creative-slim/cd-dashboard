export function errorModal(Msg) {
  const modal = document.querySelector('[data-modal="error"]');
  const modalContent = modal.querySelector('p');
  const modalClose = modal.querySelector('a');
  modalContent.innerHTML = Msg;
  modal.classList.add('show');
  modalClose.addEventListener('click', () => {
    modal.classList.remove('show');
  });
}

export function areRequiredFieldsPopulated() {
  const orderForm = document.getElementById('wf-form-mainFormSubmission');
  const requiredFields = orderForm.querySelectorAll('[required]');
  for (let field of requiredFields) {
    if (!field.value.trim()) {
      return false;
    }
  }
  return true;
}
