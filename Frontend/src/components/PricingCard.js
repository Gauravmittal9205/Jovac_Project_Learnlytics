function PricingCard({ plan, price, period, features, popular, cta, onCtaClick }) {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick({ plan, price, period });
    }
  };

  return (
    <div className={`pricing-card ${popular ? 'popular' : ''}`}>
      {popular && <div className="popular-badge">Most Popular</div>}
      <div className="pricing-header">
        <h3 className="plan-name">{plan}</h3>
        <div className="price">
          <span className="price-amount">{price}</span>
          {period && <span className="price-period">/{period}</span>}
        </div>
      </div>
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index}>✓ {feature}</li>
        ))}
      </ul>
      <button 
        className={`btn ${popular ? 'primary' : 'ghost'}`}
        onClick={handleCtaClick}
      >
        {cta}
      </button>
    </div>
  );
}
export default PricingCard;