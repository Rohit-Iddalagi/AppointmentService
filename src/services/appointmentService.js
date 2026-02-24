const axios = require('axios');
const { Op } = require('sequelize');

const config = require('../config/env');
const { Appointment } = require('../models');

class AppointmentService {
  async verifyPatient(patientId) {
    try {
      await axios.get(`${config.services.patientService}${config.api.prefix}/patients/${patientId}`);
    } catch (error) {
      const status = error.response?.status;
      const notFound = status === 404;
      const serviceDown = !status;

      const e = new Error(
        notFound
          ? 'Patient not found'
          : serviceDown
            ? 'Unable to verify patient at this time'
            : 'Patient verification failed'
      );
      e.statusCode = notFound ? 404 : 502;
      throw e;
    }
  }

  async createAppointment(data) {
    await this.verifyPatient(data.patientId);

    const conflict = await Appointment.findOne({
      where: {
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (conflict) {
      const e = new Error('Patient already has an appointment at this time');
      e.statusCode = 409;
      throw e;
    }

    return Appointment.create(data);
  }

  async getAllAppointments(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;

    if (filters.fromDate && filters.toDate) {
      where.appointmentDate = {
        [Op.between]: [filters.fromDate, filters.toDate]
      };
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      offset,
      limit,
      order: [['appointmentDate', 'ASC']]
    });

    return {
      appointments: rows,
      total: count,
      page,
      limit
    };
  }

  async getAppointmentById(appointmentId) {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      const e = new Error('Appointment not found');
      e.statusCode = 404;
      throw e;
    }
    return appointment;
  }

  async getAppointmentsByPatientId(patientId, filters = {}) {
    const where = { patientId };
    if (filters.status) where.status = filters.status;
    if (filters.fromDate && filters.toDate) {
      where.appointmentDate = {
        [Op.between]: [filters.fromDate, filters.toDate]
      };
    }

    return Appointment.findAll({
      where,
      order: [['appointmentDate', 'DESC']]
    });
  }

  async updateAppointment(appointmentId, data) {
    const appointment = await this.getAppointmentById(appointmentId);
    await appointment.update(data);
    return appointment;
  }

  async cancelAppointment(appointmentId, reason = null) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status === 'cancelled') {
      const e = new Error('Appointment is already cancelled');
      e.statusCode = 400;
      throw e;
    }

    const notes = reason
      ? `${appointment.notes || ''}\nCancellation reason: ${reason}`.trim()
      : appointment.notes;

    await appointment.update({
      status: 'cancelled',
      notes
    });

    return appointment;
  }

  async getUpcomingAppointments(patientId, daysAhead = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return Appointment.findAll({
      where: {
        patientId,
        appointmentDate: {
          [Op.between]: [today, futureDate]
        },
        status: { [Op.ne]: 'cancelled' }
      },
      order: [['appointmentDate', 'ASC']]
    });
  }

  async getAppointmentStats(patientId) {
    const total = await Appointment.count({ where: { patientId } });
    const completed = await Appointment.count({
      where: { patientId, status: 'completed' }
    });
    const scheduled = await Appointment.count({
      where: { patientId, status: 'scheduled' }
    });
    const cancelled = await Appointment.count({
      where: { patientId, status: 'cancelled' }
    });
    const noShow = await Appointment.count({
      where: { patientId, status: 'no-show' }
    });

    return { total, completed, scheduled, cancelled, noShow };
  }
}

module.exports = new AppointmentService();
