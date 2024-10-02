// src/place_order/classes/orderRenderDetails.ts

import {
  makeCheckBoxCollapsable,
  // makeRadioCollapsable,
  // makeSmallCardCollapsable,
} from '../../utils/webflow/collapser';
import {
  removeObjectByElementIdFromLocalStorage,
  removeObjectById,
  saveAllData,
  // saveData,
} from '../../utils/webflow/saveInput';

class OrderRenderDetail {
  element: HTMLElement;
  id: string;
  appInstance: App;
  parentOrderRender: OrderRender;

  constructor(element: HTMLElement, appInstance: App, parentOrderRender: OrderRender) {
    this.element = element;
    this.id = `order-render-detail-${Date.now()}`;
    this.element.id = this.id;
    this.appInstance = appInstance;
    this.parentOrderRender = parentOrderRender; // Assign the parent OrderRender

    this.setup();
  }

  setup() {
    this.updateElementAttributes();
    this.addDeleteFunctionality();
    this.clearInputFields();
    this.setupCollapsible();
    this.addEventListeners();
  }

  addEventListeners() {
    // Save data whenever there is a change within this order render detail
    this.element.addEventListener('change', () => {
      this.appInstance.saveAllData();
    });
  }

  updateElementAttributes() {
    const uniqueSuffix = Date.now();
    this.element.setAttribute('data-template', 'duplicate');

    this.element.querySelectorAll<HTMLElement>('[id]').forEach((el) => {
      el.id = `${el.id}_${uniqueSuffix}`;
    });
  }

  addDeleteFunctionality() {
    const deleteBtn = this.element.querySelector('[render-item="delete"]') as HTMLElement;
    deleteBtn.addEventListener('click', () => {
      this.element.remove();
      removeObjectById(this.id);
      // Remove from orderRenderDetails array
      console.log('this.parentOrderRender.orderRenderDetails:', this.parentOrderRender);
      const index = this.parentOrderRender.orderRenderDetails.indexOf(this);
      if (index > -1) {
        this.parentOrderRender.orderRenderDetails.splice(index, 1);
      }
      this.appInstance.saveAllData();
    });
  }

  clearInputFields() {
    const inputs = this.element.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input, textarea, select');
    inputs.forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        (input as HTMLInputElement).checked = false;
      } else if (input instanceof HTMLSelectElement) {
        input.selectedIndex = 0;
      } else {
        input.value = '';
      }
    });
  }

  setupCollapsible() {
    const toggleElement = this.element.querySelector(
      '[data-collapse-checkbox="toggle"]'
    ) as HTMLElement;
    makeCheckBoxCollapsable(toggleElement, 'data-collapse-checkbox="wrapper"');
  }

  getData() {
    const detailData: any = {
      id: this.id,
      inputs: {},
    };

    const inputs = this.element.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
      if (input.type === 'checkbox') {
        detailData.inputs[input.id] = input.checked ? 'true' : 'false';
      } else {
        detailData.inputs[input.id] = input.value;
      }
    });

    return detailData;
  }
}

export default OrderRenderDetail;
