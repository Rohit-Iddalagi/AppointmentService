const appointmentService = require('../services/appointmentService');
const responseFormatter = require('../utils/responseFormatter');

class AppointmentController {
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res
        .status(201)
        .json(responseFormatter.created(appointment, 'Appointment scheduled successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        patientId,
        doctorId,
        fromDate,
        toDate
      } = req.query;

      const result = await appointmentService.getAllAppointments(
        parseInt(page, 10),
        parseInt(limit, 10),
        { status, patientId, doctorId, fromDate, toDate }
      );

      res.json(
        responseFormatter.paginated(
          result.appointments,
          { total: result.total, page: result.page, limit: result.limit },
          'Appointments retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const appointment = await appointmentService.getAppointmentById(req.params.id);
      res.json(responseFormatter.success(appointment, 'Appointment retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getByPatientId(req, res, next) {
    try {
      const { patientId } = req.params;
      const { status, fromDate, toDate } = req.query;
      const appointments = await appointmentService.getAppointmentsByPatientId(
        patientId,
        { status, fromDate, toDate }
      );
      res.json(
        responseFormatter.success(
          appointments,
          'Patient appointments retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
      res.json(responseFormatter.success(appointment, 'Appointment updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const appointment = await appointmentService.cancelAppointment(
        req.params.id,
        req.body.reason
      );
      res.json(responseFormatter.success(appointment, 'Appointment cancelled successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const daysAhead = parseInt(req.query.daysAhead || '30', 10);
      const appointments = await appointmentService.getUpcomingAppointments(
        req.params.patientId,
        daysAhead
      );
      res.json(responseFormatter.success(appointments, 'Upcoming appointments retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await appointmentService.getAppointmentStats(req.params.patientId);
      res.json(responseFormatter.success(stats, 'Appointment statistics retrieved'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();
