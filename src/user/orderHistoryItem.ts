class OrderItem {
  private orderDetails: string;
  private itemDomElement: HTMLElement;

  constructor(orderDetails: string, itemDomElement: HTMLElement) {
    this.orderDetails = orderDetails;
    this.itemDomElement = itemDomElement;

    this.handleInvoiceDownload();
    // this.modalHandler();
    this.goToOrderDetails();
  }

  public getOrderDetails(): string {
    return this.orderDetails;
  }

  public setOrderDetails(orderDetails: string): void {
    this.orderDetails = orderDetails;
  }

  public getItemDomElement(): HTMLElement {
    return this.itemDomElement;
  }

  public setItemDomElement(itemDomElement: HTMLElement): void {
    this.itemDomElement = itemDomElement;
  }

  // private menuButtonHandler(): void {
  //   const menuButton = this.itemDomElement.querySelector('[data-order-item="ph-dropbown-btn"]');
  //   if (!menuButton) return;
  //   const menuNav = menuButton.nextElementSibling;

  //   menuButton.addEventListener('click', () => {
  //     menuButton.classList.toggle('w--open');
  //     //   menuButton.setAttribute('aria-expanded', menuButton.classList.contains('w--open').toString());
  //     //toggle z index of the parrent to 9999 to make sure it is on top of everything
  //     menuButton.parentElement.style.zIndex =
  //       menuButton.parentElement.style.zIndex === '9999' ? '1' : '9999';
  //     menuNav.classList.toggle('w--open');
  //   });

  //   // click outside the dropdown to close it
  //   document.addEventListener('click', (event) => {
  //     if (menuNav.classList.contains('w--open') && !menuButton.contains(event.target as Node)) {
  //       menuButton.classList.remove('w--open');
  //       menuNav.classList.remove('w--open');
  //       menuButton.parentElement.style.zIndex = '1';
  //     }
  //   });
  // }

  private handleInvoiceDownload(): void {
    // debugger;
    const invoiceButton = this.itemDomElement.querySelector(
      '[order-history-item="invoice-download"]'
    );
    if (!invoiceButton) return;

    invoiceButton.href = this.orderDetails.fieldData['invoice-link'].url;
    invoiceButton.target = '_blank';
  }

  private goToOrderDetails(): void {
    const orderDetailsButton = this.itemDomElement.querySelectorAll(
      '[data-order-item="ph-order-details"]'
    );

    const orderID = '07abe1fd-4015-4890-8299-1da02fa50c4f';
    orderDetailsButton.forEach((button) => {
      button.addEventListener('click', () => {
        window.location =
          window.location.origin + `/${orderID}/${this.orderDetails.fieldData.slug}`;
      });
    });
  }

  private modalHandler(): void {
    const modal = this.itemDomElement.querySelector('.modal');
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      modal.classList.toggle('hide');
    });
  }

  public removeItem(): void {
    this.itemDomElement.remove();
  }
}

export default OrderItem;
