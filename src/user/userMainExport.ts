import { editInvoiceAddress } from './editInvoiceAddress';
import initInvoiceAddress from './userInvoiceAddress';
import { checkUserDetails, userAddressModal } from './userModals';
import handleUserPreferences, {
  fillUserInformationInPreferencesUI,
} from './userPreferencesHandler';

export default function initUserRelatedFunctions() {
  // userAddressModal();
  checkUserDetails();
  handleUserPreferences();
  initInvoiceAddress();
  fillUserInformationInPreferencesUI();
  editInvoiceAddress();
}
