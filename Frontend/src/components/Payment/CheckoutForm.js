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
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("You must accept the terms to continue.");
      return;
    }

    setProcessing(true);

    try {
      let pm = null;

      if (paymentMethod === "card") {
        const card = elements.getElement(CardElement);
        const { error: stripeError, paymentMethod: cardPm } =
          await stripe.createPaymentMethod({
            type: "card",
            card,
            billing_details: { email },
          });

        if (stripeError) {
          setProcessing(false);
          setError(stripeError.message);
          return;
        }

        pm = cardPm;
      } else {
        if (!upiId.includes("@")) {
          setError("Enter a valid UPI ID");
          setProcessing(false);
          return;
        }
        pm = { type: "upi", upi_id: upiId };
      }

      setTimeout(() => {
        onSuccess();
        setProcessing(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };


// Inside your component, update the handlePaymentSubmit function
const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!agree) {
    setError("You must accept the terms to continue.");
    return;
  }

  // UPI ID validation
  if (paymentMethod === "upi") {
    if (!upiId || upiId.trim() === '') {
      setError("कृपया अपना UPI ID दर्ज करें");
      return;
    }
    
    const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId)) {
      setError("कृपया एक वैध UPI ID दर्ज करें (जैसे: yourname@upi)");
      return;
    }

    // Initialize Razorpay
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      name: 'Your Company Name',
      description: '1 Rupee for AutoPay Setup',
      prefill: {
        upi: upiId
      },
      handler: function(response) {
        // Handle successful payment
        console.log('Payment successful:', response);
        onSuccess();
      },
      theme: {
        color: '#3399cc'
      }
    };

    try {
      setProcessing(true);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Payment initialization failed. Please try again.");
      console.error('Razorpay error:', err);
    } finally {
      setProcessing(false);
    }
    return;
  }

  // Existing card payment logic
  if (paymentMethod === "card") {
    try {
      setProcessing(true);
      const card = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod: cardPm } =
        await stripe.createPaymentMethod({
          type: "card",
          card,
          billing_details: { email },
        });

      if (stripeError) {
        throw stripeError;
      }

      // Process card payment
      // Add your card payment processing logic here
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
      <Box>
        {/* Header */}
        <Heading>Subscribe to {plan.name}</Heading>
        <PriceRow>
          <Price>₹0.00</Price>
          <Small>per month<br />until coupon expires</Small>
        </PriceRow>

        <Divider />

        {/* Contact */}
        <SectionTitle>Contact information</SectionTitle>
        <InputBox>
          <Label>Email</Label>
          <StaticBox>{email || "Enter your email"}</StaticBox>
        </InputBox>

        <Divider />

        {/* Payment Method */}
        <SectionTitle>Payment method</SectionTitle>

        <PaymentBox>
          <RadioRow onClick={() => setPaymentMethod("card")}>
            <Radio checked={paymentMethod === "card"} />
            <span>Card</span>
            <CardIcons>
              <Img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" />
              <Img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" />
              <Img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Amex_logo.svg" />
              <Img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Discover_Card_logo.svg" />
            </CardIcons>
          </RadioRow>

          <RadioRow onClick={() => setPaymentMethod("upi")}>
            <Radio checked={paymentMethod === "upi"} />
            <span>UPI</span>
            <Img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" height="20" />
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
          <input type="checkbox" checked={saveInfo} onChange={() => setSaveInfo(!saveInfo)} />
          <CheckText>
            Save my information for faster checkout<br />
            <small>Pay securely at OpenAI, LLC and everywhere Link is accepted.</small>
          </CheckText>
        </CheckRow>

        <CheckRow>
          <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
          <Terms>
            You'll be charged according to the plan until you cancel.  
            By subscribing, you agree to the Terms of Use and Privacy Policy.
          </Terms>
        </CheckRow>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Subscribe disabled={processing}>
          {processing ? "Processing..." : "Subscribe"}
        </Subscribe>

        <Footer>Powered by <b>Stripe</b></Footer>
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

const Box = styled.div`
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

const StaticBox = styled.div`
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  color: #334155;
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

const ErrorBox = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
  margin-top: 12px;
`;

const Subscribe = styled.button`
  margin-top: 1.4rem;
  width: 100%;
  padding: 14px;
  font-size: 17px;
  background: #0ea5e9;
  color: white;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: #bae6fd;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-top: 1.2rem;
`;

