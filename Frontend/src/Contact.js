import React, { useState, useRef } from "react";
import styled, { keyframes } from "styled-components";

// ================= Animations =================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardHover = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
`;

// ================= Styled Components =================
const PageWrapper = styled.div`
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #eef2ff, #f9fafb);
`;

const Header = styled.header`
  background: #fff;
  padding: 4rem 1rem;
  margin-bottom: 3rem;
  text-align: center;
  border-radius: 1.5rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  animation: ${fadeIn} 0.6s ease forwards;
`;

const HeaderTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 1rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  color: #4b5563;
  max-width: 640px;
  margin: 0 auto;
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 4rem;
  grid-template-columns: 1fr;

  @media(min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  margin-bottom: 2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.1);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const InfoRowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-weight: 500;
  color: #4b5563;
`;

const InfoValue = styled.div`
  color: #111827;
`;

const InfoLink = styled.a`
  color: #6366f1;
  font-weight: 500;
  transition: color 0.2s;
  &:hover {
    color: #4338ca;
  }
`;

// ================= Form styling =================
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease forwards;
`;

const Grid2 = styled.div`
  display: grid;
  gap: 1rem;

  @media(min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${({ hasError }) => (hasError ? "#ef4444" : "#e5e7eb")};
  outline: none;
  background: #f9fafb;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ hasError }) => (hasError ? "#ef4444" : "#6366f1")};
    box-shadow: 0 0 0 3px ${({ hasError }) => (hasError ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.25)")};
    background: #fff;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${({ hasError }) => (hasError ? "#ef4444" : "#e5e7eb")};
  outline: none;
  background: #f9fafb;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ hasError }) => (hasError ? "#ef4444" : "#6366f1")};
    box-shadow: 0 0 0 3px ${({ hasError }) => (hasError ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.25)")};
    background: #fff;
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  accent-color: #6366f1;
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 0.85rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 1rem;
  box-shadow: 0 6px 14px rgba(99,102,241,0.3);
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
  }
`;

// ================= Success Message =================
const SuccessBox = styled.div`
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease forwards;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SuccessTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #065f46;
`;

const SuccessText = styled.p`
  color: #166534;
  margin-top: 0.5rem;
`;

// ================= Reusable InfoRow =================
const InfoRow = ({ label, value, href }) => (
  <InfoRowWrapper>
    <InfoLabel>{label}</InfoLabel>
    {href ? <InfoLink href={href} target="_blank" rel="noopener noreferrer">{value}</InfoLink> : <InfoValue>{value}</InfoValue>}
  </InfoRowWrapper>
);

// ================= Contact Form =================
const ContactForm = ({ onSubmit, isSubmitting }) => {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) error = 'Name is required.';
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email address is invalid.';
    }
    if (name === 'message' && !value.trim()) error = 'Message cannot be empty.';
    if (name === 'privacy' && !value) error = 'You must agree to the privacy policy.';
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    validate(name, val);
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current);
    const payload = Object.fromEntries(data.entries());
    let hasErrors = false;
    ['name', 'email', 'message', 'privacy'].forEach(field => {
      validate(field, payload[field]);
      if (errors[field]) hasErrors = true;
    });
    if (!hasErrors) onSubmit(payload);
  };

  const hasErrors = Object.values(errors).some(e => e);
  const allTouched = Object.keys(touched).length >= 4;
  const isFormValid = !hasErrors && allTouched && !isSubmitting;

  return (
    <Form ref={formRef} onSubmit={handleSubmit}>
      <Grid2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" placeholder="Your full name" required onChange={handleChange} hasError={touched.name && errors.name}/>
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" placeholder="you@school.edu" required onChange={handleChange} hasError={touched.email && errors.email}/>
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </div>
      </Grid2>

      <Grid2>
        <div>
          <Label htmlFor="institution">Institution</Label>
          <Input id="institution" name="institution" type="text" placeholder="e.g., Austin HS"/>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" defaultValue="Instructor" style={{padding:"0.85rem 1rem", borderRadius:"0.75rem", border:"2px solid #e5e7eb", background:"#f9fafb"}}>
            <option>Student</option>
            <option>Instructor</option>
            <option>Admin</option>
            <option>Other</option>
          </select>
        </div>
      </Grid2>

      <div>
        <Label htmlFor="topic">Topic</Label>
        <select id="topic" name="topic" defaultValue="Support" style={{padding:"0.85rem 1rem", borderRadius:"0.75rem", border:"2px solid #e5e7eb", background:"#f9fafb"}}>
          <option>Sales</option>
          <option>Support</option>
          <option>Billing</option>
          <option>Privacy</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows="5" placeholder="How can we help?" required onChange={handleChange} hasError={touched.message && errors.message}/>
        {errors.message && <ErrorText>{errors.message}</ErrorText>}
      </div>

      <CheckboxWrapper>
        <Checkbox id="privacy" name="privacy" type="checkbox" required onChange={handleChange}/>
        I agree to the privacy policy
      </CheckboxWrapper>
      {errors.privacy && <ErrorText>{errors.privacy}</ErrorText>}

      <Button type="submit" disabled={isSubmitting || !isFormValid}>
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </Form>
  );
};

// ================= Success Component =================
const ContactSuccess = () => (
  <SuccessBox role="alert" aria-live="polite">
    <SuccessIcon>🎉</SuccessIcon>
    <SuccessTitle>Thanks for reaching out!</SuccessTitle>
    <SuccessText>We’ll reply within 1 business day. 🚀</SuccessText>
    <SuccessText style={{fontSize:"0.875rem", marginTop:"1rem"}}>
      For urgent help, call us at <strong>+1 (800) LEARN-ED</strong>.
    </SuccessText>
  </SuccessBox>
);

// ================= Main App =================
const App = () => {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (payload) => {
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Form payload", payload);
      setIsSubmitting(false);
      setSent(true);
    }, 1500);
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderTitle>We’re here to help</HeaderTitle>
        <HeaderSubtitle>
          Response within 1 business day for general queries; 4 hours for priority support.
        </HeaderSubtitle>
      </Header>

      <Section>
        <div>
          <Title>Contact options</Title>
          <Card>
            <InfoRow label="Sales" value="sales@learnytics.app" href="mailto:sales@learnytics.app"/>
            <InfoRow label="Support" value="support@learnytics.app" href="mailto:support@learnytics.app"/>
            <InfoRow label="Partnerships" value="partners@learnytics.app" href="mailto:partners@learnytics.app"/>
            <InfoRow label="Press" value="press@learnytics.app" href="mailto:press@learnytics.app"/>
            <InfoRow label="Phone" value="+1 (800) LEARN-ED" href="tel:+18005327633"/>
            <InfoRow label="Office hours" value="Mon–Fri, 9am–6pm local"/>
          </Card>

          <Title>Address</Title>
          <Card>
            <InfoRow label="HQ" value="123 Educator Way, Suite 400, Austin, TX 78701"/>
            <InfoRow label="Link" value="View on map" href="https://maps.google.com/?q=123+Educator+Way,+Austin,+TX+78701"/>
          </Card>
        </div>

        <div>
          <Title>Contact form</Title>
          {sent ? <ContactSuccess/> : <ContactForm onSubmit={handleSubmit} isSubmitting={isSubmitting}/>}
        </div>
      </Section>
    </PageWrapper>
  );
};

export default App;
