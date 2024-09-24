import RenderDetails from './cartRenderDetails';

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

export default Render;
