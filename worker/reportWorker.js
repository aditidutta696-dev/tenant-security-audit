require('dotenv').config();

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const pool = require('../api/db');
const { cacheReport } = require('../api/cache');
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const reportWorker = new Worker(
  'report-generation',
  async (job) => {
    const { reportId, tenantId } = job.data;

    console.log(`Processing report ${reportId}`);

    const result = await pool.query(
      `SELECT id, tenant_id, title
       FROM reports
       WHERE id = $1 AND tenant_id = $2`,
      [reportId, tenantId]
    );

    if (!result.rows.length) {
      throw new Error('Report not found for this tenant');
    }

    const report = result.rows[0];

    const reportContent = {
      reportId: report.id,
      tenantId: report.tenant_id,
      title: report.title,
      generatedAt: new Date().toISOString(),
      content: `Generated report for ${report.title}`,
    };

    await pool.query(
      `UPDATE reports
       SET status = 'completed', result = $1
       WHERE id = $2 AND tenant_id = $3`,
      [JSON.stringify(reportContent), reportId, tenantId]
    );
    await cacheReport(reportId, reportContent);

console.log(`Report ${reportId} cached in Redis`);

    console.log(`Report ${reportId} completed`);
    return { success: true, reportId };
  },
  { connection }
);

reportWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

reportWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log('Report worker started');

process.on('SIGINT', async () => {
  await reportWorker.close();
  await connection.quit();
  await pool.end();
  process.exit(0);
});