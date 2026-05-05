// Simulated payment gateway with proper action labels
import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const PaymentSimulator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { plan, isUpgrade, isRenew, actionId } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!plan) return <section className="content"><p>No plan selected. <a href="/buy">Go back</a></p></section>;

  // Determine what action this payment is for
  const actionLabel = isUpgrade ? 'Upgrade' : isRenew ? 'Renewal' : 'New Purchase';

  let basePrice = plan.price;
  if (plan.is_seasonal_discount && plan.discount_start && plan.discount_end) {
    const now = new Date();
    if (now >= new Date(plan.discount_start) && now <= new Date(plan.discount_end)) {
      basePrice = Math.round(plan.price * (1 - plan.discount_percentage / 100));
    }
  }

  let pointsUsed = 0;
  let finalPrice = basePrice;
  if (user && user.points > 0) {
    const maxDiscount = Math.floor(basePrice * 0.5);
    pointsUsed = Math.min(user.points, maxDiscount);
    finalPrice -= pointsUsed;
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setTimeout(async () => {
      try {
        if (isUpgrade) {
          await api.put(`/memberships/upgrade/${actionId}`, { newPlanId: plan._id });
        } else if (isRenew) {
          await api.put(`/memberships/renew/${actionId}`);
        } else {
          await api.post('/memberships/buy', { planId: plan._id });
        }
        setLoading(false);
        navigate('/', { replace: true });
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.message || 'Payment failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <>
      <div className="content-header">
        <h1>Payment</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ Payment</span></div>
      </div>
      <section className="content">
        <div className="payment-wrapper">
          <div className="payment-card">
            <h2 style={{marginBottom:'20px',fontWeight:400}}>Order Summary</h2>
            <div className="summary-row"><span>Type</span><span>{actionLabel}</span></div>
            <div className="summary-row"><span>Plan</span><span>{plan.name}</span></div>
            <div className="summary-row"><span>Duration</span><span>{plan.durationDays} days</span></div>
            <div className="summary-row"><span>Base Price</span><span>₹{plan.price}</span></div>
            {basePrice < plan.price && <div className="summary-row" style={{color: '#17a2b8'}}><span>Seasonal Discount</span><span>-₹{plan.price - basePrice}</span></div>}
            {pointsUsed > 0 && <div className="summary-row" style={{color: '#28a745'}}><span>Points Discount ({pointsUsed} pts)</span><span>-₹{pointsUsed}</span></div>}
            <div className="summary-row total"><span>Total</span><span>₹{finalPrice}</span></div>

            {error && <p className="field-error" style={{textAlign:'center',marginTop:'10px'}}>{error}</p>}

            {loading ? (
              <div className="spinner-wrap mt-2">
                <div className="spinner"></div>
                <p style={{marginTop:'10px',color:'#6c757d'}}>Processing Payment...</p>
              </div>
            ) : (
              <button className="btn btn-success btn-block mt-2" onClick={handlePayment}>
                Pay ₹{finalPrice} Now
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentSimulator;
