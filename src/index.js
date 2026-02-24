const express = require('express');
const config = require('./config/env');
const db = require('./models');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json({ limit: config.server?.bodyLimit || '10mb' }));

// Routes
app.use(`${config.api.prefix}`, routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✓ Database connected');

    if (config.app.nodeEnv === 'development') {
      await db.sequelize.sync({ alter: true });
    }

    const server = app.listen(config.app.port, '0.0.0.0', () => {
      console.log(`\nAppointment Service running on port ${config.app.port}`);
    });

    process.on('SIGTERM', async () => {
      server.close(async () => {
        await db.sequelize.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
