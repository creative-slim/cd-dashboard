import getEndpoint from 'src/general/getEndpoint';

export function couponHandler() {
  const couponInput = document.querySelector('[data-coupon="coupon-code"]');
  if (!couponInput) {
    console.log('missing element in coupon section ( selector )');
  }

  const couponButton = document.querySelector('[data-coupon="apply-coupon"]');
  if (!couponButton) {
    console.log('missing element in coupon section ( selector )');
  }

  couponButton.addEventListener('click', async () => {
    const coupon = couponInput.value;
    couponInput?.classList.add('loader-black');
    const couponValidity = await checkCouponValidity(coupon);
    couponInput?.classList.remove('loader-black');
    console.log('couponValidity', couponValidity);
    if (couponValidity.isValid === true) {
      validCouponMessage(couponValidity);
    } else {
      invalidCouponMessage();
    }
  });
}

function invalidCouponMessage() {
  const couponMessage = document.querySelector('[data-coupon="message"]');
  if (!couponMessage) {
    console.log('missing element in coupon section ( selector )');
  }

  couponMessage.classList.add('error');
  setTimeout(() => {
    couponMessage.classList.remove('error');
  }, 10000);
}

function validCouponMessage(couponValidity) {
  const couponMessage = document.querySelector('[data-coupon="message"]');
  if (!couponMessage) {
    console.log('missing element in coupon section ( selector )');
  }

  couponMessage.classList.add('success');
  couponMessage.textContent = couponValidity.value.discountValue + '% OFF!';
  //   setTimeout(() => {
  //     couponMessage.classList.remove('success');
  //   }, 2000);
}

function checkCouponValidity(coupon: string) {
  const api = getEndpoint();
  const url = `${api}/api/cd/coupon-validation`;
  const data = {
    couponCode: coupon,
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
}
