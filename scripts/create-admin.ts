import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    // Check if admin already exists
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "tritunggalpancabuana@gmail.com"));

    if (adminUser) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash password
    const password = await hashPassword("@Albirru1921");

    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        username: "superadmin",
        password,
        email: "tritunggalpancabuana@gmail.com",
        fullName: "Super Admin",
        type: "admin",
        phone: null,
        createdAt: new Date()
      })
      .returning();

    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password: @Albirru1921");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();