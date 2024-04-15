/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import html2pdf from 'html2pdf.js';

export function generateInvoice(finalData) {
  const invoice = document.querySelector<HTMLElement>('#pdf-wrapper');
  // const pdfwrapper = invoice.cloneNode(true);
  const pdfwrapper = invoice;
  pdfwrapper.style.display = 'block';
  const itemTemplate = pdfwrapper.querySelector('[data-invoice=invoice-item-template]');
  itemTemplate.style.display = 'none';
  const table = pdfwrapper.querySelector('[data-invoice=table]');

  const client = {};

  const getPaymentDetails = () => {
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));
    if (!paymentDetails) {
      console.error('Payment details not found');
      return {};
    }
    return paymentDetails;
  };

  const paymentDetails = getPaymentDetails();

  const clientElement = document.getElementById('user-data');

  // load invoice data
  // getInvoiceData().then((invoiceData) => {
  //   fillInvoiceData(pdfwrapper, invoiceData);
  // });

  fillInvoiceData(paymentDetails, itemTemplate, pdfwrapper, finalData, table);

  const opt = {
    // margin: 0,
    filename: 'invoice.pdf',
    // image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      //   dpi: 192,
      //   letterRendering: true,
      width: 1050,
      useCORS: true,
    },

    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };
  const final = html2pdf().set(opt).from(pdfwrapper);
  // final.save();
  console.log('🚀 ~ generateInvoice ~ final', final);
}

function getInvoiceData(FinalData) {
  return new Promise((resolve, reject) => {
    try {
      const invoiceData = {};
      const invoiceElement = document.getElementById('user-data');

      if (!invoiceElement) {
        console.error('Invoice element not found');
        resolve(invoiceData); // Resolve with empty data to proceed with the next part
        return;
      }

      invoiceElement.querySelectorAll('[data-invoice]').forEach((e) => {
        invoiceData[e.getAttribute('data-invoice')] = e.innerHTML;
      });

      resolve(invoiceData);
    } catch (error) {
      console.error('Error in getInvoiceData:', error);
      resolve({}); // Resolve with empty data to proceed with the next part
    }
  });
}

function fillInvoiceData(paymentDetails, itemTemplate, wrapperElement, data, table) {
  try {
    const currentDate = new Date();
    if (!wrapperElement) {
      console.error('Wrapper element not found');
      return; // Skip to the next part without throwing an error
    }
    generateInvoiceItem(paymentDetails, itemTemplate, data, table);

    const totalElement = wrapperElement.querySelectorAll('[data-invoice=total]');
    totalElement.forEach((e) => {
      e.innerHTML = '€ ' + paymentDetails.totalAmount;
    });

    const dateElement = wrapperElement.querySelectorAll('[data-invoice=date]');
    dateElement.forEach((e) => {
      e.innerHTML = currentDate.toLocaleDateString();
    });

    const invoiceElement = wrapperElement.querySelectorAll('[data-invoice=invoice-number]');
    invoiceElement.forEach((e) => {
      e.innerHTML = data['order-id'];
    });

    const invoiceTax = wrapperElement.querySelectorAll('[data-invoice=total-tax]');
    invoiceTax.forEach((e) => {
      e.innerHTML = '€ ' + (paymentDetails.totalAmount * 0.19).toFixed(2);
    });

    const invoiceSubtotal = wrapperElement.querySelectorAll('[data-invoice=subtotal]');
    invoiceSubtotal.forEach((e) => {
      e.innerHTML = '€ ' + (paymentDetails.totalAmount * 0.81).toFixed(2);
    });
    // customer-reference
    const customerReference = wrapperElement.querySelectorAll('[data-invoice=client-refrence]');
    customerReference.forEach((e) => {
      e.innerHTML = data['customer-reference'];
    });

    // order-delivery-date
    const orderDeliveryDate = wrapperElement.querySelectorAll('[data-invoice=order-delivery-date]');
    orderDeliveryDate.forEach((e) => {
      e.innerHTML = `${formatDate(currentDate)}-${formatDate(addDays(currentDate, 7))}`;
    });

    if (data.payment === 'PayPal') {
      const paymentMethod = wrapperElement.querySelectorAll('[data-invoice=payment-date]');
      paymentMethod.forEach((e) => {
        e.innerHTML = formatDate(currentDate);
      });
    } else {
      const paymentMethod = wrapperElement.querySelectorAll('[data-invoice=payment-date]');
      paymentMethod.forEach((e) => {
        e.innerHTML = 'NOT PAID';
      });
    }
  } catch (error) {
    console.error('Error in fillInvoiceData:', error);
    // Log the error but proceed to the next part
  }
}

// wrapper is data-invoice=invoice-item-template
export function generateInvoiceItem(paymentDetails, itemTemplate, data, wrapper) {
  const item = itemTemplate.cloneNode(true);
  item.removeAttribute('data-invoice');
  item.style.display = 'grid';

  console.log('🚀 ~ generateInvoiceItem ~ data', data);

  // setup title
  item.querySelector("[invoice-item-template='title']").innerHTML =
    `${data['furniture-name']}<br><small>${data['furniture-dimension-h']}-${data['furniture-dimension-w']}-${data['furniture-dimension-l']}</small><br><small>Matetial : ${data['color-finish']}</small> <br><small>${data['specialfunction']}</small><br><small>${data['dimensions-comment']}</small>`;

  // setup quantity
  item.querySelector("[invoice-item-template='quantity']").innerHTML = '1';

  // setup price
  item.querySelector("[invoice-item-template='price']").innerHTML = 'package';

  // setup total
  item.querySelector("[invoice-item-template='total']").innerHTML =
    '€ ' + paymentDetails.totalAmount;

  console.log('🚀 ~ generateInvoiceItem ~ item', wrapper, item);
  wrapper.appendChild(item);
  generateAdditionalImages(data, paymentDetails, itemTemplate, item);
}

function generateAdditionalImages(data, paymentDetails, itemTemplate, siblingElement) {
  const additionalImageData = JSON.parse(data['additional-images-data']);
  paymentDetails.additionalImagesArray.forEach((imageData) => {
    const { renderType, material, quantity, price, unit_price } = imageData;
    const item = itemTemplate.cloneNode(true);

    console.log('inside generateAdditionalImages', { paymentDetails });
    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${quantity} x ${renderType} - ${material} `;
    item.querySelector("[invoice-item-template='quantity']").innerHTML = `${quantity}`;
    //! price
    item.querySelector("[invoice-item-template='price']").innerHTML = `€ ${unit_price}`;
    //! total
    item.querySelector("[invoice-item-template='total']").innerHTML = `€ ${price}`;
    item.style.display = 'grid';
    console.log(siblingElement.parentNode);

    siblingElement.parentNode.appendChild(item);
  });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
