const express = require('express');

const config = require('../config/env');
const appointmentRoutes = require('./appointmentRoutes');

const router = express.Router();

router.use('/appointments', appointmentRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: config.app.serviceName,
    timestamp: new Date().toISOString()
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    name: config.app.serviceName,
    version: '1.0.0',
    description: 'Appointment Management Microservice',
    endpoints: {
      appointments: '/appointments',
      health: '/health'
    }
  });
});

module.exports = router;
