// Script to create a superadmin user
import { db } from '../server/db';
import { users } from '../shared/schema';
import { hashPassword } from '../server/auth';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, 'tritunggalpancabuana@gmail.com'))
      .execute();
    
    if (existingUser.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash the password
    const hashedPassword = await hashPassword('@Albirru1921');
    
    // Create admin user
    const adminUser = {
      username: 'superadmin',
      password: hashedPassword,
      email: 'tritunggalpancabuana@gmail.com',
      fullName: 'Super Admin',
      type: 'admin',
    };
    
    const result = await db.insert(users).values(adminUser).returning();
    
    console.log('Admin user created successfully:', result[0].id);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();