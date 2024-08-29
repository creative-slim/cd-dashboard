/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import html2pdf from 'html2pdf.js';
import Cookie from 'js-cookie';
const PRESPECTIVE_PRICE_CONSTANT = 85;

export async function generateInvoice(finalData) {
  const invoice = document.querySelector<HTMLElement>('#pdf-wrapper');
  const pdfwrapper = invoice.cloneNode(true);
  console.log('------------- inside generateInvoice ------------- ');
  console.log({ finalData });
  // const pdfwrapper = invoice;
  pdfwrapper.style.display = 'block';
  const itemTemplate = pdfwrapper.querySelector('[data-invoice=invoice-item-template]');
  itemTemplate.style.display = 'none';
  const table = pdfwrapper.querySelector('[data-invoice=table]');

  const client = {};

  // find payment details inside finalData
  const payment = finalData.finalData.combinedArrays.find(
    (item) => item.paymentDetails
  ).paymentDetails; //finalData.finalData.combinedArrays[4]
  console.log({ payment });
  const paymentDetails = {
    totalAmount: payment.order.total,
  };
  const { orderItems } = payment.order;

  const orderData = {
    'order-id': finalData.finalData.finalCMSresponse.response[0].fieldData['order-id'], //finalData.finalData.finalCMSresponse.response[0].fieldData["order-id"]
  };

  console.log({ payment, paymentDetails, orderItems, orderData });

  // still need order ID

  // load invoice data
  // getInvoiceData().then((invoiceData) => {
  //   fillInvoiceData(pdfwrapper, invoiceData);
  // });

  fillInvoiceData(
    paymentDetails,
    itemTemplate,
    pdfwrapper,
    { payment, paymentDetails, orderItems, orderData },
    table
  );

  // document.querySelector("[data-invoice='download']").addEventListener('click', async () => {
  document.querySelector('#invoice-download-btn')?.addEventListener('click', async () => {
    // await generatePDF(pdfwrapper);
    getInvoicePDF(pdfwrapper, orderData['order-id']).then((pdf) => {
      // const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice ${orderData['order-id']}.pdf`;
      a.click();
      console.log('PDF downloaded');
    });
  });

  const pdfFile = await getInvoicePDF(pdfwrapper, orderData['order-id']);

  //!testing
  const url = URL.createObjectURL(pdfFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice ${orderData['order-id']}.pdf`;
  a.click();
  //!testing

  return pdfFile;
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

async function getInvoicePDF(pdfwrapper, invoiceID) {
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

  const invoicePDFfile = new File([worker], `Invoice_${invoiceID}`, { type: worker.type });

  return invoicePDFfile;
}

function fillInvoiceData(paymentDetails, itemTemplate, wrapperElement, data, table) {
  try {
    const currentDate = new Date();
    if (!wrapperElement) {
      console.error('Wrapper element not found');
      return; // Skip to the next part without throwing an error
    }
    generateInvoiceItem(paymentDetails, itemTemplate, data, table);

    const user = Cookie.get('user');
    const userData = user ? JSON.parse(user) : null;
    if (!userData) {
      console.error('User data not found');
    }

    const userName = wrapperElement.querySelectorAll('[data-invoice=first-name]');
    userName.forEach((e) => {
      e.innerHTML = userData.first_name;
    });
    const company = wrapperElement.querySelectorAll('[data-invoice=company]');
    company.forEach((e) => {
      e.innerHTML = userData.company;
    });

    const userLastName = wrapperElement.querySelectorAll('[data-invoice=last-name]');
    userLastName.forEach((e) => {
      e.innerHTML = userData.last_name;
    });

    const city = wrapperElement.querySelectorAll('[data-invoice=city]');
    city.forEach((e) => {
      e.innerHTML = userData.city;
    });

    const street = wrapperElement.querySelectorAll('[data-invoice=street]');
    street.forEach((e) => {
      e.innerHTML = userData.street;
    });

    const housenumber = wrapperElement.querySelectorAll('[data-invoice=house-number]');
    housenumber.forEach((e) => {
      e.innerHTML = userData.house_number;
    });

    const zip = wrapperElement.querySelectorAll('[data-invoice=zip]');
    zip.forEach((e) => {
      e.innerHTML = userData.zip;
    });

    const ust_idnr = wrapperElement.querySelectorAll('[data-invoice=idnr]');
    ust_idnr.forEach((e) => {
      e.innerHTML = userData.ust_idnr;
    });

    const ref = wrapperElement.querySelectorAll('[data-invoice=ref]');
    ref.forEach((e) => {
      e.innerHTML = userData.id;
    });

    const country = wrapperElement.querySelectorAll('[data-invoice=country]');
    country.forEach((e) => {
      e.innerHTML = userData.country;
    });

    //---------------------

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
      e.innerHTML = data.orderData['order-id'];
    });

    const invoiceTax = wrapperElement.querySelectorAll('[data-invoice=total-tax]');
    invoiceTax.forEach((e) => {
      e.innerHTML = '€ ' + (paymentDetails.totalAmount * 0.19).toFixed(2);
    });

    const invoiceSubtotal = wrapperElement.querySelectorAll('[data-invoice=subtotal]');
    invoiceSubtotal.forEach((e) => {
      e.innerHTML = '€ ' + (paymentDetails.totalAmount * 0.81).toFixed(2);
    });

    // order-delivery-date
    const orderDeliveryDate = wrapperElement.querySelectorAll('[data-invoice=order-delivery-date]');
    orderDeliveryDate.forEach((e) => {
      e.innerHTML = `${formatDate(currentDate)}-${formatDate(addDays(currentDate, 7))}`;
    });

    // if (data.payment === 'PayPal') {
    const paymentMethod = wrapperElement.querySelectorAll('[data-invoice=payment-date]');
    paymentMethod.forEach((e) => {
      e.innerHTML = formatDate(currentDate);
    });
  } catch (error) {
    console.error('Error in fillInvoiceData:', error);
    // Log the error but proceed to the next part
  }
}

// wrapper is data-invoice=invoice-item-template
export function generateInvoiceItem(paymentDetails, itemTemplate, data, wrapper) {
  // const item = itemTemplate.cloneNode(true);
  // item.removeAttribute('data-invoice');
  // item.style.display = 'grid';
  const { orderItems } = data;
  console.log('orderItems ::: ', orderItems);
  orderItems.forEach((orderItem, index) => {
    const item = itemTemplate.cloneNode(true);
    item.removeAttribute('data-invoice');
    item.style.display = 'grid';
    item.style.fontWeight = 'bold';

    item.querySelector("[invoice-item-template='index']").innerHTML = index + 1;
    item.querySelector("[invoice-item-template='title']").innerHTML = orderItem.name;
    item.querySelector("[invoice-item-template='quantity']").innerHTML = orderItem.quantity;
    item.querySelector("[invoice-item-template='price']").innerHTML =
      '€ ' + orderItem.unit_amount.value;
    item.querySelector("[invoice-item-template='total']").innerHTML =
      '€ ' + orderItem.unit_amount.value;
    wrapper.appendChild(item);
    if (orderItem.allRenderPricing) {
      generateAdditionalImages(orderItem.allRenderPricing, paymentDetails, itemTemplate, item);
    }
  });
}

function generateAdditionalImages(data, paymentDetails, itemTemplate, siblingElement) {
  console.log('inside generateAdditionalImages ::: ', data);
  data.forEach((imageData, index) => {
    const item = itemTemplate.cloneNode(true);

    console.log(imageData);
    const thisItemTotalPrice = Object.values(imageData).reduce((acc, cur) => acc + cur, 0);

    const displayIndex = index + 1;

    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${imageData.render === 400 ? displayIndex + ' - Scene' : displayIndex + ' - knockout'} `;
    item.querySelector("[invoice-item-template='quantity']").innerHTML =
      `${imageData.prespectives / PRESPECTIVE_PRICE_CONSTANT}`;
    item.querySelector("[invoice-item-template='price']").innerHTML =
      `€ ${(thisItemTotalPrice / (imageData.prespectives / PRESPECTIVE_PRICE_CONSTANT)).toFixed(2)}`;
    // item.querySelector("[invoice-item-template='total']").innerHTML = `€ ${thisItemTotalPrice}`;
    item.querySelector("[invoice-item-template='total']").innerHTML = ``;

    item.style.display = 'grid';
    item.style.fontSize = '12px'; // reduce item font size
    item.style.marginBottom = '5px'; // reduce space between items
    item.style.paddingTop = '2px'; // reduce padding
    item.style.paddingBottom = '2px'; // reduce padding

    //invoice-item-template="index"
    item.querySelector("[invoice-item-template='index']").innerHTML = '';

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
