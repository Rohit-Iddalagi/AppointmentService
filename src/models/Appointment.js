const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    appointmentTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no-show'),
      defaultValue: 'scheduled'
    },
    consultationType: {
      type: DataTypes.ENUM('in-person', 'telemedicine', 'phone'),
      defaultValue: 'in-person'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true
  });

  return Appointment;
};
