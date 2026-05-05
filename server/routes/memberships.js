// Membership routes
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyMemberships);
router.post('/buy', protect, buyMembership);
router.post('/trial', protect, startTrial);
router.put('/renew/:id', protect, renewMembership);
router.put('/upgrade/:id', protect, upgradeMembership);
router.post('/freeze', protect, freezeMembership);
router.post('/unfreeze', protect, unfreezeMembership);
router.put('/:id/auto-renew', protect, toggleAutoRenew);

router.get('/all', protect, adminOnly, getAllMemberships);
router.put('/admin/update/:id', protect, adminOnly, adminUpdateMembership);

module.exports = router;
