// Displays details of a subscription plan as a card
import React from 'react';

const PlanCard = ({ plan, onSelect, actionText = 'Buy Now', recommended = false, isPopular = false }) => {
  return (
    <div className="plan-card" style={plan.isCombo ? { border: '2px solid #ffc107', position: 'relative' } : { position: 'relative' }}>
      {recommended && (
        <span className="badge bg-success" style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)' }}>💡 Recommended</span>
      )}
      {isPopular && !recommended && (
        <span className="badge" style={{ backgroundColor: '#e6186a', color: 'white', position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)' }}>Our most popular plan</span>
      )}
      {plan.isCombo && (
        <span className="badge bg-warning" style={{ position: 'absolute', top: '10px', right: '10px' }}>⭐ Combo Plan</span>
      )}
      <h3>{plan.name}</h3>
      {plan.discountApplied ? (
        <>
          <p style={{ textDecoration: 'line-through', color: '#999', margin: 0, fontSize: '1rem' }}>₹{plan.originalPrice}</p>
          <p className="price" style={{ margin: 0 }}>₹{plan.discountedPrice}</p>
          <p style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 'bold' }}>Seasonal Discount Applied!</p>
        </>
      ) : (
        <p className="price">₹{plan.price}</p>
      )}
      <p className="duration">{plan.durationDays} days</p>
      <p className="desc">{plan.description}</p>
      
      {plan.isCombo && plan.comboIncludes?.length > 0 && (
        <ul style={{ textAlign: 'left', marginBottom: '15px', fontSize: '0.85rem', color: '#555', paddingLeft: '20px' }}>
          {plan.comboIncludes.map((perk, i) => <li key={i} style={{ listStyleType: 'circle' }}>{perk}</li>)}
        </ul>
      )}

      <button className="btn btn-success" style={{ width: '100%' }} onClick={() => onSelect(plan)}>{actionText}</button>
    </div>
  );
};

export default PlanCard;
