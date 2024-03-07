// @ts-nocheck
// import jsPDF from "jspdf";

// export function generateInvoice(e, element) {
//   const doc = new jsPDF({
//     format: "a4",
//     orientation: "portrait",
//     unit: "pt",
//   });

//   // get the html element from the dom
//   const pdfwrapper = document.querySelector("#pdf-wrapper");

//   // doc.text(singleOrder.name + singleOrder.renderPackage, 1, 1);
//   doc.html(pdfwrapper, {
//     callback: function (doc) {
//       doc.save();
//     },
//   });
//   // doc.save("two-by-four.pdf");
//   // doc.html(element.querySelector("[data-order-item='invoice-data']"), {
//   //   callback: function (doc) {
//   //     doc.save();
//   //   },
//   // });
// }

import html2pdf from "html2pdf.js";

export function generateInvoice(e, element) {
  const invoice = document.querySelector<HTMLElement>("#pdf-wrapper");
  const pdfwrapper = invoice.cloneNode(true);
  pdfwrapper.style.display = "block";

  let client = {};

  //! get client data from user Settings Tab

  const clientElement = document.getElementById("user-data");

  //   if (clientElement)
  //     clientElement.querySelectorAll("[data-client]").forEach((e) => {
  //       client[e.getAttribute("data-client")] = e.innerHTML;
  //     });

  // load invoice data
  getInvoiceData().then((invoiceData) => {
    fillInvoiceData(pdfwrapper, invoiceData);
  });

  //! this section replace the placeholders on the invoice with the actual data

  //   pdfwrapper.querySelectorAll("[data-invoice='client-name']").forEach((e) => {
  //     e.innerHTML = "test";
  //   });

  var opt = {
    // margin: 0,
    filename: "invoice.pdf",
    // image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      //   dpi: 192,
      //   letterRendering: true,
      width: 1050,
      useCORS: true,
    },

    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  const final = html2pdf().set(opt).from(pdfwrapper);
  final.save();
  console.log("🚀 ~ generateInvoice ~ final", final);
}

function getInvoiceData() {
  return new Promise((resolve, reject) => {
    try {
      let invoiceData = {};
      const invoiceElement = document.getElementById("user-data");

      if (!invoiceElement) {
        console.error("Invoice element not found");
        resolve(invoiceData); // Resolve with empty data to proceed with the next part
        return;
      }

      invoiceElement.querySelectorAll("[data-invoice]").forEach((e) => {
        invoiceData[e.getAttribute("data-invoice")] = e.innerHTML;
      });

      resolve(invoiceData);
    } catch (error) {
      console.error("Error in getInvoiceData:", error);
      resolve({}); // Resolve with empty data to proceed with the next part
    }
  });
}

function fillInvoiceData(wrapperElement, invoiceData) {
  try {
    console.log("🚀 ~ fillInvoiceData ~ invoiceData", invoiceData);

    if (!wrapperElement) {
      console.error("Wrapper element not found");
      return; // Skip to the next part without throwing an error
    }

    wrapperElement.querySelectorAll("[data-invoice]").forEach((e) => {
      console.log("🚀 ~ fillInvoiceData ~ e", e);
      e.innerHTML = invoiceData[e.getAttribute("data-invoice")] || "";
    });
  } catch (error) {
    console.error("Error in fillInvoiceData:", error);
    // Log the error but proceed to the next part
  }
}
