import Cookies from 'js-cookie';

export default function initInvoiceAddress() {
  try {
    //console.log('initInvoiceAddress');
    fillInvoiceAddress();
  } catch (error) {
    //console.error('An error occurred while initializing the invoice address:', error);
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
    const company = document.querySelectorAll("[data-order='company']");
    const ust_idnr = document.querySelectorAll("[data-order='idnr']");

    const userData = Cookies.get('user');

    if (!userData) {
      //console.error('User data not available');
      return;
    }

    const user = JSON.parse(userData);

    if (!user) {
      //console.error('User data not available');
      return;
    }

    firstName.forEach((e) => {
      e.innerHTML = user.first_name || '-';
    });

    lastName.forEach((e) => {
      e.innerHTML = user.last_name || '-';
    });

    phone.forEach((e) => {
      e.innerHTML = user.phone || '-';
    });

    email.forEach((e) => {
      e.innerHTML = user.email || '-';
    });

    street.forEach((e) => {
      e.innerHTML = user.street || '-';
    });

    city.forEach((e) => {
      e.innerHTML = user.city || '-';
    });

    zip.forEach((e) => {
      e.innerHTML = user.zip || '-';
    });

    country.forEach((e) => {
      e.innerHTML = user.country || '-';
    });

    additinonal.forEach((e) => {
      e.innerHTML = user['additional_address'] || '-';
    });

    houseNumber.forEach((e) => {
      e.innerHTML = user.housenumber || '-';
    });

    company.forEach((e) => {
      e.innerHTML = user.company || '-';
    });

    ust_idnr.forEach((e) => {
      e.innerHTML = user.ust_idnr || '-';
    });
  } catch (error) {
    //console.error('An error occurred while filling the invoice address:', error);
  }
}
