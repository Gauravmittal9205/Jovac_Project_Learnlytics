const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Define your subscription plans
const PLANS = {
  basic: {
    name: 'Basic',
    price: 499, // in paise (₹4.99)
    interval: 'month',
    features: [
      'Access to basic courses',
      '1:1 doubt solving',
      'Certificate of completion'
    ]
  },
  premium: {
    name: 'Premium',
    price: 999, // in paise (₹9.99)
    interval: 'month',
    features: [
      'Everything in Basic',
      'Advanced courses',
      'Priority support',
      'Offline access'
    ]
  }
};

module.exports = { stripe, PLANS };
