function SubscriptionSuccessModal({ isOpen, email, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content subscription-success" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Subscription Successful! 🎉</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="subscription-success-content">
            <div className="success-icon">📧</div>
            <h4>Welcome to Learnlytics!</h4>
            <p>Thank you for subscribing to our newsletter. We've sent a confirmation email to:</p>
            <div className="email-display">{email}</div>
            <p className="next-steps">You'll receive our weekly insights, feature updates, and best practices for student success.</p>
            <div className="subscription-benefits">
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <span>Weekly analytics insights</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🚀</span>
                <span>New feature announcements</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💡</span>
                <span>Best practices & tips</span>
              </div>
            </div>
            <button className="btn primary" onClick={onClose}>
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SubscriptionSuccessModal;