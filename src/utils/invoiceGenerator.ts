/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import html2pdf from 'html2pdf.js';
import Cookie from 'js-cookie';

import { mergePaymentDetails } from '../extras/paymentToData';
const PRESPECTIVE_PRICE_CONSTANT = 85;

export async function generateInvoice(finalData) {
  const invoice = document.querySelector<HTMLElement>('#pdf-wrapper');
  const pdfwrapper = invoice.cloneNode(true);
  console.log('------------- generateInvoice ------------- ');
  // console.log({ finalData });
  // const newCombinedArray = mergePaymentDetails(finalData.combinedArrays);
  // finalData.finalData.combinedArrays = newCombinedArray;

  console.log({ finalData });

  // const pdfwrapper = invoice;
  pdfwrapper.style.display = 'block';
  const itemTemplate = pdfwrapper.querySelector('[data-invoice=invoice-item-template]');
  itemTemplate.style.display = 'none';
  const table = pdfwrapper.querySelector('[data-invoice=table]');

  const client = {};

  // find payment details inside finalData
  const payment = finalData.combinedArrays.paymentDetails;
  // console.log({ payment });
  const paymentDetails = {
    totalAmount: payment.order.total,
  };
  const { orderItems } = payment.order;

  const orderData = {
    'order-id': finalData.paymentDetails.order.orderID, //finalData.finalData.finalCMSresponse.response[0].fieldData["order-id"]
  };

  const ordersItemsDetailsWithPricing = payment.order.orderItemsListWithPricing;

  // console.log('orderItems ::: ', orderItems);
  // console.log('ordersItemsDetailsWithPricing ::: ', ordersItemsDetailsWithPricing); // new orderItems
  // console.log('orderData ::: ', orderData);

  // console.log({ payment, paymentDetails, orderItems, orderData });

  // still need order ID

  // load invoice data
  // getInvoiceData().then((invoiceData) => {
  //   fillInvoiceData(pdfwrapper, invoiceData);
  // });

  fillInvoiceData(
    paymentDetails,
    itemTemplate,
    pdfwrapper,
    { payment, paymentDetails, orderItems, orderData, ordersItemsDetailsWithPricing },
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
      // console.log('PDF downloaded');
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
      e.innerHTML = userData?.first_name || '';
    });
    const company = wrapperElement.querySelectorAll('[data-invoice=company]');
    company.forEach((e) => {
      e.innerHTML = userData?.company || '';
    });

    const userLastName = wrapperElement.querySelectorAll('[data-invoice=last-name]');
    userLastName.forEach((e) => {
      e.innerHTML = userData?.last_name || '';
    });
    const city = wrapperElement.querySelectorAll('[data-invoice=city]');
    city.forEach((e) => {
      e.innerHTML = userData?.city || '';
    });

    const street = wrapperElement.querySelectorAll('[data-invoice=street]');
    street.forEach((e) => {
      e.innerHTML = userData?.street || '';
    });

    const housenumber = wrapperElement.querySelectorAll('[data-invoice=house-number]');
    housenumber.forEach((e) => {
      e.innerHTML = userData?.housenumber || '';
    });

    const zip = wrapperElement.querySelectorAll('[data-invoice=zip]');
    zip.forEach((e) => {
      e.innerHTML = userData?.zip || '';
    });

    const ust_idnr = wrapperElement.querySelectorAll('[data-invoice="idnr"]');
    ust_idnr.forEach((e) => {
      e.innerHTML = userData?.ust_idnr || '';
    });

    const last8Digits = userData?.auth0_id?.slice(-10) || '';
    const ref = wrapperElement.querySelectorAll('[data-invoice=client-refrence]');
    ref.forEach((e) => {
      e.innerHTML = last8Digits;
    });

    const country = wrapperElement.querySelectorAll('[data-invoice=country]');
    country.forEach((e) => {
      e.innerHTML = userData?.country || '';
    });

    //---------------------

    const totalElement = wrapperElement.querySelectorAll('[data-invoice=total]');
    totalElement.forEach((e) => {
      e.innerHTML = '€ ' + (paymentDetails?.totalAmount || 0);
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
      e.innerHTML = data?.orderData['order-id'] || '';
    });

    const invoiceTax = wrapperElement.querySelectorAll('[data-invoice=total-tax]');
    invoiceTax.forEach((e) => {
      e.innerHTML = '€ ' + ((paymentDetails?.totalAmount || 0) * 0.19).toFixed(2);
    });

    const invoiceSubtotal = wrapperElement.querySelectorAll('[data-invoice=subtotal]');
    invoiceSubtotal.forEach((e) => {
      e.innerHTML = '€ ' + ((paymentDetails?.totalAmount || 0) * 0.81).toFixed(2);
    });

    const orderDeliveryDate = wrapperElement.querySelectorAll('[data-invoice=order-delivery-date]');
    orderDeliveryDate.forEach((e) => {
      e.innerHTML = `${formatDate(currentDate)}-${formatDate(addDays(currentDate, 7))}`;
    });

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
  const { orderItems, ordersItemsDetailsWithPricing } = data;
  // console.log('orderItems ::: ', orderItems);
  // console.log('new orderItems ::: ', ordersItemsDetailsWithPricing);
  ordersItemsDetailsWithPricing.forEach((orderItem, index) => {
    const item = itemTemplate.cloneNode(true);
    item.removeAttribute('data-invoice');
    item.style.display = 'grid';
    item.style.fontWeight = 'bold';
    console.log('orderItem ::: inside new order ITem', orderItem);
    item.querySelector("[invoice-item-template='index']").innerHTML = index + 1;
    item.querySelector("[invoice-item-template='title']").innerHTML =
      `${orderItem.data.inputs['item-name']} `;
    item.querySelector("[invoice-item-template='details']").style.fontSize = '10px !important';

    item.querySelector("[invoice-item-template='details']").innerHTML =
      `WxHxL :  ${orderItem.data.inputs['item-width']}mm x ${orderItem.data.inputs['item-height']}mm x 
      ${orderItem.data.inputs['item-length']}mm <br>
      Details : ${orderItem.data.inputs['item-details']} <br>
      ${orderItem.data.inputs['three-d-modelling'] === 'provide' ? 'Provided 3D Model' : 'No 3D Model Provided'}
      <br>
      `;

    item.querySelector("[invoice-item-template='quantity']").innerHTML = 1;
    item.querySelector("[invoice-item-template='price']").innerHTML =
      '€ ' + orderItem.renderWithPrice[0].initialFee; //! FIX THIS PRICE
    item.querySelector("[invoice-item-template='total']").innerHTML =
      // reduce all prices in the array to get the total price
      '€ ' +
      parseFloat(
        parseFloat(sumRenderPricingAndPrespectives(orderItem.renderWithPrice)) +
          parseFloat(orderItem.renderWithPrice[0].initialFee)
      ).toFixed(2);
    // orderItem.data.renderWithPrice.renders.reduce((acc, cur) => {
    //   return acc + cur.prices['price'];
    // }, 0);
    wrapper.appendChild(item);

    generateAdditionalImages(orderItem, paymentDetails, itemTemplate, item);
  });
}

