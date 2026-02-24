require('dotenv').config();

const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3002,
    serviceName: process.env.SERVICE_NAME || 'appointment-service',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  database: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'hospital_appointment_db'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiry: process.env.JWT_EXPIRY || '24h'
  },

  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api/v1'
  },

  services: {
    patientService: process.env.PATIENT_SERVICE_URL || 'http://localhost:3001',
    doctorService: process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003'
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  server: {
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
    bodyLimit: process.env.BODY_LIMIT || '10mb'
  }
};

module.exports = config;
