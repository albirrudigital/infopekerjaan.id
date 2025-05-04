import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertMoodEntrySchema } from "@shared/schema";

const router = Router();

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Get all mood entries for the authenticated user
router.get("/mood-entries", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const entries = await storage.getMoodEntriesByUserId(req.user!.id);
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({ message: "Failed to fetch mood entries" });
  }
});

// Get a specific mood entry
router.get("/mood-entries/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.id);
    const entry = await storage.getMoodEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Mood entry not found" });
    }
    
    // Ensure users can only access their own entries
    if (entry.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching mood entry:", error);
    res.status(500).json({ message: "Failed to fetch mood entry" });
  }
});

// Create a new mood entry
router.post("/mood-entries", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = insertMoodEntrySchema.extend({
      mood: z.enum(["very_high", "high", "moderate", "low", "very_low"]),
      notes: z.string().min(3, "Notes should be at least 3 characters").max(500),
      activities: z.array(z.string()).min(1, "Select at least one activity"),
    });
    
    const validatedData = schema.parse({
      ...req.body,
      userId: req.user!.id,
    });
    
    const entry = await storage.createMoodEntry(validatedData);
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating mood entry:", error);
    res.status(500).json({ message: "Failed to create mood entry" });
  }
});

// Delete a mood entry
router.delete("/mood-entries/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.id);
    const entry = await storage.getMoodEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Mood entry not found" });
    }
    
    // Ensure users can only delete their own entries
    if (entry.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteMoodEntry(entryId);
    res.status(200).json({ message: "Mood entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    res.status(500).json({ message: "Failed to delete mood entry" });
  }
});

export const moodRouter = router;