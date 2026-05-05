// Handles fetching and reading notifications
const Notification = require('../models/Notification');
const Membership = require('../models/Membership');

const getMyNotifications = async (req, res) => {
  try {
    // Also check for 3-day expiry warnings here
    const memberships = await Membership.find({ userId: req.user._id, status: 'active' }).populate('planId');
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    for (let m of memberships) {
      if (new Date(m.endDate) <= threeDaysFromNow && new Date(m.endDate) > now) {
        // Check if warning already exists to avoid spam
        const exists = await Notification.findOne({
          userId: req.user._id,
          message: `Warning: Your ${m.planId.name} membership expires within 3 days!`
        });
        if (!exists) {
          await Notification.create({
            userId: req.user._id,
            message: `Warning: Your ${m.planId.name} membership expires within 3 days!`
          });
        }
      }
    }

    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });
    
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead };
