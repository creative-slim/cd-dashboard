import Render from './cartRender';

class Order {
  orderData: any;
  prices: any;
  orderTemplate: HTMLElement | null;
  renderTemplate: HTMLElement | null;
  renderDetailsTemplate: HTMLElement | null;
  renders: Render[];
  alreadyPayedWoodtypesSet: Set<string>;
  onDelete: (orderId: string) => void;
  onDataChange: () => void;
  orderElement: HTMLElement | null;

  constructor(
    orderData: any,
    prices: any,
    orderTemplate: HTMLElement | null,
    renderTemplate: HTMLElement | null,
    renderDetailsTemplate: HTMLElement | null,
    onDelete: (orderId: string) => void,
    onDataChange: () => void
  ) {
    this.orderData = orderData;
    this.prices = prices;
    this.orderTemplate = orderTemplate;
    this.renderTemplate = renderTemplate;
    this.renderDetailsTemplate = renderDetailsTemplate;
    this.alreadyPayedWoodtypesSet = new Set<string>();
    this.onDelete = onDelete;
    this.onDataChange = onDataChange;
    this.orderElement = null;
    this.renders = this.initializeRenders();
  }

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
          this.alreadyPayedWoodtypesSet,
          (renderId: string) => this.deleteRender(renderId),
          () => this.handleDataChange()
        )
    );
  }

  deleteRender(renderId: string) {
    this.renders = this.renders.filter((render) => render.renderData.id !== renderId);
    this.orderData.orderRenders = this.renders.map((render) => render.renderData);

    // Notify CartUI of the data change
    this.onDataChange();

    // Re-render the order UI
    if (this.orderElement && this.orderElement.parentElement) {
      const newOrderElement = this.generateOrderUI();
      this.orderElement.parentElement.replaceChild(newOrderElement, this.orderElement);
      this.orderElement = newOrderElement;
    }
  }

  handleDataChange() {
    // Update orderData based on current renders
    this.orderData.orderRenders = this.renders.map((render) => render.renderData);

    // Notify parent of data change
    this.onDataChange();
  }

  isValid(): boolean {
    const requiredFields = ['item-name', 'item-width', 'item-height', 'item-length'];
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

    for (const [renderIndex, renderInstance] of this.renders.entries()) {
      if (!renderInstance.isValid()) {
        console.error(`Render at index ${renderIndex} in order is invalid.`);
        return false;
      }
    }

    return true;
  }

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

  generateOrderUI(): HTMLElement {
    if (!this.orderTemplate) {
      throw new Error('Order template not found.');
    }

    const orderElement = this.orderTemplate.cloneNode(true) as HTMLElement;

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

    const prices = this.calculatePrice();
    const subTotalElement = orderElement.querySelector('[data-order-cart="sub-total"]');
    if (subTotalElement) {
      subTotalElement.textContent = `${prices.total}`;
    }
    const priceElement = orderElement.querySelector('[data-order-cart="price"]');
    if (priceElement) {
      priceElement.textContent = `${prices.base}`;
    }

    // The total price is updated by CartUI

    const rendersContainer = orderElement.querySelector('[data-order-cart="list"]');
    if (rendersContainer) {
      rendersContainer.innerHTML = '';

      this.renders.forEach((renderInstance) => {
        try {
          const renderElement = renderInstance.generateRenderUI();
          rendersContainer.appendChild(renderElement);
        } catch (error) {
          console.error('Error generating render UI:', error);
        }
      });
    }

    const deleteButton = orderElement.querySelector('[data-action="delete-order"]');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.onDelete(this.orderData.id);
      });
    }

    this.orderElement = orderElement;

    return orderElement;
  }
}

export default Order;
