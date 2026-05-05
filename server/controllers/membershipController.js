// Handles purchasing, renewing, upgrading, freezing, and trial memberships
const Membership = require('../models/Membership');
const Plan = require('../models/Plan');
const FreezeRecord = require('../models/FreezeRecord');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Auto-expire any active memberships that have passed their endDate
const autoExpire = async (userId) => {
  const now = new Date();
  const active = await Membership.find({ userId, status: 'active' }).populate('planId');
  for (let m of active) {
    if (new Date(m.endDate) < now) {
      m.status = 'expired';
      await m.save();
      await Notification.create({
        userId,
        message: `Your ${m.planId.name} membership has expired.`
      });
    }
  }
};

// GET /api/memberships/my
const getMyMemberships = async (req, res) => {
  try {
    await autoExpire(req.user._id);
    const memberships = await Membership.find({ userId: req.user._id })
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total frozen days for each membership
    for (let m of memberships) {
      const existingFreezes = await FreezeRecord.find({ membership_id: m._id });
      const totalFrozenDays = existingFreezes.reduce((sum, f) => {
        const diff = Math.ceil((new Date(f.freeze_end_date) - new Date(f.freeze_start_date)) / (1000 * 60 * 60 * 24));
        return sum + diff;
      }, 0);
      m.totalFrozenDays = totalFrozenDays;
    }

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/buy — purchase a new plan (with capacity check + seasonal discount)
const buyMembership = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Check if user has an active membership to queue
    const existing = await Membership.findOne({ userId: req.user._id, status: { $in: ['active', 'frozen'] } }).sort({ endDate: -1 });
    let startDate = new Date();
    if (existing) {
      // Queue it after the latest active/frozen membership
      if (new Date(existing.endDate) > startDate) {
        startDate = new Date(existing.endDate);
      }
    }

    // Capacity limit check
    const activeCount = await Membership.countDocuments({ planId, status: 'active' });
    if (activeCount >= plan.max_users_limit) {
      return res.status(400).json({ message: `This plan has reached its maximum capacity of ${plan.max_users_limit} users.` });
    }

    // Calculate price with seasonal discount
    let finalPrice = plan.price;
    if (plan.is_seasonal_discount && plan.discount_start && plan.discount_end) {
      const now = new Date();
      if (now >= new Date(plan.discount_start) && now <= new Date(plan.discount_end)) {
        finalPrice = Math.round(plan.price * (1 - plan.discount_percentage / 100));
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const membership = await Membership.create({
      userId: req.user._id,
      planId,
      startDate,
      endDate,
      amountPaid: finalPrice
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/trial — start a 2-day free trial
const startTrial = async (req, res) => {
  try {
    // Check if user has ever had a trial
    const hadTrial = await Membership.findOne({ userId: req.user._id, is_trial: true });
    if (hadTrial) {
      return res.status(400).json({ message: 'You have already used your free trial.' });
    }

    // Check if user has an active membership
    const active = await Membership.findOne({ userId: req.user._id, status: 'active' });
    if (active) {
      return res.status(400).json({ message: 'You already have an active membership.' });
    }

    // Need at least one plan to associate with the trial
    const plan = await Plan.findOne({}).sort({ price: 1 });
    if (!plan) return res.status(400).json({ message: 'No plans available.' });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 2);

    const trial = await Membership.create({
      userId: req.user._id,
      planId: plan._id,
      startDate,
      endDate,
      amountPaid: 0,
      is_trial: true,
      status: 'active'
    });

    await Notification.create({
      userId: req.user._id,
      message: 'Your 2-day free trial has started! Explore the gym.'
    });

    res.status(201).json(trial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memberships/renew/:id
const renewMembership = async (req, res) => {
  try {
    const oldMembership = await Membership.findById(req.params.id).populate('planId');
    if (!oldMembership) return res.status(404).json({ message: 'Membership not found' });

    const now = new Date();
    const newStart = new Date(oldMembership.endDate) > now ? new Date(oldMembership.endDate) : now;
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + oldMembership.planId.durationDays);

    if (oldMembership.status === 'active') {
      oldMembership.status = 'expired';
      await oldMembership.save();
    }

    const newMembership = await Membership.create({
      userId: req.user._id,
      planId: oldMembership.planId._id,
      startDate: newStart,
      endDate: newEnd,
      amountPaid: oldMembership.planId.price,
      status: 'active'
    });

    // Gamification: Add 50 points on renewal
    const user = await User.findById(req.user._id);
    if (user) {
      user.points += 50;
      let levelUp = false;
      if (user.points >= 300 && user.level !== 'Gold') {
        user.level = 'Gold';
        levelUp = true;
      } else if (user.points >= 100 && user.points < 300 && user.level !== 'Silver') {
        user.level = 'Silver';
        levelUp = true;
      }
      await user.save();
      res.json({ membership: newMembership, pointsEarned: 50, levelUp: levelUp ? user.level : null });
    } else {
      res.json({ membership: newMembership });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memberships/upgrade/:id
const upgradeMembership = async (req, res) => {
  try {
    const { newPlanId } = req.body;
    const newPlan = await Plan.findById(newPlanId);
    const oldMembership = await Membership.findById(req.params.id).populate('planId');

    if (!oldMembership || !newPlan) return res.status(404).json({ message: 'Not found' });
    if (oldMembership.status !== 'active' && oldMembership.status !== 'frozen') {
      return res.status(400).json({ message: 'Only active members can upgrade their plan' });
    }

    // Same plan = renewal
    if (oldMembership.planId._id.toString() === newPlanId) {
      const now = new Date();
      const newStart = new Date(oldMembership.endDate) > now ? new Date(oldMembership.endDate) : now;
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + newPlan.durationDays);

      oldMembership.status = 'expired';
      await oldMembership.save();

      const renewed = await Membership.create({
        userId: req.user._id,
        planId: newPlanId,
        startDate: newStart,
        endDate: newEnd,
        amountPaid: newPlan.price,
        status: 'active'
      });
      return res.json(renewed);
    }

    // Different plan = true upgrade
    oldMembership.status = 'expired';
    await oldMembership.save();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + newPlan.durationDays);

    const upgraded = await Membership.create({
      userId: req.user._id,
      planId: newPlanId,
      startDate,
      endDate,
      amountPaid: newPlan.price,
      status: 'active'
    });

    res.json(upgraded);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/freeze — freeze membership (max 10 days)
const freezeMembership = async (req, res) => {
  try {
    const { freeze_days } = req.body;

    if (!freeze_days || freeze_days < 1 || freeze_days > 10) {
      return res.status(400).json({ message: 'Freeze duration must be between 1 and 10 days.' });
    }

    const membership = await Membership.findOne({ userId: req.user._id, status: 'active' });
    if (!membership) return res.status(400).json({ message: 'No active membership to freeze.' });
    if (membership.is_trial) return res.status(400).json({ message: 'Cannot freeze a trial membership.' });

    // Check total freeze days already used for this membership
    const existingFreezes = await FreezeRecord.find({ membership_id: membership._id });
    const totalFrozenDays = existingFreezes.reduce((sum, f) => {
      const diff = Math.ceil((new Date(f.freeze_end_date) - new Date(f.freeze_start_date)) / (1000 * 60 * 60 * 24));
      return sum + diff;
    }, 0);

    if (totalFrozenDays + freeze_days > 10) {
      return res.status(400).json({ message: `You can only freeze for a total of 10 days. You have ${10 - totalFrozenDays} days remaining.` });
    }

    // Freeze: set status to frozen, extend end date
    membership.status = 'frozen';
    const currentEnd = new Date(membership.endDate);
    currentEnd.setDate(currentEnd.getDate() + freeze_days);
    membership.endDate = currentEnd;
    await membership.save();

    const freezeStart = new Date();
    const freezeEnd = new Date();
    freezeEnd.setDate(freezeStart.getDate() + freeze_days);

    await FreezeRecord.create({
      membership_id: membership._id,
      freeze_start_date: freezeStart,
      freeze_end_date: freezeEnd
    });

    await Notification.create({
      userId: req.user._id,
      message: `Your membership has been frozen for ${freeze_days} day(s). End date extended to ${membership.endDate.toLocaleDateString()}.`
    });

    res.json({ message: `Membership frozen for ${freeze_days} days.`, membership });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/unfreeze — unfreeze
const unfreezeMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user._id, status: 'frozen' });
    if (!membership) return res.status(400).json({ message: 'No frozen membership found.' });

    membership.status = 'active';
    await membership.save();

    await Notification.create({
      userId: req.user._id,
      message: 'Your membership has been unfrozen and is now active.'
    });

    res.json({ message: 'Membership unfrozen.', membership });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships/all — admin
const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({})
      .populate('userId', 'name collegeId email')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memberships/admin/update/:id
const adminUpdateMembership = async (req, res) => {
  try {
    const { status, extendDays } = req.body;
    const membership = await Membership.findById(req.params.id).populate('planId');
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    if (status) membership.status = status;
    if (extendDays) {
      const currentEnd = new Date(membership.endDate);
      currentEnd.setDate(currentEnd.getDate() + Number(extendDays));
      membership.endDate = currentEnd;
      if (new Date(membership.endDate) > new Date()) {
        membership.status = 'active';
      }
    }
    await membership.save();

    let msg = `Admin updated your membership.`;
    if (status) msg += ` Status: ${membership.status}.`;
    if (extendDays) msg += ` Extended by ${extendDays} days (new end: ${membership.endDate.toLocaleDateString()}).`;
    await Notification.create({ userId: membership.userId, message: msg });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memberships/:id/auto-renew
const toggleAutoRenew = async (req, res) => {
  try {
    const membership = await Membership.findOne({ _id: req.params.id, userId: req.user._id });
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    membership.autoRenew = !membership.autoRenew;
    await membership.save();

    res.json({ message: `Auto-renew turned ${membership.autoRenew ? 'ON' : 'OFF'}`, autoRenew: membership.autoRenew });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyMemberships,
  buyMembership,
  startTrial,
  renewMembership,
  upgradeMembership,
  freezeMembership,
  unfreezeMembership,
  getAllMemberships,
  adminUpdateMembership,
  toggleAutoRenew
};
