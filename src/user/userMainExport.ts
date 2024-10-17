import { editInvoiceAddress } from './editInvoiceAddress';
import initInvoiceAddress from './userInvoiceAddress';
import { checkUserDetails, fillAddressFields, userAddressModal } from './userModals';
import handleUserPreferences, {
  fillUserInformationInPreferencesUI,
} from './userPreferencesHandler';

export default function initUserRelatedFunctions() {
  // userAddressModal();
  console.groupCollapsed('initUserRelatedFunctions');
  checkUserDetails();
  handleUserPreferences();
  initInvoiceAddress();
  fillUserInformationInPreferencesUI();
  editInvoiceAddress();
  fillAddressFields();
  console.groupEnd();
}
