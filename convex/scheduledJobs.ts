import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired payment sessions every hour
crons.hourly(
  "cleanup expired payment sessions",
  { hour: 0, minute: 0 }, // Run at the top of every hour
  internal.paymentSessions.cleanupExpiredSessions
);

export default crons;
