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

  document.querySelector("[data-invoice='download']").addEventListener('click', async () => {
    // await generatePDF(pdfwrapper);
    getInvoicePDF(pdfwrapper).then((pdf) => {
      // const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice.pdf';
      a.click();
    });
  });
}

async function generatePDF(pdfwrapper) {
  const opt = {
    // margin: 0,
    filename: 'invoice.pdf',
    // image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      width: 1050, //1050
      useCORS: true,
      scale: 2,
    },

    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  const worker = html2pdf().set(opt).from(pdfwrapper).save();
  return worker;
}

async function getInvoicePDF(pdfwrapper) {
  const opt = {
    // margin: 0,
    filename: 'invoice.pdf',
    // image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      width: 1050, //1050
      useCORS: true,
      scale: 2,
    },

    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  const worker = await html2pdf()
    .set(opt)
    .from(pdfwrapper)
    .outputPdf('blob')
    .then((pdf) => {
      return pdf;
    });

  console.log('worker', worker);
  return worker;
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
    const contactPerson = wrapperElement.querySelectorAll('[data-invoice=contact-person]');
    contactPerson.forEach((e) => {
      e.innerHTML = data['contact-person'];
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

  // setup title
  item.querySelector("[invoice-item-template='title']").innerHTML = `${data['furniture-name']}
    <br><small>order n°:  ${data['order-id']}</small>
    <br><small>dimensions : H. ${data['furniture-dimension-h']}mm  W.${data['furniture-dimension-w']}mm  L.${data['furniture-dimension-l']}mm</small>
    <br><small>Matetial : ${data['color-finish']}</small> <br><small>${data['dimensions-comment']}</small>
    <br><small>${data['specialfunction']}</small>`;

  // setup quantity
  item.querySelector("[invoice-item-template='quantity']").innerHTML = '1';

  // setup price
  item.querySelector("[invoice-item-template='price']").innerHTML = 'package';

  // setup total
  item.querySelector("[invoice-item-template='total']").innerHTML =
    '€ ' + paymentDetails.packagePrice.unit_amount.value;

  wrapper.appendChild(item);
  generateAdditionalImages(data, paymentDetails, itemTemplate, item);
}

function generateAdditionalImages(data, paymentDetails, itemTemplate, siblingElement) {
  const additionalImageData = JSON.parse(data['additional-images-data']);
  paymentDetails.additionalImagesArray.forEach((imageData, index) => {
    const { renderType, material, quantity, price, unit_price } = imageData;
    const item = itemTemplate.cloneNode(true);

    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${renderType} - ${material} `;
    item.querySelector("[invoice-item-template='quantity']").innerHTML = `${quantity}`;
    //! price
    item.querySelector("[invoice-item-template='price']").innerHTML = `€ ${unit_price}`;
    //! total
    item.querySelector("[invoice-item-template='total']").innerHTML = `€ ${price}`;
    item.style.display = 'grid';

    //invoice-item-template="index"
    item.querySelector("[invoice-item-template='index']").innerHTML = index + 2;

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
