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
    // debugger;
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

export default RenderDetails;
