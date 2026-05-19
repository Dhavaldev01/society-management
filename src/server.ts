import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
//   app.listen(env.PORT, () => {
//     console.log(`API listening on http://localhost:${env.PORT}`);
//   });
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API listening on http://192.168.1.5:${env.PORT}`);
});
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
