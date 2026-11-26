const { reportQueue } = require('../worker/queue');
const express = require('express');
const pool = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// List reports belonging to the authenticated tenant
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { getCachedReport } = require('./cache');

    // Intentionally vulnerable: cache lookup does not check tenant ownership.
    const cachedReport = await getCachedReport(req.params.id);

    if (cachedReport) {
      return res.json({ report: cachedReport });
    }

    // Database fallback checks tenant ownership.
    const result = await pool.query(
      `SELECT id, title, status, result
       FROM reports
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Report retrieval error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

    const result = await pool.query(
      `SELECT id
       FROM reports
       WHERE id = $1 AND tenant_id = $2`,
      [reportId, req.user.tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const job = await reportQueue.add('generate-report', {
      reportId,
      tenantId: req.user.tenantId,
      requestedBy: req.user.id,
    });

    await pool.query(
      `UPDATE reports
       SET status = 'queued'
       WHERE id = $1 AND tenant_id = $2`,
      [reportId, req.user.tenantId]
    );

    res.status(202).json({
      message: 'Report generation queued',
      jobId: job.id,
      reportId,
    });
  } catch (error) {
    console.error('Report generation error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
