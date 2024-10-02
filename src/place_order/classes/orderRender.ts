// src/place_order/classes/orderRender.ts

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
import OrderRenderDetail from './orderRenderDetails';

class OrderRender {
  element: HTMLElement;
  id: string;
  orderRenderDetails: OrderRenderDetail[];
  appInstance: App;
  parentOrderCard: OrderCard;

  constructor(element: HTMLElement, appInstance: App, parentOrderCard: OrderCard) {
    this.element = element;
    this.id = `order-render-${Date.now()}`;
    this.element.id = this.id;
    this.orderRenderDetails = [];
    this.appInstance = appInstance;
    this.parentOrderCard = parentOrderCard; // Assign the parent OrderCard

    this.setup();
  }

  setup() {
    this.updateElementAttributes();
    this.addDeleteFunctionality();
    this.clearInputFields();
    this.setupCollapsible();
    this.setupAddOrderRenderDetailButton();
    this.addNewOrderRenderDetail();

    this.addEventListeners();
  }

  addEventListeners() {
    // Save data whenever there is a change within this order render
    this.element.addEventListener('change', () => {
      this.appInstance.saveAllData();
    });

    // Handle adding new OrderRenderDetail
    const addDetailBtn = this.element.querySelector(
      '[render-action="new-order-detail"]'
    ) as HTMLElement;
    addDetailBtn.addEventListener('click', () => {
      // this.addNewOrderRenderDetail();
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
      removeObjectById(this.id);
      this.element.remove();
      // Remove from orderRenders array
      const index = this.parentOrderCard.orderRenders.indexOf(this);
      if (index > -1) {
        this.parentOrderCard.orderRenders.splice(index, 1);
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

  setupAddOrderRenderDetailButton() {
    const addOrderRenderDetailBtn = this.element.querySelector(
      '[render-action="new-order-detail"]'
    ) as HTMLElement;
    addOrderRenderDetailBtn.addEventListener('click', () => this.addNewOrderRenderDetail());
  }
  getData() {
    const renderData: any = {
      id: this.id,
      inputs: {},
      orderRenderDetails: [],
    };

    const inputs = this.element.querySelectorAll(
      'input:not([render-item="detail-list"] input), textarea:not([render-item="detail-list"] textarea), select:not([render-item="detail-list"] select)'
    );
    inputs.forEach((input) => {
      // Skip inputs inside OrderRenderDetails
      if (input.closest('[render-item="detail-item"]')) {
        return;
      }

      if (input.type === 'checkbox') {
        renderData.inputs[input.id] = input.checked ? 'true' : 'false';
      } else {
        renderData.inputs[input.id] = input.value;
      }
    });

    // Collect data from OrderRenderDetails
    renderData.orderRenderDetails = this.orderRenderDetails.map((detail) => detail.getData());

    return renderData;
  }

  addNewOrderRenderDetail() {
    const orderRenderDetailTemplate = this.element.querySelector(
      '[render-item="detail-item"]'
    ) as HTMLTemplateElement;
    const newOrderRenderDetailElement = orderRenderDetailTemplate.content.cloneNode(
      true
    ) as DocumentFragment;
    // Convert the DocumentFragment into a proper HTMLElement by appending it to a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(newOrderRenderDetailElement);
    const newOrderRenderDetail = new OrderRenderDetail(
      tempDiv.firstElementChild as HTMLElement,
      this.appInstance,
      this
    );

    this.orderRenderDetails.push(newOrderRenderDetail);
    const orderRenderDetailsWrapper = this.element.querySelector(
      '[render-item="detail-list"]'
    ) as HTMLElement;
    orderRenderDetailsWrapper.appendChild(newOrderRenderDetail.element);
  }
}

export default OrderRender;
