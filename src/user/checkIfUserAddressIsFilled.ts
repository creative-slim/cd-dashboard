// grap user data from cookies and return true if the array of required fields is filled
// example user data:
// {
//     "id": null,
//     "auth0_id": "google-oauth2|104805685782203882552",
//     "first_name": "Slim",
//     "last_name": "Abbadi",
//     "email": "sa@creative-directors.com",
//     "phone": "21390123909123",
//     "street": "Moss",
//     "housenumber": "21",
//     "additional_address": "etage 999",
//     "zip": "93483",
//     "city": "PAF",
//     "country": "Germany",
//     "contactperson": "",
//     "ust_idnr": "DE19230213",
//     "company": "Creative Directors",
//     "amount_spent": 0,
//     "number_of_orders": 0,
//     "preferred_language": "en",
//     "order_updates": "off",
//     "support_alerts": "off",
//     "promotion_alerts": "on",
//     "feature_update_alerts": "off"
//   }

//import cookie from 'js-cookie';

import Cookie from 'js-cookie';

export function checkIfUserAddressIsFilled(): boolean {
  const requiredFields = ['first_name', 'last_name', 'street', 'housenumber', 'zip', 'city'];
  const userData = JSON.parse(Cookie.get('user'));
  for (const field of requiredFields) {
    if (!userData[field] || userData[field].trim() === '') {
      console.error(`User data is missing required field: ${field}`);
      return false;
    }
  }
  return true;
}
