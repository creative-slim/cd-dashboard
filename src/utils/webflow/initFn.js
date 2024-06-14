import { makeSmallCardCollapsable } from './collapser';
import initOrderSummary from './orderSummary';

export default function initWebflowFunctions() {
  // checkUserAddressData();
  // renderSetupParams();
  initOrderSummary('[data-order-summary-wrapper]');
  document.querySelectorAll('[data-collapse="toggle"]').forEach((button) => {
    makeSmallCardCollapsable(button, 'data-collapse="wrapper"');
  });
}
