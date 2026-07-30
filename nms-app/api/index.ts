// Vercel serverless function — wraps the Express app.
// All /api/* requests are routed here by vercel.json.
import app from "../server/app";

export default app;
