const Joi = require('joi');

const appointmentTime = Joi.string()
  .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

const validators = {
  createAppointment: Joi.object({
    patientId: Joi.string().uuid().required(),
    doctorId: Joi.string().uuid().required(),
    appointmentDate: Joi.date().required(),
    appointmentTime: appointmentTime.required(),
    reason: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled', 'no-show')
      .optional(),
    consultationType: Joi.string()
      .valid('in-person', 'telemedicine', 'phone')
      .optional(),
    duration: Joi.number().integer().min(5).max(480).optional()
  }),

  updateAppointment: Joi.object({
    doctorId: Joi.string().uuid().optional(),
    appointmentDate: Joi.date().optional(),
    appointmentTime: appointmentTime.optional(),
    reason: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled', 'no-show')
      .optional(),
    consultationType: Joi.string()
      .valid('in-person', 'telemedicine', 'phone')
      .optional(),
    duration: Joi.number().integer().min(5).max(480).optional()
  }).min(1),

  createSlot: Joi.object({
    doctorId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    startTime: appointmentTime.required(),
    endTime: appointmentTime.required(),
    consultationType: Joi.string().valid('in-person', 'telemedicine', 'phone').optional()
  }),

  bookSlot: Joi.object({
    patientId: Joi.string().uuid().required(),
    reason: Joi.string().optional()
  })
};

module.exports = validators;
