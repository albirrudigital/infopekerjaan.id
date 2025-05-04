import { db, pool } from "../server/db";
import { profileCompletionItems, userProfileCompletions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function initializeProfileCompletionForUser(userId: number, userType: string) {
  console.log(`Initializing profile completion for user ID ${userId}, type: ${userType}`);

  try {
    // Check if user already has profile completion items
    const existingCompletions = await db.select().from(userProfileCompletions).where(eq(userProfileCompletions.userId, userId));
    
    if (existingCompletions.length > 0) {
      console.log(`User ${userId} already has ${existingCompletions.length} profile completion entries.`);
      return existingCompletions;
    }
    
    // Get all completion items for this user type
    const items = await db.select().from(profileCompletionItems).where(
      eq(profileCompletionItems.userType, userType)
    );
    
    if (items.length === 0) {
      console.log(`No profile completion items found for user type: ${userType}`);
      return [];
    }
    
    console.log(`Found ${items.length} profile completion items for user type: ${userType}`);
    
    // Create profile completion entries for this user
    const completions = [];
    
    for (const item of items) {
      const [completion] = await db.insert(userProfileCompletions).values({
        userId: userId,
        itemId: item.id,
        completed: false
      }).returning();
      
      completions.push(completion);
    }
    
    console.log(`Successfully initialized ${completions.length} profile completion items for user ${userId}`);
    
    return completions;
  } catch (error) {
    console.error("Error initializing profile completion for user:", error);
    throw error;
  }
}

async function main() {
  // Get command line arguments
  const userId = process.argv[2] ? parseInt(process.argv[2]) : undefined;
  const userType = process.argv[3] || "jobseeker";
  
  if (!userId) {
    console.error("Please provide user ID as the first argument");
    process.exit(1);
  }
  
  await initializeProfileCompletionForUser(userId, userType);
  
  // Close the connection pool
  await pool.end();
  
  process.exit(0);
}

main().catch(error => {
  console.error("Error in initialization script:", error);
  process.exit(1);
});