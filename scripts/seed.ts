import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { User } from "../src/models/User.js";
import { hashPassword } from "../src/utils/password.js";

async function main() {
  await connectDatabase();

  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@societysync.local";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123456";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Seed skipped: ${email} already exists`);
  } else {
    await User.create({
      email,
      password: await hashPassword(password),
      fullName: "Seed Super Admin",
      role: "SUPER_ADMIN",
    });
    console.log(`Seed complete: ${email} (SUPER_ADMIN)`);
  }

  await disconnectDatabase();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
