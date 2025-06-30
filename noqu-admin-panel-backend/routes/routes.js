const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // JWT middleware
const requireRole = require('../middlewares/requireRole');
const { uploadAgreement } = require('../middlewares/upload');


const {
  subscribe,
  unsubscribe,
  getSubscribers,
  getUnsubscribers,
  sendNewsletter,
  sendNewsletterByEmail,
  deleteSubscriber,
} = require('../controllers/subscribersController');

const {
  newslist,
  fullnews,
  addNews,
  deleteNews,
  getNews,
  editNews,
} = require('../controllers/newsController');

const {
  loginAdmin,
  registerCP, 
  getCPRequests,
  getCPRequestById,
  approveCPRequest,
  rejectCPRequest,
  getCPMembers,
  updateCPMember,
  getCPMemberById,
  resendTempPassword,
  loginCP,
  resetPassword,
  addLead,
  getLeads,
  getLeadDetail,
  cpAgreement,
  getCPBusinessCommissions,
  updateLeadStageWithDetails,
} = require('../controllers/cpController');

//Login route
router.post('/db/login-admin', loginAdmin);

// Newsletter routes
router.post('/db/subscribe', subscribe);
router.post('/db/unsubscribe', unsubscribe);
router.post('/db/data', auth, requireRole('admin'), getSubscribers);
router.post('/db/Unsubdata', auth, requireRole('admin'), getUnsubscribers);
router.post('/db/send-newsletter', auth, requireRole('admin'), sendNewsletter);
router.post('/db/send-newsletter-bymail', auth, requireRole('admin'), sendNewsletterByEmail);
router.post('/db/delete', auth, requireRole('admin'), deleteSubscriber);

// News routes
router.get('/db/news', newslist);
router.get('/db/news/slug/:slug', fullnews);
router.post('/db/add-news', auth, requireRole('admin'), addNews);
router.post('/db/delete-news', auth, requireRole('admin'), deleteNews);
router.post('/db/get-news', getNews);
router.post('/db/edit-news', auth, requireRole('admin'), editNews);

// Channel Partner (CP) routes
router.post('/db/register-cp', registerCP);
router.get('/db/get-cp-requests', auth, requireRole('admin', 'accounts'), getCPRequests);
router.get('/db/get-cp-request/:id', auth, requireRole('admin', 'accounts'), getCPRequestById);
router.post('/db/approve-cp-request', auth, requireRole('admin', 'accounts'), approveCPRequest);
router.post('/db/reject-cp-request', auth, requireRole('admin', 'accounts'), rejectCPRequest);

// Auth routes (Login + Password Reset)
router.post('/db/login-cp', loginCP);
router.post('/db/reset-password', resetPassword);
router.post('/db/resend-temp-password', resendTempPassword);

// Protected routes — require JWT token
router.get('/db/get-cp-members',auth, requireRole('admin', 'accounts'), getCPMembers);
router.get('/db/get-cp-details/:id', auth, requireRole('cp', 'admin', 'accounts'), getCPMemberById);
router.post('/db/update-cp-member', auth, requireRole('cp', 'admin', 'accounts'), updateCPMember);

// Lead routes 
router.post('/db/add-lead', auth, requireRole('cp'), addLead);
router.get('/db/get-leads/:userId', auth, requireRole('cp'), getLeads);
router.get('/db/lead-detail/:leadId', auth, requireRole('cp'), getLeadDetail);
router.post('/db/upload-agreement', auth, requireRole('cp'), uploadAgreement, cpAgreement);

router.get('/db/get-commissions/:userId', auth, requireRole('cp'), getCPBusinessCommissions);
router.post('/db/update-lead-stage-details', updateLeadStageWithDetails);


module.exports = router;
