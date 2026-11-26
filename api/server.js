
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
const authRoutes = require('./authRoutes');

app.use('/api/auth', authRoutes);
const reportRoutes = require('./reportRoutes');

app.use('/api/reports', reportRoutes);

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS database_time'
    );

    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].database_time,
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Tenant Audit API running on port ${PORT}`);
});
