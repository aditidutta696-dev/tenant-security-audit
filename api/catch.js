require('dotenv').config();

const Redis = require('ioredis');

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});

async function cacheReport(reportId, reportData) {
  await redis.set(
    `report:${reportId}`,
    JSON.stringify(reportData),
    'EX',
    300
  );
}

async function getCachedReport(reportId) {
  const data = await redis.get(`report:${reportId}`);
  return data ? JSON.parse(data) : null;
}

module.exports = {
  redis,
  cacheReport,
  getCachedReport,
};