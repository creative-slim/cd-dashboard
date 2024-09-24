import RenderDetails from './cartRenderDetails';

class Render {
  renderData: any;
  prices: any;
  renderTemplate: HTMLElement | null;
  renderDetailsTemplate: HTMLElement | null;
  renderPricing: { renderType: string; price: any };
  alreadyPayedWoodtypesSet: Set<string>;
  onDelete: (renderId: string) => void;
  onDataChange: () => void;
  renderDetails: RenderDetails[];
  renderElement: HTMLElement | null;

  constructor(
    renderData: any,
    prices: any,
    renderTemplate: HTMLElement | null,
    renderDetailsTemplate: HTMLElement | null,
    alreadyPayedWoodtypesSet: Set<string>,
    onDelete: (renderId: string) => void,
    onDataChange: () => void
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
    this.alreadyPayedWoodtypesSet = alreadyPayedWoodtypesSet;
    this.onDelete = onDelete;
    this.onDataChange = onDataChange;
    this.renderElement = null;
    this.renderDetails = this.initializeRenderDetails();
  }

  initializeRenderDetails(): RenderDetails[] {
    if (!Array.isArray(this.renderData.orderRenderDetails)) {
      return [];
    }

    return this.renderData.orderRenderDetails.map(
      (renderDetailData: any) =>
        new RenderDetails(
          renderDetailData,
          this.prices,
          this.renderDetailsTemplate,
          this.renderPricing,
          this.alreadyPayedWoodtypesSet,
          (detailId: string) => this.deleteRenderDetail(detailId),
          () => this.handleDataChange()
        )
    );
  }

  deleteRenderDetail(detailId: string) {
    this.renderDetails = this.renderDetails.filter((detail) => detail.detailData.id !== detailId);
    this.renderData.orderRenderDetails = this.renderDetails.map((detail) => detail.detailData);

    // Notify Order of the data change
    this.onDataChange();

    // Re-render the render UI
    if (this.renderElement && this.renderElement.parentElement) {
      const newRenderElement = this.generateRenderUI();
      this.renderElement.parentElement.replaceChild(newRenderElement, this.renderElement);
      this.renderElement = newRenderElement;
    }
  }

  handleDataChange() {
    // Update renderData based on current render details
    this.renderData.orderRenderDetails = this.renderDetails.map((detail) => detail.detailData);

    // Notify parent of data change
    this.onDataChange();
  }

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

    for (const [detailIndex, detailInstance] of this.renderDetails.entries()) {
      if (!detailInstance.isValid()) {
        console.error(`Render detail at index ${detailIndex} is invalid.`);
        return false;
      }
    }

    return true;
  }

  calculateRenderPrice(): number {
    if (!this.renderData.inputs['render-type']) {
      return 0;
    }
    if (!this.prices[this.renderData.inputs['render-type']]) {
      return 0;
    }

    let renderBuildPrice = this.renderPricing.price.build || 0;
    const renderPrice = this.renderPricing.price.render || 0;

    this.renderDetails.forEach((detailInstance) => {
      const woodPrice = detailInstance.getWoodPrice();

      const detailTotalPrice = detailInstance.getDetailCount() * renderPrice + woodPrice;

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

  generateRenderUI(): HTMLElement {
    if (!this.renderTemplate) {
      throw new Error('Render template not found.');
    }

    const renderElement = this.renderTemplate.cloneNode(true) as HTMLElement;
    renderElement.style.display = 'block';

    const renderTypeElement = renderElement.querySelector('[data-order-cart="render-type"]');
    if (renderTypeElement) {
      renderTypeElement.textContent = this.renderData.inputs['render-type'] || '--';
    }
    const priceElement = renderElement.querySelector('[data-order-cart="render-price"]');
    if (priceElement) {
      priceElement.textContent = `${this.getRenderPricing().build || 0}`;
    }

    const renderDetailsContainer = renderElement.querySelector(
      '[order-cart="render-details-wrapper"]'
    );
    if (renderDetailsContainer) {
      renderDetailsContainer.innerHTML = '';

      this.renderDetails.forEach((detailInstance) => {
        try {
          const detailElement = detailInstance.generateDetailUI();
          detailElement.style.display = 'flex';
          renderDetailsContainer.appendChild(detailElement);
        } catch (error) {
          console.error('Error generating render detail UI:', error);
        }
      });
    }

    const deleteButton = renderElement.querySelector('[data-action="delete-render"]');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.onDelete(this.renderData.id);
      });
    }

    this.renderElement = renderElement;

    return renderElement;
  }
}

export default Render;
