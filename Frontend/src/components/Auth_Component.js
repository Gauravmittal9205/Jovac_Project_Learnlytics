// In Frontend/src/components/Payment/CheckoutForm.js
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Here you would typically send the paymentMethod.id to your server
      // to complete the payment. For example:
      // const response = await fetch('/api/payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     paymentMethodId: paymentMethod.id,
      //     planId: plan.id,
      //     amount: plan.price,
      //   }),
      // });

      // const result = await response.json();

      // if (result.error) {
      //   throw new Error(result.error);
      // }

      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        setProcessing(false);
        setSucceeded(true);
        onSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <SuccessMessage>
        <h3>Payment Successful!</h3>
        <p>Thank you for subscribing to {plan.name} plan.</p>
        <button onClick={onSuccess}>Close</button>
      </SuccessMessage>
    );
  }

  return (
    <FormContainer>
      <h2>Complete Your Payment</h2>
      <PlanInfo>
        <h3>{plan.name} Plan</h3>
        <p>{plan.price} {plan.period}</p>
      </PlanInfo>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Card Information</label>
          <CardElementContainer>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </CardElementContainer>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ButtonGroup>
          <Button type="button" secondary onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!stripe || processing}>
            {processing ? 'Processing...' : `Pay ${plan.price}`}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  h2 {
    color: #1e293b;
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const PlanInfo = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }
  
  p {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #4f46e5;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #334155;
  }
`;

const CardElementContainer = styled.div`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  
  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 1px #4f46e5;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.secondary ? `
    background: #f1f5f9;
    color: #334155;
    
    &:hover {
      background: #e2e8f0;
    }
  ` : `
    background: #4f46e5;
    color: white;
    
    &:hover {
      background: #4338ca;
    }
    
    &:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
  `}
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem;
  
  h3 {
    color: #10b981;
    margin-top: 0;
  }
  
  p {
    color: #334155;
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: #4338ca;
    }
  }
`;

export default CheckoutForm;