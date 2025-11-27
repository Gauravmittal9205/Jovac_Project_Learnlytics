// In Frontend/src/components/Payment/SubscriptionPlans.js
import React, { useState } from 'react';
import { FaCheck, FaCrown, FaRocket, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import PaymentFormWrapper from './PaymentFormWrapper';

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₹499',
      period: 'per month',
      features: [
        'Access to basic courses',
        'Email support',
        'Community access',
        '1 month free trial',
        'Basic analytics'
      ],
      popular: false,
      icon: <FaRocket />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹999',
      period: 'per month',
      features: [
        'All Basic features',
        'Priority support',
        'Advanced analytics',
        '1-on-1 sessions',
        'Certification',
        'Early access to new features'
      ],
      popular: true,
      icon: <FaCrown />
    }
  ];

  const handleSelectPlan = (planId) => {
    // Temporarily bypass Stripe key check for testing
    // In production, ensure REACT_APP_STRIPE_PUBLIC_KEY is properly set in .env file
    if (!stripePublicKey) {
      console.warn('Stripe public key not found. Using fallback for testing.');
      // For now, allow the form to open without Stripe key
      // In production, uncomment the return statement below:
      // alert('Payment system is initializing. Please refresh the page and try again.');
      // return;
    }
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    // You can add success handling here (e.g., show a success message, redirect, etc.)
    console.log('Payment successful!');
  };

  const handleCloseForm = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <PricingSection id="pricing">
        <SectionTitle>Choose Your Plan</SectionTitle>
        <PricingContainer>
          {plans.map((plan) => (
            <PricingCard 
              key={plan.id} 
              popular={plan.popular}
              selected={selectedPlan === plan.id}
            >
              {plan.popular && <PopularBadge>MOST POPULAR</PopularBadge>}
              <PlanHeader>
                <PlanIcon>{plan.icon}</PlanIcon>
                <PlanName>{plan.name}</PlanName>
                <PlanPrice>
                  {plan.price} <span>/{plan.period}</span>
                </PlanPrice>
              </PlanHeader>
              <PlanFeatures>
                {plan.features.map((feature, index) => (
                  <FeatureItem key={index}>
                    <FaCheck className="check-icon" />
                    <span>{feature}</span>
                  </FeatureItem>
                ))}
              </PlanFeatures>
              <SelectButton 
                onClick={() => handleSelectPlan(plan.id)}
                selected={selectedPlan === plan.id}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Get Started'}
              </SelectButton>
            </PricingCard>
          ))}
        </PricingContainer>
      </PricingSection>

      {showPaymentForm && selectedPlan && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={handleCloseForm}>
              <FaTimes />
            </CloseButton>
            <PaymentFormWrapper 
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCloseForm}
              stripePublicKey={stripePublicKey}
            />
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// Styled Components
const PricingSection = styled.section`
  padding: 5rem 2rem;
  background: #f8fafc;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 3rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: #4f46e5;
    border-radius: 2px;
  }
`;

const PricingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PricingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.selected ? '#4f46e5' : '#e2e8f0'};
  transform: ${props => props.popular ? 'scale(1.05)' : 'scale(1)'};
  
  &:hover {
    transform: ${props => 
      props.popular ? 'scale(1.08) translateY(-5px)' : 'scale(1.03) translateY(-5px)'};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const PopularBadge = styled.span`
  position: absolute;
  top: -12px;
  right: 20px;
  background: #4f46e5;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlanHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const PlanIcon = styled.div`
  font-size: 2.5rem;
  color: #4f46e5;
  margin-bottom: 1rem;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 1rem 0;
  
  span {
    font-size: 1rem;
    font-weight: 400;
    color: #64748b;
  }
`;

const PlanFeatures = styled.ul`
  text-align: left;
  margin-bottom: 2rem;
  min-height: 220px;
  padding: 0;
  list-style: none;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #475569;
  font-size: 0.95rem;
  
  .check-icon {
    color: #10b981;
    margin-right: 0.75rem;
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: ${props => props.selected ? '#10b981' : '#4f46e5'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#0d9f6e' : '#4338ca'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  width: 90%;
  max-width: 600px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

export default SubscriptionPlans;