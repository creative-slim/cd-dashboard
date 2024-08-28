import Cookies from 'js-cookie';

export default function initInvoiceAddress() {
  try {
    console.log('initInvoiceAddress');
    fillInvoiceAddress();
  } catch (error) {
    console.error('An error occurred while initializing the invoice address:', error);
  }
}

function fillInvoiceAddress() {
  try {
    const street = document.querySelectorAll("[data-order='street']");
    const city = document.querySelectorAll("[data-order='city']");
    const zip = document.querySelectorAll("[data-order='zip']");
    const country = document.querySelectorAll("[data-order='country']");
    const additinonal = document.querySelectorAll("[data-order='address-addition']");
    const houseNumber = document.querySelectorAll("[data-order='house-number']");

    const userData = Cookies.get('user');
    const user = JSON.parse(userData);

    street.forEach((e) => {
      e.innerHTML = user.street;
    });

    city.forEach((e) => {
      e.innerHTML = user.city;
    });

    zip.forEach((e) => {
      e.innerHTML = user.zip;
    });

    country.forEach((e) => {
      e.innerHTML = user.country;
    });

    additinonal.forEach((e) => {
      e.innerHTML = user['additional_address'];
    });

    houseNumber.forEach((e) => {
      e.innerHTML = user.housenumber;
    });
  } catch (error) {
    console.error('An error occurred while filling the invoice address:', error);
  }
}
