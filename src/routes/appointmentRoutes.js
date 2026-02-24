const express = require('express');

const appointmentController = require('../controllers/appointmentController');
const validate = require('../middleware/validation');
const validators = require('../utils/validators');

const router = express.Router();

router.post(
  '/',
  validate(validators.createAppointment),
  appointmentController.create.bind(appointmentController)
);
router.get('/', appointmentController.getAll.bind(appointmentController));
router.get(
  '/patient/:patientId/all',
  appointmentController.getByPatientId.bind(appointmentController)
);
router.get(
  '/patient/:patientId/upcoming',
  appointmentController.getUpcoming.bind(appointmentController)
);
router.get(
  '/patient/:patientId/stats',
  appointmentController.getStats.bind(appointmentController)
);
router.get('/:id', appointmentController.getById.bind(appointmentController));
router.put(
  '/:id',
  validate(validators.updateAppointment),
  appointmentController.update.bind(appointmentController)
);
router.post('/:id/cancel', appointmentController.cancel.bind(appointmentController));

module.exports = router;
