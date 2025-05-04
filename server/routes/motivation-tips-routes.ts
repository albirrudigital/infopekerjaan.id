import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// Get all motivation tips
router.get("/", async (req: Request, res: Response) => {
  try {
    const tips = await storage.getAllMotivationTips();
    res.status(200).json(tips);
  } catch (error) {
    console.error("Error fetching motivation tips:", error);
    res.status(500).json({ message: "Failed to fetch motivation tips" });
  }
});

// Get motivation tips by motivation level
router.get("/by-mood/:mood", async (req: Request, res: Response) => {
  try {
    const mood = req.params.mood as "very_high" | "high" | "moderate" | "low" | "very_low";
    const tips = await storage.getMotivationTipsByMood(mood);
    res.status(200).json(tips);
  } catch (error) {
    console.error("Error fetching motivation tips by mood:", error);
    res.status(500).json({ message: "Failed to fetch motivation tips" });
  }
});

// Get motivation tips by category
router.get("/by-category/:category", async (req: Request, res: Response) => {
  try {
    const category = req.params.category as 
      "career_development" | "mental_health" | "job_search" | "interview_preparation" | "networking";
    const tips = await storage.getMotivationTipsByCategory(category);
    res.status(200).json(tips);
  } catch (error) {
    console.error("Error fetching motivation tips by category:", error);
    res.status(500).json({ message: "Failed to fetch motivation tips" });
  }
});

export const motivationTipsRouter = router;