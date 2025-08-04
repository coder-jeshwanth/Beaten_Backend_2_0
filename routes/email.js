const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/emailController');

router.post('/send-email', sendContactEmail);

module.exports = router; 