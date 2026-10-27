const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const profileRoutes = require('./routes/profile.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const historyRoutes = require('./routes/history.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/history', historyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;