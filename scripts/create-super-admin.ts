import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@dropxcorp.in";
  const password = "DropXcorp@2026";

  const passwordHash = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Super Admin already exists:");
    console.log({
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    });

    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "DropXcorp Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Super Admin created successfully:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create Super Admin:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });