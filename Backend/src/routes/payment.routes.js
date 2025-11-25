const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { stripe, PLANS } = require('../config/stripe');
const Subscription = require('../models/Subscription');

// @route   POST /api/payment/create-customer
// @desc    Create a new Stripe customer
// @access  Private
router.post('/create-customer', auth, async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: {
        userId: req.user.id.toString()
      }
    });

    res.json({ customerId: customer.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/payment/create-subscription
// @desc    Create a subscription
// @access  Private
router.post('/create-subscription', [
  auth,
  [
    check('paymentMethodId', 'Payment method is required').not().isEmpty(),
    check('plan', 'Plan is required').isIn(['basic', 'premium'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { paymentMethodId, plan } = req.body;
  const planDetails = PLANS[plan];

  try {
    // Create or get customer
    let customer;
    const customers = await stripe.customers.list({ email: req.user.email });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Create subscription with trial and initial 1 rupee payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: createPriceId(plan) }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 7, // 7-day free trial
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
    });

    // Save subscription to database
    const newSubscription = new Subscription({
      user: req.user.id,
      plan,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      paymentMethod: 'card',
      nextPaymentDate: new Date(subscription.current_period_end * 1000)
    });

    await newSubscription.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating subscription', error: err.message });
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper function to create price ID
function createPriceId(plan) {
  return plan === 'basic' ? process.env.STRIPE_BASIC_PRICE_ID : process.env.STRIPE_PREMIUM_PRICE_ID;
}

// Webhook handlers
async function handleInvoicePaid(invoice) {
  const subscription = await Subscription.findOne({ stripeCustomerId: invoice.customer });
  if (subscription) {
    subscription.lastPaymentDate = new Date();
    subscription.nextPaymentDate = new Date(invoice.period_end * 1000);
    subscription.status = 'active';
    await subscription.save();
  }
}

async function handleInvoicePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({ stripeCustomerId: invoice.customer });
  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (sub) {
    sub.status = subscription.status;
    sub.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    sub.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    sub.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    await sub.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  await Subscription.findOneAndDelete({ stripeSubscriptionId: subscription.id });
}

module.exports = router;
