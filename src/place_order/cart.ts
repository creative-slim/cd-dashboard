// cart.ts

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
      'item-details',
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

class Render {
  renderData: any;
  prices: any;
  renderTemplate: HTMLElement | null;
  renderDetailsTemplate: HTMLElement | null;
  renderPricing: { renderType: string; price: any };
  alreadyPayedWoodtypesSet: Set<string>; // New property

  constructor(
    renderData: any,
    prices: any,
    renderTemplate: HTMLElement | null,
    renderDetailsTemplate: HTMLElement | null,
    alreadyPayedWoodtypesSet: Set<string> // New parameter
  ) {
    console.log('########## Render class initialized ##########');
    this.renderData = renderData;
    this.prices = prices;
    this.renderTemplate = renderTemplate;
    this.renderDetailsTemplate = renderDetailsTemplate;
    this.renderPricing = {
      renderType: renderData.inputs['render-type'],
      price: prices[renderData.inputs['render-type'] || ''] || { build: 0, render: 0 },
    };
    this.alreadyPayedWoodtypesSet = alreadyPayedWoodtypesSet; // Assign the shared Set
  }

  // Method to validate the render data
  isValid(): boolean {
    const requiredFields = ['render-type'];
    for (const field of requiredFields) {
      if (!this.renderData.inputs[field] || this.renderData.inputs[field].trim() === '') {
        console.error(`Render is missing required field: ${field}`);
        return false;
      }
    }

    if (
      !Array.isArray(this.renderData.orderRenderDetails) ||
      this.renderData.orderRenderDetails.length === 0
    ) {
      console.error('Render must have at least one render detail.');
      return false;
    }

    // Validate each render detail
    for (const [detailIndex, detailData] of this.renderData.orderRenderDetails.entries()) {
      const detail = new RenderDetails(
        detailData,
        this.prices,
        this.renderDetailsTemplate,
        this.renderPricing,
        this.alreadyPayedWoodtypesSet // Pass the shared Set
      );
      if (!detail.isValid()) {
        console.error(`Render detail at index ${detailIndex} is invalid.`);
        return false;
      }
    }

    return true;
  }

  // Method to calculate the price for a render
  calculateRenderPrice(): number {
    if (!this.renderData.inputs['render-type']) {
      return 0;
    }
    if (!this.prices[this.renderData.inputs['render-type']]) {
      return 0;
    }

    let renderBuildPrice = this.renderPricing.price.build || 0;
    const renderPrice = this.renderPricing.price.render || 0;
    console.log('Render price per unit:', renderPrice);
    console.log('Render build price:', renderBuildPrice);

    this.renderData.orderRenderDetails.forEach((renderDetailData: any, index: number) => {
      const detail = new RenderDetails(
        renderDetailData,
        this.prices,
        this.renderDetailsTemplate,
        this.renderPricing,
        this.alreadyPayedWoodtypesSet // Pass the shared Set
      );

      const woodPrice = detail.getWoodPrice();
      console.log(`RenderDetail ID: ${renderDetailData.id}, Wood Price: ${woodPrice}`);

      // If woodPrice > 0, add the normalized wood type to the Set
      if (woodPrice > 0) {
        const woodtypeRaw = renderDetailData.inputs['woodtype'];
        const woodtypeNormalized = woodtypeRaw.trim().toLowerCase();
        this.alreadyPayedWoodtypesSet.add(woodtypeNormalized);
      }

      // Calculate the total price for this detail
      const detailTotalPrice = detail.getDetailCount() * renderPrice + woodPrice;
      console.log(`Detail Total Price: ${detailTotalPrice}`);

      renderBuildPrice += detailTotalPrice;
    });

    return renderBuildPrice;
  }

  getRenderPricing() {
    if (!this.renderPricing.price) {
      return 0;
    }
    return this.renderPricing.price;
  }

  // Method to generate the UI for the render
  generateRenderUI(): HTMLElement {
    if (!this.renderTemplate) {
      throw new Error('Render template not found.');
    }

    // Clone the render template content
    const renderElement = this.renderTemplate.cloneNode(true) as HTMLElement;
    renderElement.style.display = 'block'; // Ensure it's visible

    const renderTypeElement = renderElement.querySelector('[data-order-cart="render-type"]');
    if (renderTypeElement) {
      renderTypeElement.textContent = this.renderData.inputs['render-type'] || '--';
    }
    const priceElement = renderElement.querySelector('[data-order-cart="render-price"]');
    if (priceElement) {
      priceElement.textContent = `${this.getRenderPricing().build || 0}`;
    }

    // Handle render details
    const renderDetailsContainer = renderElement.querySelector(
      '[order-cart="render-details-wrapper"]'
    );
    if (renderDetailsContainer) {
      renderDetailsContainer.innerHTML = ''; // Clear previous details

      this.renderData.orderRenderDetails.forEach((renderDetailData: any) => {
        try {
          const detail = new RenderDetails(
            renderDetailData,
            this.prices,
            this.renderDetailsTemplate,
            this.renderPricing,
            this.alreadyPayedWoodtypesSet // Pass the shared Set
          );
          const detailElement = detail.generateDetailUI();
          detailElement.style.display = 'flex';
          renderDetailsContainer.appendChild(detailElement);
        } catch (error) {
          console.error('Error generating render detail UI:', error);
        }
      });
    }

    return renderElement;
  }
}

