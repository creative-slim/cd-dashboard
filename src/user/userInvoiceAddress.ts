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
    const firstName = document.querySelectorAll("[data-order='first-name']");
    const lastName = document.querySelectorAll("[data-order='last-name']");
    const phone = document.querySelectorAll("[data-order='phone']");
    const email = document.querySelectorAll("[data-order='mail']");

    const userData = Cookies.get('user');
    const user = JSON.parse(userData);

    firstName.forEach((e) => {
      e.innerHTML = user.first_name || 'No available';
    });

    lastName.forEach((e) => {
      e.innerHTML = user.last_name || 'No available';
    });

    phone.forEach((e) => {
      e.innerHTML = user.phone || 'No available';
    });

    email.forEach((e) => {
      e.innerHTML = user.email || 'No available';
    });

    street.forEach((e) => {
      e.innerHTML = user.street || 'No available';
    });

    city.forEach((e) => {
      e.innerHTML = user.city || 'No available';
    });

    zip.forEach((e) => {
      e.innerHTML = user.zip || 'No available';
    });

    country.forEach((e) => {
      e.innerHTML = user.country || 'No available';
    });

    additinonal.forEach((e) => {
      e.innerHTML = user['additional_address'] || 'No available';
    });

    houseNumber.forEach((e) => {
      e.innerHTML = user.housenumber || 'No available';
    });
  } catch (error) {
    console.error('An error occurred while filling the invoice address:', error);
  }
}
