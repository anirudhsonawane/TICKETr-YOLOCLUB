const { ConvexHttpClient } = require("convex/browser");

const getConvexClient = () => {
  if (!process.env.CONVEX_URL) {
    throw new Error("CONVEX_URL is not set");
  }
  return new ConvexHttpClient(process.env.CONVEX_URL);
};

module.exports = { getConvexClient };
