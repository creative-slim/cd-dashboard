export function mergePaymentDetails(data) {
  console.log('data', data);
  // Extract payment details from the input array
  const paymentDetails = data.find((item) => item.paymentDetails)?.paymentDetails;

  if (!paymentDetails) {
    return data; // Return as is if no payment details found
  }

  // Extract the pricing data for items from paymentDetails
  const { orderItems } = paymentDetails.order;

  // Flatten allRenderPricing arrays and keep them in order to match the indices of render objects
  const flatPricing = orderItems.flatMap((item) => item.allRenderPricing);

  // Variable to track the current index of pricing used
  let pricingIndex = 0;

  // Iterate through the main data array to update render objects with prices
  data.forEach((item) => {
    if (item.data) {
      item.data.forEach((renderObj) => {
        const { render } = renderObj;

        // Skip items without prices if we've exhausted pricing data
        if (pricingIndex >= flatPricing.length) return;

        // Get the current pricing details using the pricing index
        const currentPriceDetails = flatPricing[pricingIndex];

        // Dynamically calculate price from current pricing details
        render.price =
          (currentPriceDetails.initialFee || 0) +
          (currentPriceDetails.render || 0) +
          (currentPriceDetails.prespectives || 0) +
          (currentPriceDetails.woodtype || 0);

        // Increment the pricing index to move to the next pricing object
        pricingIndex++;
      });
    }
  });

  return data;
}
