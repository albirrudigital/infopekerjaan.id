import { db } from "../server/db";
import { users, userProfileCompletions } from "../shared/schema";
import { profileCompletionService } from "../server/profile-completion-service";
import { eq } from "drizzle-orm";

async function initializeAllUsersProfileCompletion() {
  console.log("Starting initialization of profile completion for all users...");
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  console.log(`Found ${allUsers.length} users to process`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Process each user
  for (const user of allUsers) {
    try {
      // Get user type
      const userType = user.type;
      
      // Check if user already has profile completion items
      const existingItems = await db.select()
        .from(userProfileCompletions)
        .where(eq(userProfileCompletions.userId, user.id));
      
      if (existingItems.length > 0) {
        console.log(`Skipping user ${user.id} (${user.username}) - already has ${existingItems.length} profile completion items`);
        skippedCount++;
        continue;
      }
      
      // Initialize profile completion for new users only
      await profileCompletionService.initializeProfileCompletion(user.id, userType);
      
      console.log(`Initialized profile completion for user ${user.id} (${user.username}) of type ${userType}`);
      successCount++;
    } catch (error) {
      console.error(`Error initializing profile completion for user ${user.id}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\nProfile completion initialization completed!`);
  console.log(`Success: ${successCount} users`);
  console.log(`Skipped: ${skippedCount} users`);
  console.log(`Errors: ${errorCount} users`);
}

async function main() {
  try {
    await initializeAllUsersProfileCompletion();
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    process.exit(0);
  }
}

main();