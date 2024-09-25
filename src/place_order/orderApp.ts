// src/place_order/classes/orderApp.ts

import { cleanObject, restructureData } from '$extras/helperFunctions';

import { renderCart } from './cart';
// import CartUI from './cart';
import OrderCard from './classes/orderCard';

class App {
  orderCards: OrderCard[];
  // cart: CartUI;

  constructor() {
    this.orderCards = [];
    this.initialize();
    this.saveAllData();
    // this.cart = new CartUI();
  }

  initialize() {
    // document.querySelectorAll('[main-render-item="main"]').forEach((el, index) => {
    //   if (index > 0) el.remove();
    // });

    this.createMainOrderCard(this.orderCards);
    this.setupAddOrderCardButton();

    localStorage.setItem('orders-pieces', '1');
    localStorage.removeItem('orderFiles');
    localStorage.removeItem('orderData');
  }

  createMainOrderCard(orderCards: OrderCard[]) {
    const mainOrderCardTemplateElement = document.querySelector(
      '[main-render-item="main"]'
    ) as HTMLTemplateElement;
    if (!mainOrderCardTemplateElement) {
      console.error('No main order card found');
      return;
    }

    try {
      const newOrderCardElement = mainOrderCardTemplateElement.content.cloneNode(
        true
      ) as DocumentFragment;

      const clonedOrderCard = document.createElement('div');
      clonedOrderCard.appendChild(newOrderCardElement);

      const mainOrderCard = new OrderCard(clonedOrderCard.firstElementChild as HTMLElement, this);
      orderCards.push(mainOrderCard);

      mainOrderCardTemplateElement.parentNode!.insertBefore(
        clonedOrderCard.firstElementChild!,
        mainOrderCardTemplateElement
      );
    } catch (error) {
      console.error('Error creating main order card:', error);
    }
  }

  setupAddOrderCardButton() {
    const addOrderCardButton = document.querySelector('[render-app="add-new-item"]') as HTMLElement;
    addOrderCardButton.addEventListener('click', () => {
      try {
        console.log('addOrderCardButton clicked');

        this.createMainOrderCard(this.orderCards);

        this.incrementLocalStorageItem('orders-pieces');

        this.saveAllData();
      } catch (error) {
        console.error('Error adding order card:', error);
      }
    });
  }

  incrementLocalStorageItem(itemName: string) {
    let currentValue = localStorage.getItem(itemName);
    currentValue = currentValue ? (parseInt(currentValue, 10) + 1).toString() : '1';
    localStorage.setItem(itemName, currentValue);
  }

  saveAllData() {
    const storedLocalData = this.orderCards.map((orderCard) => orderCard.getData());
    //custom console log with orange color
    const cleanData = cleanObject(storedLocalData);
    // console.log('%c-------------- App data', 'color: orange', cleanData);
    renderCart();

    localStorage.setItem('orderData', JSON.stringify(cleanData));
    if (this.cart) {
      this.cart.updateCart(cleanData);
    }
    // this.cart.updateCart(cleanData);
  }
}

export default App;
