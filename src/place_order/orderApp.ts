// src/place_order/classes/orderApp.ts

import { cleanObject, restructureData } from '$extras/helperFunctions';

import OrderCard from './classes/orderCard';

class App {
  orderCards: OrderCard[];

  constructor() {
    this.orderCards = [];
    this.initialize();
    this.saveAllData();
  }

  initialize() {
    const mainOrderCardElement = document.querySelector('[main-render-item="main"]') as HTMLElement;
    if (!mainOrderCardElement) {
      console.error('No main order card found');
      return;
    }

    document.querySelectorAll('[main-render-item="main"]').forEach((el, index) => {
      if (index > 0) el.remove();
    });

    const mainOrderCard = new OrderCard(mainOrderCardElement, this);
    this.orderCards.push(mainOrderCard);

    this.setupAddOrderCardButton(mainOrderCard);

    localStorage.setItem('orders-pieces', '1');
    localStorage.removeItem('orderFiles');
    localStorage.removeItem('orderData');
  }

  setupAddOrderCardButton(orderCardTemplate: OrderCard) {
    const addOrderCardButton = document.querySelector('[render-app="add-new-item"]') as HTMLElement;
    addOrderCardButton.addEventListener('click', () => {
      const newOrderCardElement = orderCardTemplate.element.cloneNode(true) as HTMLElement;
      const newOrderCard = new OrderCard(newOrderCardElement, this);
      this.orderCards.push(newOrderCard);

      addOrderCardButton.parentNode!.insertBefore(newOrderCardElement, addOrderCardButton);

      this.incrementLocalStorageItem('orders-pieces');

      this.saveAllData();
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
    console.log('%c--------------stored data', 'color: orange', storedLocalData);
    localStorage.setItem('orderData', JSON.stringify(cleanObject(storedLocalData)));
    localStorage.setItem('CLEAN_orderData', JSON.stringify(cleanObject(storedLocalData)));
  }
}

export default App;
