import initInvoiceAddress from './userInvoiceAddress';
import { checkUserDetails, userAddressModal } from './userModals';
import handleUserPreferences from './userPreferencesHandler';

export default function initUserRelatedFunctions() {
  // userAddressModal();
  checkUserDetails();
  handleUserPreferences();
  initInvoiceAddress();
}
