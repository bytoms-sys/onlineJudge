const Queue = require('bull');

// Create submission processing queue
const submissionQueue = new Queue('code-submissions', {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    // Use the same Redis connection as your existing redisClient
    // You can extract connection info from process.env.REDIS_URL if needed
  }
});

// Add event handlers for monitoring
submissionQueue.on('error', (error) => {
  console.error('Submission queue error:', error);
});

submissionQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting for processing`);
});

submissionQueue.on('active', (job) => {
  console.log(`Processing job ${job.id}`);
});

submissionQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

submissionQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

module.exports = {
  submissionQueue
};