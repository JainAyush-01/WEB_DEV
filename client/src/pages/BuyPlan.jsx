// Page to browse and select subscription plans
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import PlanCard from '../components/PlanCard';
import { useNavigate, useLocation } from 'react-router-dom';

const BuyPlan = () => {
  const [plans, setPlans] = useState([]);
  const [insights, setInsights] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isUpgrade = location.state?.upgradeId;
  const isRenew = location.state?.renewId;

  useEffect(() => { 
    fetchPlans(); 
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data } = await api.get('/attendance/insights');
      setInsights(data);
    } catch (err) {}
  };

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans');
      setPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPlan = (plan) => {
    navigate('/payment', { state: { plan, isUpgrade, isRenew, actionId: isUpgrade || isRenew } });
  };

  return (
    <>
      <div className="content-header">
        <h1>{isUpgrade ? 'Upgrade Plan' : isRenew ? 'Renew Plan' : 'Select a Plan'}</h1>
        <div className="breadcrumb">
          <a href="#">Home</a> <span>/ Plans</span>
        </div>
      </div>
      <section className="content">
        <div className="plans-grid">
          {plans.map(plan => {
            // Very simple match: if suggestion contains plan name loosely
            const isRecommended = insights && insights.suggestion.toLowerCase().includes(plan.name.toLowerCase());
            return <PlanCard key={plan._id} plan={plan} onSelect={handleSelectPlan} recommended={isRecommended} />;
          })}
        </div>
      </section>
    </>
  );
};

export default BuyPlan;
