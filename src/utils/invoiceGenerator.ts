/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import html2pdf from 'html2pdf.js';
import Cookie from 'js-cookie';

import { mergePaymentDetails } from '../extras/paymentToData';
const PRESPECTIVE_PRICE_CONSTANT = 85;

export async function generateInvoice(finalData) {
  const invoice = document.querySelector<HTMLElement>('#pdf-wrapper');
  const pdfwrapper = invoice.cloneNode(true);
  //console.log('------------- generateInvoice ------------- ');
  //console.log({ finalData });
  const newCombinedArray = mergePaymentDetails(finalData.finalData.combinedArrays);
  finalData.finalData.combinedArrays = newCombinedArray;

  //console.log({ finalData });

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
  //console.log({ payment });
  const paymentDetails = {
    totalAmount: payment.order.total,
  };
  const { orderItems } = payment.order;

  const orderData = {
    'order-id': finalData.finalData.finalCMSresponse.response[0].fieldData['order-id'], //finalData.finalData.finalCMSresponse.response[0].fieldData["order-id"]
  };

  const ordersItemsDetails = finalData.finalData.combinedArrays.filter((item) => item.id);

  //console.log({ payment, paymentDetails, orderItems, orderData });

  // still need order ID

  // load invoice data
  // getInvoiceData().then((invoiceData) => {
  //   fillInvoiceData(pdfwrapper, invoiceData);
  // });

  fillInvoiceData(
    paymentDetails,
    itemTemplate,
    pdfwrapper,
    { payment, paymentDetails, orderItems, orderData, ordersItemsDetails },
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
      //console.log('PDF downloaded');
    });
  });

  const pdfFile = await getInvoicePDF(pdfwrapper, orderData['order-id']);

  //!testing
  // const url = URL.createObjectURL(pdfFile);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = `Invoice ${orderData['order-id']}.pdf`;
  // a.click();
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
      //console.error('Wrapper element not found');
      return; // Skip to the next part without throwing an error
    }
    generateInvoiceItem(paymentDetails, itemTemplate, data, table);

    const user = Cookie.get('user');
    const userData = user ? JSON.parse(user) : null;
    if (!userData) {
      //console.error('User data not found');
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
      e.innerHTML = userData.housenumber;
    });

    const zip = wrapperElement.querySelectorAll('[data-invoice=zip]');
    zip.forEach((e) => {
      e.innerHTML = userData.zip;
    });

    const ust_idnr = wrapperElement.querySelectorAll('[data-invoice="idnr"]');
    if (userData.ust_idnr) {
      ust_idnr.forEach((e) => {
        e.innerHTML = userData.ust_idnr;
      });
    }

    const last8Digits = userData.auth0_id.slice(-10);
    const ref = wrapperElement.querySelectorAll('[data-invoice=client-refrence]');
    ref.forEach((e) => {
      e.innerHTML = last8Digits;
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
      e.innerHTML = getCurrentFormattedDate(currentDate);
    });
    const invoiceDate = wrapperElement.querySelectorAll('[data-invoice=invoice-date]');
    invoiceDate.forEach((e) => {
      e.innerHTML = formatDate(currentDate);
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
    //console.error('Error in fillInvoiceData:', error);
    // Log the error but proceed to the next part
  }
}

// wrapper is data-invoice=invoice-item-template
export function generateInvoiceItem(paymentDetails, itemTemplate, data, wrapper) {
  // const item = itemTemplate.cloneNode(true);
  // item.removeAttribute('data-invoice');
  // item.style.display = 'grid';
  const { orderItems, ordersItemsDetails } = data;
  // //console.log('orderItems ::: ', orderItems);
  //console.log('new orderItems ::: ', ordersItemsDetails);
  ordersItemsDetails.forEach((orderItem, index) => {
    const item = itemTemplate.cloneNode(true);
    item.removeAttribute('data-invoice');
    item.style.display = 'grid';
    item.style.fontWeight = 'bold';

    item.querySelector("[invoice-item-template='index']").innerHTML = index + 1;
    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${orderItem.data[0].render['item-name']} `;
    item.querySelector("[invoice-item-template='details']").style.fontSize = '10px !important';

    item.querySelector("[invoice-item-template='details']").innerHTML =
      `WxHxL :  ${orderItem.data[0].render['item-width']}mm x ${orderItem.data[0].render['item-height']}mm x 
      ${orderItem.data[0].render['item-length']}mm <br>
      Details : ${orderItem.data[0].render['item-details']} <br>
      ${orderItem.data[0].render['Provided-3D-Model'] === 'true' ? 'Provided 3D Model' : 'No 3D Model Provided'}
      <br>
      `;

    item.querySelector("[invoice-item-template='quantity']").innerHTML = 1;
    item.querySelector("[invoice-item-template='price']").innerHTML =
      '€ ' + orderItem.data[0].render['price'];
    item.querySelector("[invoice-item-template='total']").innerHTML =
      // reduce all prices in the array to get the total price
      '€ ' +
      orderItem.data.reduce((acc, cur) => {
        return acc + cur.render['price'];
      }, 0);
    wrapper.appendChild(item);

    generateAdditionalImages(orderItem, paymentDetails, itemTemplate, item);
  });
}

function generateAdditionalImages(itemDetails, paymentDetails, itemTemplate, siblingElement) {
  //console.log('inside generateAdditionalImages ::: ', itemDetails);
  itemDetails.data.forEach((imageData, index) => {
    if (!imageData.render['render-type']) {
      return;
    }
    const item = itemTemplate.cloneNode(true);

    //console.log(imageData);
    const thisItemTotalPrice = Object.values(imageData).reduce((acc, cur) => acc + cur, 0);

    const displayIndex = index + 1;

    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${displayIndex - 1}  -  ${imageData.render['render-type']}  -  ${imageData.render['woodtype']}`;
    item.querySelector("[invoice-item-template='quantity']").innerHTML =
      imageData.render['render-count'];
    item.querySelector("[invoice-item-template='price']").innerHTML =
      `€ ${imageData.render['price']}`;
    // item.querySelector("[invoice-item-template='total']").innerHTML = `€ ${thisItemTotalPrice}`;
    item.querySelector("[invoice-item-template='total']").innerHTML = ``;
    item.querySelector("[invoice-item-template='details']").style.fontSize = '10px !important';

    item.querySelector("[invoice-item-template='details']").innerHTML =
      `${imageData.render['square'] === 'true' ? ' square ' : ''}  ${imageData.render[' portrait '] === 'true' ? 'portrait' : ''}  ${imageData.render['Landscape'] === 'true' ? ' Landscape ' : ''} <br> 
      ${imageData.render['upholstery'] === 'true' ? ' Upholstery' : 'No Upholstery'} <br>
      ${imageData.render['request-comment']}
      `;

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

function getCurrentFormattedDate() {
  const date = new Date();

  // Get the day with leading zero
  const day = String(date.getDate()).padStart(2, '0');

  // Get the month as an uppercase abbreviation
  const months = [
    'JAN',
    'FEB',
    'MÄR',
    'APR',
    'MAI',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OKT',
    'NOV',
    'DEZ',
  ];

  const month = months[date.getMonth()];

  // Get the year
  const year = date.getFullYear();

  // Combine the parts into the desired format
  return `${day} ${month} ${year}`;
}