class RenderDetails {
  detailData: any;
  prices: any;
  renderDetailsTemplate: HTMLElement | null;
  renderType: { renderType: string; price: any };
  alreadyPayedWoodtypesSet: Set<string>; // New property

  constructor(
    detailData: any,
    prices: any,
    renderDetailsTemplate: HTMLElement | null,
    renderType: { renderType: string; price: any },
    alreadyPayedWoodtypesSet: Set<string> // New parameter
  ) {
    this.detailData = detailData;
    this.prices = prices;
    this.renderDetailsTemplate = renderDetailsTemplate;
    this.renderType = renderType;
    this.alreadyPayedWoodtypesSet = alreadyPayedWoodtypesSet; // Assign the shared Set
  }

  // Method to validate the render detail data
  isValid(): boolean {
    const requiredFields = ['render-count', 'woodtype'];
    for (const field of requiredFields) {
      if (!this.detailData.inputs[field] || this.detailData.inputs[field].trim() === '') {
        console.error(`Render detail is missing required field: ${field}`);
        return false;
      }
    }
    return true;
  }

  // Get amount of render details
  getDetailCount(): number {
    return parseInt(this.detailData.inputs['render-count']) || 0;
  }

  getWoodPrice(): number {
    debugger;
    const rawWoodType = this.detailData.inputs['woodtype'];
    const normalizedWoodType = rawWoodType.trim().toLowerCase(); // Normalize the wood type

    if (this.alreadyPayedWoodtypesSet.has(normalizedWoodType)) {
      return 0;
    }

    return parseInt(this.prices.woodtype.generic) || 0;
  }

  // Method to calculate the price for render details (e.g., wood type)
  calculateDetailPrice(): number {
    const woodPrice = this.getWoodPrice();
    const detailCount = this.getDetailCount();
    console.log('Wood price:', woodPrice);
    console.log('Detail count:', detailCount);
    console.log('Detail total price:', woodPrice + this.renderType.price.render * detailCount);
    return woodPrice + this.renderType.price.render * detailCount;
  }

  // Method to generate the UI for render details
  generateDetailUI(): HTMLElement {
    if (!this.renderDetailsTemplate) {
      throw new Error('Render details template not found.');
    }
    const woodtypeRaw = this.detailData.inputs['woodtype'];
    const woodtypeNormalized = woodtypeRaw.trim().toLowerCase();

    // Determine wood price before updating the Set
    const woodPrice = this.getWoodPrice();

    // Update the Set if the wood type is being charged
    if (woodPrice > 0) {
      this.alreadyPayedWoodtypesSet.add(woodtypeNormalized);
    }
    // Clone the render details template content
    const detailElement = this.renderDetailsTemplate.cloneNode(true) as HTMLElement;
    detailElement.classList.add('cart_order-render');
    detailElement.style.display = 'flex'; // Ensure it's displayed correctly

    const woodtypeElement = detailElement.querySelector('[data-order-cart="woodtype"]');
    if (woodtypeElement) {
      woodtypeElement.textContent = this.detailData.inputs['woodtype'] || '--';
    }

    const renderCountElement = detailElement.querySelector('[data-order-cart="render-count"]');
    if (renderCountElement) {
      renderCountElement.textContent = this.detailData.inputs['render-count'] || '--';
    }

    const landscapeElement = detailElement.querySelector('[data-order-cart="landscape"]');
    if (landscapeElement) {
      landscapeElement.textContent = this.detailData.inputs['aspect-ratio'] || '--';
    }

    const otherMaterialElement = detailElement.querySelector('[data-order-cart="other-material"]');
    if (otherMaterialElement) {
      otherMaterialElement.textContent = this.detailData.inputs['upholstry-material'] || '--';
    }

    const priceElement = detailElement.querySelector('[data-order-cart="price"]');
    if (priceElement) {
      priceElement.textContent = `${woodPrice + this.renderType.price.render * this.getDetailCount()}`;
    }

    const requestCommentElement = detailElement.querySelector(
      '[data-order-cart="request-comment"]'
    );
    if (requestCommentElement) {
      requestCommentElement.textContent = this.detailData.inputs['render-details-comment'] || '--';
    }

    return detailElement;
  }
}
