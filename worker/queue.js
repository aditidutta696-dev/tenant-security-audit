require('dotenv').config();

const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const reportQueue = new Queue('report-generation', {
  connection,
});

module.exports = { reportQueue, connection };