function generateAdditionalImages(itemDetails, paymentDetails, itemTemplate, siblingElement) {
  // console.log('inside generateAdditionalImages ::: ', itemDetails);
  itemDetails.renderWithPrice.forEach((renderDetails, index) => {
    const displayIndex = index + 1;
    const renderType = 'render ' + displayIndex + ' : ' + renderDetails.renderCategory;
    renderDetails.renders.forEach((imageData, index) => {
      const item = itemTemplate.cloneNode(true);

      // console.log(imageData);
      // const thisItemTotalPrice = Object.values(imageData).reduce((acc, cur) => acc + cur, 0);

      item.querySelector("[invoice-item-template='title']").innerHTML =
        // ${displayIndex - 1}  -
        ` ${renderType}  -  ${imageData.details.inputs.woodtype}`;
      item.querySelector("[invoice-item-template='quantity']").innerHTML =
        imageData.details.inputs['render-count'];
      item.querySelector("[invoice-item-template='price']").innerHTML =
        `€ ${((imageData.prices.prespectives + imageData.prices.renderPricing) / parseInt(imageData.details.inputs['render-count'])).toFixed(2)}`; //! - reduce woodtype price if needed . currentprespectives =  prices[renderType].render * detail.inputs["render-count"] + detailsPricing.prices.woodtype;
      // item.querySelector("[invoice-item-template='total']").innerHTML = `€ ${thisItemTotalPrice}`;
      item.querySelector("[invoice-item-template='total']").innerHTML = ``;
      item.querySelector("[invoice-item-template='details']").style.fontSize = '10px !important';

      item.querySelector("[invoice-item-template='details']").innerHTML =
        ` ${imageData.prices.renderPricing > 0 ? 'Render fee included <br>' : ''} 
        ${imageData.prices.woodtype > 0 ? 'Woodtype fee included <br>' : ''} 
         ${imageData.details.inputs['aspect-ratio']} /
      ${imageData.details.inputs['upholstery'] === 'true' ? imageData.details.inputs['upholstry-material'] : 'No Upholstery'} /
      ${imageData.details.inputs['render-details-comment']}
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
  });
}
//!unsed
function sumRenderPrices(data) {
  return data.reduce(
    (acc, category) => {
      category.renders.forEach((render) => {
        acc.prespectives += render.prices.prespectives;
        acc.renderPricing += render.prices.renderPricing;
        acc.rendersCountPrice += render.prices.rendersCountPrice;
        acc.initialFee += render.prices.initialFee;
      });
      return acc;
    },
    {
      prespectives: 0,
      renderPricing: 0,
      rendersCountPrice: 0,
      initialFee: 0,
    }
  );
}
//!unsed

function sumRenderPricingAndPrespectives(data) {
  return data.reduce((acc, category) => {
    category.renders.forEach((render) => {
      acc += render.prices.prespectives + render.prices.renderPricing;
    });
    return acc;
  }, 0);
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
