// Frontend/src/components/Payment/CheckoutForm.js
import React, { useState } from "react";
import styled from "styled-components";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);
  const [agree, setAgree] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const verifyUpiId = async (upiId) => {
  try {
    setVerifying(true);
    setVerificationStatus(null);
    setError("");

    // First, validate the UPI format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId)) {
      setError("Please enter a valid UPI ID (e.g., yourname@upi)");
      return false;
    }

    // Call your backend API to validate UPI ID
    const response = await fetch('https://your-backend-api.com/validate-upi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include any authentication tokens if needed
        // 'Authorization': `Bearer ${yourAuthToken}`
      },
      body: JSON.stringify({ upiId })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (data.valid) {
      setVerificationStatus('success');
      setSuccessMessage(`UPI ID ${upiId} verified successfully!`);
      return true;
    } else {
      setVerificationStatus('error');
      setError("Invalid UPI ID. Please check and try again.");
      return false;
    }
  } catch (err) {
    console.error('Verification error:', err);
    setVerificationStatus('error');
    setError("Failed to verify UPI ID. Please try again later.");
    return false;
  } finally {
    setVerifying(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!agree) {
      setError("You must accept the terms to continue.");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // UPI payment flow
    if (paymentMethod === "upi") {
      if (!upiId || upiId.trim() === '') {
        setError("Please enter your UPI ID");
        return;
      }

      // Basic UPI format check
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
      if (!upiRegex.test(upiId)) {
        setError("Please enter a valid UPI ID (e.g., yourname@upi)");
        return;
      }

      // Verify UPI ID
      const isUpiValid = await verifyUpiId(upiId);
      if (!isUpiValid) return;

      // If UPI is valid, proceed with payment
      try {
        setProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSuccessMessage("Payment successful! Redirecting...");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } catch (err) {
        setError("Payment processing failed. Please try again.");
        console.error('Payment error:', err);
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Card payment flow
    if (paymentMethod === "card") {
      try {
        setProcessing(true);
        const card = elements.getElement(CardElement);
        const { error: stripeError } = await stripe.createPaymentMethod({
          type: "card",
          card,
          billing_details: { email },
        });

        if (stripeError) throw stripeError;

        setSuccessMessage("Processing payment...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSuccessMessage("Payment successful! Redirecting...");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } catch (err) {
        setError(err.message || "An error occurred. Please try again.");
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Wrapper>
      <Box as="form" onSubmit={handleSubmit}>
        <Heading>Subscribe to {plan.name}</Heading>
        <PriceRow>
          <Price>₹{plan.price}</Price>
          <Small>per month</Small>
        </PriceRow>

        <Divider />

        <SectionTitle>Contact information</SectionTitle>
        <InputBox>
          <Label>Email</Label>
          <Input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputBox>

        <Divider />

        <SectionTitle>Payment method</SectionTitle>
        <PaymentBox>
          <RadioRow onClick={() => setPaymentMethod("card")}>
            <Radio checked={paymentMethod === "card"} />
            <span>Card</span>
            <CardIcons>
              <Img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" />
              <Img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" />
              <Img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Amex_logo.svg" alt="Amex" />
            </CardIcons>
          </RadioRow>

          <RadioRow onClick={() => setPaymentMethod("upi")}>
            <Radio checked={paymentMethod === "upi"} />
            <span>UPI</span>
            <Img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
              alt="UPI" 
              height="20" 
            />
          </RadioRow>

          {paymentMethod === "card" ? (
            <CardBox>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "15px",
                      color: "#1e293b",
                      "::placeholder": { color: "#94a3b8" },
                    },
                  },
                }}
              />
            </CardBox>
          ) : (
            <Input
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          )}
        </PaymentBox>

        <CheckRow>
          <input 
            type="checkbox" 
            checked={saveInfo} 
            onChange={() => setSaveInfo(!saveInfo)} 
          />
          <CheckText>
            Save my information for faster checkout
          </CheckText>
        </CheckRow>

        <CheckRow>
          <input 
            type="checkbox" 
            checked={agree} 
            onChange={() => setAgree(!agree)} 
          />
          <Terms>
            You'll be charged according to the plan until you cancel.  
            By subscribing, you agree to the Terms of Use and Privacy Policy.
          </Terms>
        </CheckRow>

        {verificationStatus === 'success' && (
          <SuccessText>
            <span>✓</span> {successMessage}
          </SuccessText>
        )}
        {error && <ErrorText>{error}</ErrorText>}

        <Button 
          type="submit" 
          disabled={processing || verifying}
          className={verifying ? 'verifying' : ''}
        >
          {verifying ? 'Verifying UPI ID...' : 
           processing ? 'Processing...' : 
           'Subscribe Now'}
        </Button>

        <Footer>Secure payment processing</Footer>
      </Box>
    </Wrapper>
  );
};

export default CheckoutForm;

/* ------------------------- UI Styles ------------------------- */

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const Box = styled.form`
  width: 420px;
  background: white;
  padding: 2rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
`;

const Heading = styled.h2`
  margin: 0 0 1rem 0;
  color: #1e293b;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Price = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
`;

const Small = styled.div`
  color: #6b7280;
  line-height: 1.2;
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 1.3rem 0;
`;

const SectionTitle = styled.h4`
  margin: 0 0 .5rem 0;
  color: #334155;
`;

const InputBox = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  color: #475569;
`;

const PaymentBox = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: .7rem;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;

  &:last-child { border-bottom: 0; }
`;

const Radio = styled.div`
  height: 15px;
  width: 15px;
  border-radius: 50%;
  border: 2px solid #6b7280;
  background: ${(p) => (p.checked ? "#2563eb" : "white")};
`;

const CardIcons = styled.div`
  display: flex;
  gap: 6px;
  margin-left: auto;
`;

const Img = styled.img`
  height: 22px;
`;

const CardBox = styled.div`
  padding: 15px;
  border-top: 1px solid #e2e8f0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
`;

const CheckRow = styled.div`
  display: flex;
  gap: .7rem;
  margin-top: 1rem;
`;

const CheckText = styled.div`
  color: #334155;
  font-size: 14px;

  small {
    color: #64748b;
  }
`;

const Terms = styled.div`
  color: #6b7280;
  font-size: 13px;
  line-height: 1.2;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-radius: 6px;
  border-left: 4px solid #ef4444;
`;

const SuccessText = styled.div`
  color: #059669;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem 1rem;
  background: #ecfdf5;
  border-radius: 6px;
  border-left: 4px solid #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  span {
    font-size: 1.25rem;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #c7d2fe;
    cursor: not-allowed;
    opacity: 0.8;
  }

  &.verifying {
    background: #4f46e5;
    color: transparent;
    position: relative;
    
    &::after {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      top: 50%;
      left: 50%;
      margin: -10px 0 0 -10px;
      border: 3px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Footer = styled.div`
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-top: 1.2rem;
`;

