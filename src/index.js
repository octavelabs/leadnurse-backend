require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollments');
const progressRoutes = require('./routes/progress');
const assessmentRoutes = require('./routes/assessments');
const certificateRoutes = require('./routes/certificates');
const facilityRoutes = require('./routes/facilityRoutes');
const healthcareRoleRoutes = require('./routes/healthcareRoleRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const workerRoutes = require('./routes/workerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const timesheetSignoffRoutes = require('./routes/timesheetSignoffRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use('/api', apiLimiter);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/healthcare-roles', healthcareRoleRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timesheet-signoff', timesheetSignoffRoutes);
app.use('/api/chapters', chapterRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
