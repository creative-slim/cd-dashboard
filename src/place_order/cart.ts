// cart.ts

import Order from './classes/cartOrder';

export default class CartUI {
  container: HTMLElement | null;
  orderTemplate: HTMLElement | null;
  renderTemplate: HTMLElement | null;
  renderDetailsTemplate: HTMLElement | null;
  prices: any;

  constructor() {
    console.log('################ - CartUI initialized - ################');

    // Select the container where cart items will be rendered
    this.container = document.querySelector('[data-render-list="cart"]');
    this.orderTemplate = document.querySelector('[cart-templates="order-item"]') as HTMLElement;
    this.renderTemplate = document.querySelector('[cart-templates="order-render"]') as HTMLElement;
    this.renderDetailsTemplate = document.querySelector(
      '[cart-templates="render-details"]'
    ) as HTMLElement;

    if (this.renderDetailsTemplate) {
      //   this.renderDetailsTemplate.style.display = 'none'; // Hide the template
    }

    const pricesFromStorage = localStorage.getItem('prices');
    if (pricesFromStorage) {
      try {
        this.prices = JSON.parse(pricesFromStorage);
      } catch (error) {
        console.error('Error parsing prices from localStorage:', error);
        this.prices = {};
      }
    } else {
      console.warn('Prices not found in localStorage. Initializing with empty prices.');
      this.prices = {}; // Initialize with empty object or default prices if available
    }
  }

  // Method to clear cart content
  clearCart() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // Method to populate cart UI with data
  populateCart(cartData: any[]) {
    if (!Array.isArray(cartData)) {
      console.error('Invalid cart data provided. Expected an array.');
      return;
    }

    this.clearCart(); // Clear previous content

    cartData.forEach((orderData, index) => {
      try {
        const order = new Order(
          orderData,
          this.prices,
          this.orderTemplate,
          this.renderTemplate,
          this.renderDetailsTemplate
        );

        if (!order.isValid()) {
          console.warn(`Order at index ${index} is invalid and will not be rendered.`);
          return; // Skip rendering this order
        }

        const orderElement = order.generateOrderUI();
        console.log('Order element:', orderElement);
        if (this.container) {
          this.container.appendChild(orderElement);
        }
      } catch (error) {
        console.error('Error generating order UI:', error);
      }
    });
  }

  // Method to update the content of the cart
  updateCart(newData: any[]) {
    this.populateCart(newData);
  }
}
