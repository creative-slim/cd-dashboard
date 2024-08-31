import { userAddressModal } from './userModals';

export async function editInvoiceAddress() {
  const editBtn = document.querySelector('[data-user-actions="edit-invoice-address"]');
  if (!editBtn) {
    console.error('No edit button found');
    return;
  }
  editBtn.addEventListener('click', async () => {
    userAddressModal();
  });
}
