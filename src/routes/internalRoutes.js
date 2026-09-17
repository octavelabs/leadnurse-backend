const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const { runScheduledChecks } = require('../jobs/scheduledChecks');

// Protected by a shared secret (not user auth) — meant to be hit by an external
// cron pinger (cron-job.org, GitHub Actions schedule, etc.) since this app has
// no in-process scheduler. Accepts the secret via header or query string so it
// works with pingers that can't set custom headers.
function requireCronSecret(req, res, next) {
  const provided = req.headers['x-cron-secret'] || req.query.secret;
  if (!process.env.CRON_SECRET) return error(res, 'CRON_SECRET is not configured on the server', 500);
  if (!provided || provided !== process.env.CRON_SECRET) return error(res, 'Unauthorized', 401);
  next();
}

router.all('/scheduled-checks', requireCronSecret, async (req, res, next) => {
  try {
    const result = await runScheduledChecks();
    success(res, result, 'Scheduled checks completed');
  } catch (err) { next(err); }
});

module.exports = router;
