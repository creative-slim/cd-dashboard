// src/place_order/classes/orderCard.ts

import FileUploader from '../../extras/uploaderClass';
import { initInstances } from '../../extras/uploaderInstances';
import {
  // makeCheckBoxCollapsable,
  makeRadioCollapsable,
  // makeSmallCardCollapsable,
} from '../../utils/webflow/collapser';
import {
  removeObjectByElementIdFromLocalStorage,
  removeObjectById,
  saveAllData,
  saveData,
} from '../../utils/webflow/saveInput';
import OrderRender from './orderRender';

class OrderCard {
  element: HTMLElement;
  id: string;
  orderRenders: OrderRender[];
  appInstance: App;

  constructor(element: HTMLElement, appInstance: App) {
    this.element = element;
    this.id = `order-card-${Date.now()}`;
    this.element.id = this.id;
    this.orderRenders = [];
    this.appInstance = appInstance;

    this.setup();
  }

  setup() {
    this.updateElementAttributes();
    this.handleRequiredUploadFields();
    this.addEventListeners();

    this.initializeUploaders();
    this.addDeleteFunctionality();
    this.addNewOrderRender();
    initInstances();

    // saveData(this.element, this.element.closest('[main-render-item="main"]') as HTMLElement);
    this.appInstance.saveAllData();
  }
  handleRequiredUploadFields() {
    const wrapper = this.element.querySelector('[data-collapse-checkbox="wrapper"]');
    if (wrapper) {
      const radioInputs = wrapper.querySelectorAll('input[type="radio"]');
      // generate unique uuid
      const min = 1;
      const max = 99999999;
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      radioInputs.forEach((radio, index) => {
        radio.id = `${radio.id}_${randomNumber}`;
        //data-name
        const radioName = radio.getAttribute('data-name');
        radio.setAttribute('name', radioName + '_' + randomNumber);
        if (index === 0) {
          radio.checked = true;
        }

        radio.addEventListener('change', () => {
          if (radio.checked) {
            if (radio.value === 'provide') {
              const uploader = this.element.querySelector(
                '[data-upload-id="threed"]  input[type="text"]'
              );
              const uploaderNotRequired = this.element.querySelector(
                '[data-upload-id="photo"]  input[type="text"]'
              );
              if (uploader) {
                uploader.setAttribute('required', 'required');
              }
              if (uploaderNotRequired) {
                uploaderNotRequired.removeAttribute('required');
              }
            } else if (radio.value === 'build') {
              const uploader = this.element.querySelector(
                '[data-upload-id="photo"] input[type="text"]'
              );
              const uploaderNotRequired = this.element.querySelector(
                '[data-upload-id="threed"] input[type="text"]'
              );
              if (uploader) {
                uploader.setAttribute('required', 'required');
              }
              if (uploaderNotRequired) {
                uploaderNotRequired.removeAttribute('required');
              }
            }
          }
          this.appInstance.saveAllData();
        });
      });
    }
  }

  updateElementAttributes() {
    this.element.setAttribute('data-big-card-id', this.getTotalNumberOfOrderCards().toString());
    this.element.querySelectorAll<HTMLElement>('*').forEach((elem) => {
      if (!(elem.dataset && elem.dataset.excludeIdSwap) && elem.id) {
        elem.id = `${elem.id}__${Date.now()}`;
      }

      if (elem.dataset && elem.dataset.collapseCheckbox === 'open') {
        makeRadioCollapsable(elem, 'data-collapse-checkbox="wrapper"', true);
      } else if (elem.dataset && elem.dataset.collapseCheckbox === 'close') {
        makeRadioCollapsable(elem, 'data-collapse-checkbox="wrapper"', false);
      }
    });
  }

  addEventListeners() {
    this.element.addEventListener('change', () => {
      this.appInstance.saveAllData();
    });

    const addItemBtn = this.element.querySelector('[render-action="new-item"]') as HTMLElement;
    addItemBtn.addEventListener('click', () => this.addNewOrderRender());
  }

  initializeUploaders() {
    try {
      const uploaders = this.element.querySelectorAll('[data-upload="wrapper"]');
      console.log('--------uploaders', uploaders);
      uploaders.forEach((uploader) => {
        console.log('uploader', uploader);
        (uploader as HTMLElement).setAttribute(
          'data-upload-card',
          localStorage.getItem('orders-pieces') || ''
        );

        const fileUploader = new FileUploader(uploader, `fileUploader`);
      });
    } catch (error) {
      console.error('Error initializing uploaders:', error);
    }
  }

  addDeleteFunctionality() {
    try {
      const deleteBtn = this.element.querySelector('[data-furniture="remove"]') as HTMLElement;
      if (!deleteBtn) {
        throw new Error('Delete button not found');
      }
      deleteBtn.addEventListener('click', () => {
        console.log('deleteBtn clicked');
        console.log('this', this);
        console.log('this', this.appInstance);

        removeObjectById(this.id);
        this.element.remove();
        // Remove from orderCards array
        const index = this.appInstance.orderCards.indexOf(this);
        if (index > -1) {
          console.log('deleteing index : ', index, this.appInstance.orderCards[index]);
          this.appInstance.orderCards.splice(index, 1);
        }
        this.appInstance.saveAllData(); //* remove object already save data
      });
    } catch (error) {
      console.error('Error adding delete functionality:', error);
    }
  }

  addNewOrderRender() {
    try {
      const orderRenderTemplate = this.element.querySelector(
        '[render-template="request"]'
      ) as HTMLTemplateElement;

      if (!orderRenderTemplate) {
        throw new Error('[render-template="request" not found');
      }

      // Clone the content of the template
      const newOrderRenderElement = orderRenderTemplate.content.cloneNode(true) as DocumentFragment;

      // Convert the DocumentFragment into a proper HTMLElement by appending it to a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(newOrderRenderElement);

      // Select the newly added child (the actual cloned element from the template)
      const newOrderRender = new OrderRender(
        tempDiv.firstElementChild as HTMLElement,
        this.appInstance,
        this
      );

      // Push the new render to the order renders array
      this.orderRenders.push(newOrderRender);

      // Append the cloned content to the main wrapper
      const mainWrapper = this.element.querySelector('[render-item="list"]') as HTMLElement;
      if (mainWrapper) {
        mainWrapper.appendChild(newOrderRender.element);
      } else {
        throw new Error('Main wrapper not found');
      }
    } catch (error) {
      console.error('Error adding new order render:', error);
    }
  }

  getTotalNumberOfOrderCards() {
    return document.querySelectorAll('[main-render-item="main"]').length;
  }

  getData() {
    try {
      const cardData = {
        id: this.id,
        inputs: {},
        orderRenders: this.orderRenders.map((render) => render.getData()),
      };

      const inputs = this.element.querySelectorAll(
        'input:not([render-item="list"] input), textarea:not([render-item="list"] textarea), select:not([render-item="list"] select)'
      );
      inputs.forEach((input) => {
        if (input.type === 'checkbox') {
          cardData.inputs[input.id] = input.checked ? 'true' : 'false';
        } else if (input.type === 'radio') {
          if (input.checked) {
            cardData.inputs[input.name] = input.value;
          }
        } else {
          cardData.inputs[input.id] = input.value;
        }
      });

      return cardData;
    } catch (error) {
      console.error('Error getting card data:', error);
      return null;
    }
  }

  generateUUID() {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}

export default OrderCard;
