// Frontend/src/components/Payment/PaymentFormWrapper.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const PaymentFormWrapper = ({ plan, onSuccess, onCancel, stripePublicKey }) => {
  // If Stripe public key is available, load Stripe and use Elements provider
  if (stripePublicKey) {
    const stripePromise = loadStripe(stripePublicKey);
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm plan={plan} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    );
  }

  // If Stripe is not available, show a fallback form
  const FallbackForm = () => {
    const [processing, setProcessing] = React.useState(false);
    const [succeeded, setSucceeded] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState('card');
    const [upiId, setUpiId] = React.useState('');
    const [cardNumber, setCardNumber] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      setProcessing(true);

      // Validation
      if (paymentMethod === 'card') {
        if (!cardNumber || cardNumber.trim() === '') {
          setError('Please enter your card details.');
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === 'upi') {
        if (!upiId || upiId.trim() === '') {
          setError('Please enter your UPI ID.');
          setProcessing(false);
          return;
        }
        
        // Basic UPI ID validation
        if (!upiId.includes('@')) {
          setError('Please enter a valid UPI ID (e.g., yourname@upi).');
          setProcessing(false);
          return;
        }
      }

      // Simulate payment processing
      setTimeout(() => {
        setProcessing(false);
        setSucceeded(true);
        onSuccess();
      }, 2000);
    };

    if (succeeded) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>Payment Successful!</h3>
          <p style={{ color: '#334155', marginBottom: '1.5rem' }}>
            Thank you for subscribing to {plan.name} plan.
          </p>
          <button 
            onClick={onSuccess}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      );
    }

    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '1.5rem', textAlign: 'center' }}>
          Complete Your Payment
        </h2>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{plan.name} Plan</h3>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#4f46e5' }}>
            {plan.price} per month
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
              Payment Method
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div 
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: `2px solid ${paymentMethod === 'card' ? '#4f46e5' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: paymentMethod === 'card' ? '#f0f9ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('card')}
              >
                <span style={{ fontSize: '1.25rem' }}>💳</span>
                <span style={{ fontWeight: '500', color: paymentMethod === 'card' ? '#4f46e5' : '#64748b' }}>Card</span>
              </div>
              <div 
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: `2px solid ${paymentMethod === 'upi' ? '#4f46e5' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: paymentMethod === 'upi' ? '#f0f9ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('upi')}
              >
                <span style={{ fontSize: '1.25rem' }}>📱</span>
                <span style={{ fontWeight: '500', color: paymentMethod === 'upi' ? '#4f46e5' : '#64748b' }}>UPI</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'card' ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                Card Information
              </label>
              <div style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white'
              }}>
                <input 
                  type="text" 
                  placeholder="Card number (Demo mode)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{ 
                    width: '100%', 
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                UPI ID
              </label>
              <div style={{
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'all 0.2s'
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{
              color: '#dc2626',
              background: '#fef2f2',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#f1f5f9',
                color: '#334155',
                border: 'none',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={processing}
              style={{
                flex: 1,
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: processing ? 'not-allowed' : 'pointer',
                background: processing ? '#cbd5e1' : '#4f46e5',
                color: 'white',
                border: 'none',
                transition: 'all 0.2s'
              }}
            >
              {processing ? 'Processing...' : `Pay ${plan.price}`}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return <FallbackForm />;
};

export default PaymentFormWrapper;
