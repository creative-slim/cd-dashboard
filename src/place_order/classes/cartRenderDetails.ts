class RenderDetails {
  detailData: any;
  prices: any;
  renderDetailsTemplate: HTMLElement | null;
  renderType: { renderType: string; price: any };
  alreadyPayedWoodtypesSet: Set<string>;
  onDelete: (detailId: string) => void;
  onDataChange: () => void;

  constructor(
    detailData: any,
    prices: any,
    renderDetailsTemplate: HTMLElement | null,
    renderType: { renderType: string; price: any },
    alreadyPayedWoodtypesSet: Set<string>,
    onDelete: (detailId: string) => void,
    onDataChange: () => void
  ) {
    this.detailData = detailData;
    this.prices = prices;
    this.renderDetailsTemplate = renderDetailsTemplate;
    this.renderType = renderType;
    this.alreadyPayedWoodtypesSet = alreadyPayedWoodtypesSet;
    this.onDelete = onDelete;
    this.onDataChange = onDataChange;
  }

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

  getDetailCount(): number {
    return parseInt(this.detailData.inputs['render-count']) || 0;
  }

  getWoodPrice(): number {
    const rawWoodType = this.detailData.inputs['woodtype'];
    const normalizedWoodType = rawWoodType.trim().toLowerCase();

    if (this.alreadyPayedWoodtypesSet.has(normalizedWoodType)) {
      return 0;
    }

    return parseInt(this.prices.woodtype.generic) || 0;
  }

  calculateDetailPrice(): number {
    const woodPrice = this.getWoodPrice();
    const detailCount = this.getDetailCount();
    return woodPrice + this.renderType.price.render * detailCount;
  }

  generateDetailUI(): HTMLElement {
    if (!this.renderDetailsTemplate) {
      throw new Error('Render details template not found.');
    }
    const woodtypeRaw = this.detailData.inputs['woodtype'];
    const woodtypeNormalized = woodtypeRaw.trim().toLowerCase();

    const woodPrice = this.getWoodPrice();

    if (woodPrice > 0) {
      this.alreadyPayedWoodtypesSet.add(woodtypeNormalized);
    }

    const detailElement = this.renderDetailsTemplate.cloneNode(true) as HTMLElement;
    detailElement.classList.add('cart_order-render');
    detailElement.style.display = 'flex';

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
      priceElement.textContent = `${this.calculateDetailPrice()}`;
    }

    const requestCommentElement = detailElement.querySelector(
      '[data-order-cart="request-comment"]'
    );
    if (requestCommentElement) {
      requestCommentElement.textContent = this.detailData.inputs['render-details-comment'] || '--';
    }
    const deleteButton = document.querySelector('[data-action="delete-render-detail"]');
    console.log('deleteButton', deleteButton);
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.onDelete(this.detailData.id);
      });
    }

    return detailElement;
  }
}

export default RenderDetails;
