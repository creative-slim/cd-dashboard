import Render from './cartRender';

class Order {
  orderData: any;
  prices: any;
  orderTemplate: HTMLElement | null;
  renderTemplate: HTMLElement | null;
  renderDetailsTemplate: HTMLElement | null;
  renders: Render[];
  alreadyPayedWoodtypesSet: Set<string>; // New property

  constructor(
    orderData: any,
    prices: any,
    orderTemplate: HTMLElement | null,
    renderTemplate: HTMLElement | null,
    renderDetailsTemplate: HTMLElement | null
  ) {
    this.orderData = orderData;
    this.prices = prices;
    this.orderTemplate = orderTemplate;
    this.renderTemplate = renderTemplate;
    this.renderDetailsTemplate = renderDetailsTemplate;
    this.alreadyPayedWoodtypesSet = new Set<string>(); // Initialize here
    this.renders = this.initializeRenders();
  }

  // Initialize Render instances for each renderData
  initializeRenders(): Render[] {
    if (!Array.isArray(this.orderData.orderRenders)) {
      return [];
    }

    return this.orderData.orderRenders.map(
      (renderData: any) =>
        new Render(
          renderData,
          this.prices,
          this.renderTemplate,
          this.renderDetailsTemplate,
          this.alreadyPayedWoodtypesSet // Pass the shared Set
        )
    );
  }

  // Method to validate the order data
  isValid(): boolean {
    const requiredFields = [
      'item-name',
      'item-width',
      'item-height',
      'item-length',
      //   'item-details',
    ];
    for (const field of requiredFields) {
      if (!this.orderData.inputs[field] || this.orderData.inputs[field].trim() === '') {
        console.error(`Order is missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(this.orderData.orderRenders) || this.orderData.orderRenders.length === 0) {
      console.error('Order must have at least one render.');
      return false;
    }

    // Validate each render
    for (const [renderIndex, renderInstance] of this.renders.entries()) {
      if (!renderInstance.isValid()) {
        console.error(`Render at index ${renderIndex} in order is invalid.`);
        return false;
      }
    }

    return true;
  }

  // Method to calculate the price for an order
  calculatePrice(): { base: number; renders: number; total: number } {
    const basePrice =
      this.orderData.inputs['three-d-modelling'] === 'build'
        ? this.prices.base.build
        : this.prices.base.render || 0;
    let renderPrice = 0;

    this.renders.forEach((renderInstance) => {
      renderPrice += renderInstance.calculateRenderPrice();
    });

    return {
      base: basePrice,
      renders: renderPrice,
      total: basePrice + renderPrice,
    };
  }

  // Method to generate the UI for the order
  generateOrderUI(): HTMLElement {
    if (!this.orderTemplate) {
      throw new Error('Order template not found.');
    }

    // Clone the order template content
    const orderElement = this.orderTemplate.cloneNode(true) as HTMLElement;

    // Populate general order details
    const itemNameElement = orderElement.querySelector('[data-order-cart="item-name"]');
    if (itemNameElement) {
      itemNameElement.textContent = this.orderData.inputs['item-name'] || '--';
    }

    const itemWidthElement = orderElement.querySelector('[data-order-cart="item-width"]');
    if (itemWidthElement) {
      itemWidthElement.textContent = this.orderData.inputs['item-width'] || '0';
    }

    const itemHeightElement = orderElement.querySelector('[data-order-cart="item-height"]');
    if (itemHeightElement) {
      itemHeightElement.textContent = this.orderData.inputs['item-height'] || '0';
    }

    const itemLengthElement = orderElement.querySelector('[data-order-cart="item-length"]');
    if (itemLengthElement) {
      itemLengthElement.textContent = this.orderData.inputs['item-length'] || '0';
    }

    const itemDetailsElement = orderElement.querySelector('[data-order-cart="item-details"]');
    if (itemDetailsElement) {
      itemDetailsElement.textContent = this.orderData.inputs['item-details'] || '--';
    }

    // Calculate and display price
    const prices = this.calculatePrice();
    const subTotalElement = orderElement.querySelector('[data-order-cart="sub-total"]');
    if (subTotalElement) {
      subTotalElement.textContent = `${prices.total}`;
    }
    const priceElement = orderElement.querySelector('[data-order-cart="price"]');
    if (priceElement) {
      priceElement.textContent = `${prices.base}`;
    }
    const totalPriceElement = document.querySelector('[data-order-cart="total"]');
    if (totalPriceElement) {
      totalPriceElement.textContent = `${prices.total}`;
    }

    // Handle renders using the same Render instances
    const rendersContainer = orderElement.querySelector('[data-order-cart="list"]');
    if (rendersContainer) {
      rendersContainer.innerHTML = ''; // Clear previous renders

      this.renders.forEach((renderInstance) => {
        try {
          const renderElement = renderInstance.generateRenderUI();
          rendersContainer.appendChild(renderElement);
        } catch (error) {
          console.error('Error generating render UI:', error);
        }
      });
    }

    return orderElement;
  }
}

export default Order;
