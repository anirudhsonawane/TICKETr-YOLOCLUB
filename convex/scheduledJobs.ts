import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Temporarily disabled scheduled jobs to fix deployment
// TODO: Re-enable after fixing cron configuration
// crons.hourly(
//   "cleanup expired payment sessions",
//   { hourUTC: 0 }, // Run at the top of every hour
//   internal.paymentSessions.cleanupExpiredSessions
// );

export default crons;
