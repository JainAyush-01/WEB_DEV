// Handles CRUD operations for subscription plans (with seasonal discount logic)
const Plan = require('../models/Plan');

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    const now = new Date();

    // Apply seasonal discount if applicable
    const plansWithDiscount = plans.map(plan => {
      const p = plan.toObject();
      p.originalPrice = p.price;
      p.discountApplied = false;

      if (p.is_seasonal_discount && p.discount_start && p.discount_end) {
        if (now >= new Date(p.discount_start) && now <= new Date(p.discount_end)) {
          p.discountApplied = true;
          p.discountedPrice = Math.round(p.price * (1 - p.discount_percentage / 100));
        }
      }
      return p;
    });

    res.json(plansWithDiscount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, durationDays, price, description, max_users_limit, is_seasonal_discount, discount_start, discount_end, discount_percentage, isCombo, comboIncludes } = req.body;
    const plan = await Plan.create({
      name, durationDays, price, description,
      max_users_limit: max_users_limit || 100,
      is_seasonal_discount: is_seasonal_discount || false,
      discount_start,
      discount_end,
      discount_percentage: discount_percentage || 0,
      isCombo: isCombo || false,
      comboIncludes: comboIncludes || []
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
