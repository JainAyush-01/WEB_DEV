// Displays details of a single membership
import React from 'react';

const MembershipCard = ({ membership, onRenew, onUpgrade }) => {
  if (!membership) return <div className="card">No active membership</div>;

  const isExpired = membership.status === 'expired';
  const endDate = new Date(membership.endDate).toLocaleDateString();

  return (
    <div className={`card ${isExpired ? 'expired-card' : 'active-card'}`}>
      <h3>{membership.planId?.name || 'Unknown Plan'}</h3>
      <p>Status: <span className={`status-badge ${membership.status}`}>{membership.status}</span></p>
      <p>Valid until: {endDate}</p>
      <div className="card-actions">
        {isExpired && <button className="btn" onClick={onRenew}>Renew</button>}
        {!isExpired && <button className="btn btn-outline" onClick={onUpgrade}>Upgrade</button>}
      </div>
    </div>
  );
};

export default MembershipCard;
