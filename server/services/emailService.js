// Email notification service using Nodemailer
// Uses ethereal.email for testing (no real SMTP credentials needed)
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use environment SMTP if available, otherwise create ethereal test account
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Create ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`Ethereal email account created: ${testAccount.user}`);
  }

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"LNMIIT Gym" <gym@lnmiit.ac.in>',
      to,
      subject,
      html
    });
    // Log preview URL for ethereal testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email preview: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

const sendExpiryReminder = async (email, planName, daysLeft) => {
  return sendEmail(email, 'Membership Expiring Soon!', `
    <h2>LNMIIT Gym — Expiry Reminder</h2>
    <p>Your <strong>${planName}</strong> membership expires in <strong>${daysLeft} day(s)</strong>.</p>
    <p>Please renew your membership to continue enjoying the gym facilities.</p>
  `);
};

const sendExpiredAlert = async (email, planName) => {
  return sendEmail(email, 'Membership Expired', `
    <h2>LNMIIT Gym — Membership Expired</h2>
    <p>Your <strong>${planName}</strong> membership has expired.</p>
    <p>Visit the portal to renew or upgrade your plan.</p>
  `);
};

const sendRenewalConfirmation = async (email, planName, endDate) => {
  return sendEmail(email, 'Membership Renewed!', `
    <h2>LNMIIT Gym — Renewal Confirmation</h2>
    <p>Your <strong>${planName}</strong> membership has been renewed successfully.</p>
    <p>New end date: <strong>${new Date(endDate).toLocaleDateString()}</strong></p>
  `);
};

const sendTrialExpiryReminder = async (email) => {
  return sendEmail(email, 'Free Trial Ending Soon!', `
    <h2>LNMIIT Gym — Trial Expiry</h2>
    <p>Your 2-day free trial is about to expire.</p>
    <p>Subscribe to a plan to keep accessing the gym!</p>
  `);
};

module.exports = {
  sendExpiryReminder,
  sendExpiredAlert,
  sendRenewalConfirmation,
  sendTrialExpiryReminder
};
