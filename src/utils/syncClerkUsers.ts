import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClerkClient } from "@clerk/backend";
import { connectDB } from "../config/database";
import { User } from "../models/User";

dotenv.config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function syncClerkUsers() {
  await connectDB();

  const { data: clerkUsers } = await clerk.users.getUserList({ limit: 100 });

  for (const u of clerkUsers) {
    const role = (u.publicMetadata?.role as string) === "admin" ? "admin" : "user";
    const email = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ?? "";

    await User.findOneAndUpdate(
      { clerkId: u.id },
      {
        $set: {
          email,
          name: [u.firstName, u.lastName].filter(Boolean).join(" "),
          imageUrl: u.imageUrl ?? "",
          role,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Synced ${email || u.id} (${role})`);
  }

  console.log(`✅ Synced ${clerkUsers.length} users`);
  await mongoose.disconnect();
  process.exit(0);
}

syncClerkUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});