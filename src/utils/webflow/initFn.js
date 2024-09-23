import { makeSmallCardCollapsable } from './collapser';
import initOrderSummary from './orderSummary';

export default function initWebflowFunctions() {
  // checkUserAddressData();
  // renderSetupParams();
  // initOrderSummary('[data-render-list="cart"]'); //! TODO TURN BACK ON
  document.querySelectorAll('[data-collapse="toggle"]').forEach((button) => {
    makeSmallCardCollapsable(button, 'data-collapse="wrapper"');
  });
}
