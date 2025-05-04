import { Router } from 'express';
import { careerSimulatorService } from '../career-simulator-service';
import { 
  insertCareerScenarioSchema, 
  insertCareerDecisionSchema,
  insertAlternativeDecisionSchema,
  insertCareerComparisonSchema,
  insertScenarioPreferencesSchema
} from '../../shared/schema';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Get all scenarios for the current user
router.get('/scenarios', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const scenarios = await careerSimulatorService.getUserScenarios(userId);
    res.status(200).json(scenarios);
  } catch (error) {
    console.error('Error getting scenarios:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new scenario
router.post('/scenarios', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = insertCareerScenarioSchema.parse({
      ...req.body,
      userId
    });
    
    const scenario = await careerSimulatorService.createScenario(validatedData);
    res.status(201).json(scenario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific scenario
router.get('/scenarios/:id', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    const scenario = await careerSimulatorService.getScenario(scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    // Check if the scenario belongs to the current user
    if (scenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this scenario' });
    }
    
    res.status(200).json(scenario);
  } catch (error) {
    console.error('Error getting scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a scenario
router.put('/scenarios/:id', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    // Check if the scenario exists and belongs to the user
    const existingScenario = await careerSimulatorService.getScenario(scenarioId);
    if (!existingScenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    if (existingScenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this scenario' });
    }
    
    const updatedScenario = await careerSimulatorService.updateScenario(scenarioId, req.body);
    res.status(200).json(updatedScenario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a scenario
router.delete('/scenarios/:id', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    // Check if the scenario exists and belongs to the user
    const existingScenario = await careerSimulatorService.getScenario(scenarioId);
    if (!existingScenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    if (existingScenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this scenario' });
    }
    
    const deleted = await careerSimulatorService.deleteScenario(scenarioId);
    if (deleted) {
      res.status(200).json({ message: 'Scenario deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete scenario' });
    }
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate scenario outcome
router.post('/scenarios/:id/calculate', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    // Check if the scenario exists and belongs to the user
    const existingScenario = await careerSimulatorService.getScenario(scenarioId);
    if (!existingScenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    if (existingScenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this scenario' });
    }
    
    const outcome = await careerSimulatorService.calculateScenarioOutcome(scenarioId);
    res.status(200).json(outcome);
  } catch (error) {
    console.error('Error calculating outcome:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decision routes

// Get all decisions for a scenario
router.get('/scenarios/:id/decisions', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    // Check if the scenario exists and belongs to the user
    const existingScenario = await careerSimulatorService.getScenario(scenarioId);
    if (!existingScenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    if (existingScenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this scenario' });
    }
    
    const decisions = await careerSimulatorService.getScenarioDecisions(scenarioId);
    res.status(200).json(decisions);
  } catch (error) {
    console.error('Error getting decisions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a decision to a scenario
router.post('/scenarios/:id/decisions', isAuthenticated, async (req, res) => {
  try {
    const scenarioId = parseInt(req.params.id);
    if (isNaN(scenarioId)) {
      return res.status(400).json({ message: 'Invalid scenario ID' });
    }
    
    // Check if the scenario exists and belongs to the user
    const existingScenario = await careerSimulatorService.getScenario(scenarioId);
    if (!existingScenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    if (existingScenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this scenario' });
    }
    
    const validatedData = insertCareerDecisionSchema.parse({
      ...req.body,
      scenarioId
    });
    
    const decision = await careerSimulatorService.addDecision(validatedData);
    res.status(201).json(decision);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error adding decision:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a decision
router.put('/decisions/:id', isAuthenticated, async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);
    if (isNaN(decisionId)) {
      return res.status(400).json({ message: 'Invalid decision ID' });
    }
    
    // Verify authorization by checking if the related scenario belongs to the user
    const [decision] = await careerSimulatorService.updateDecision(decisionId, {});
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    
    const scenario = await careerSimulatorService.getScenario(decision.scenarioId);
    if (scenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this decision' });
    }
    
    const updatedDecision = await careerSimulatorService.updateDecision(decisionId, req.body);
    res.status(200).json(updatedDecision);
  } catch (error) {
    console.error('Error updating decision:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a decision
router.delete('/decisions/:id', isAuthenticated, async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);
    if (isNaN(decisionId)) {
      return res.status(400).json({ message: 'Invalid decision ID' });
    }
    
    // Verify authorization by checking if the related scenario belongs to the user
    const [decision] = await careerSimulatorService.updateDecision(decisionId, {});
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    
    const scenario = await careerSimulatorService.getScenario(decision.scenarioId);
    if (scenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this decision' });
    }
    
    const deleted = await careerSimulatorService.deleteDecision(decisionId);
    if (deleted) {
      res.status(200).json({ message: 'Decision deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete decision' });
    }
  } catch (error) {
    console.error('Error deleting decision:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alternative decision routes

// Get all alternatives for a decision
router.get('/decisions/:id/alternatives', isAuthenticated, async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);
    if (isNaN(decisionId)) {
      return res.status(400).json({ message: 'Invalid decision ID' });
    }
    
    // Verify authorization by checking if the related scenario belongs to the user
    const [decision] = await careerSimulatorService.updateDecision(decisionId, {});
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    
    const scenario = await careerSimulatorService.getScenario(decision.scenarioId);
    if (scenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this decision' });
    }
    
    const alternatives = await careerSimulatorService.getDecisionAlternatives(decisionId);
    res.status(200).json(alternatives);
  } catch (error) {
    console.error('Error getting alternatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an alternative to a decision
router.post('/decisions/:id/alternatives', isAuthenticated, async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);
    if (isNaN(decisionId)) {
      return res.status(400).json({ message: 'Invalid decision ID' });
    }
    
    // Verify authorization by checking if the related scenario belongs to the user
    const [decision] = await careerSimulatorService.updateDecision(decisionId, {});
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    
    const scenario = await careerSimulatorService.getScenario(decision.scenarioId);
    if (scenario.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this decision' });
    }
    
    const validatedData = insertAlternativeDecisionSchema.parse({
      ...req.body,
      originalDecisionId: decisionId
    });
    
    const alternative = await careerSimulatorService.addAlternativeDecision(validatedData);
    res.status(201).json(alternative);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error adding alternative:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comparison routes

// Get all comparisons for the current user
router.get('/comparisons', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const comparisons = await careerSimulatorService.getUserComparisons(userId);
    res.status(200).json(comparisons);
  } catch (error) {
    console.error('Error getting comparisons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new comparison
router.post('/comparisons', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = insertCareerComparisonSchema.parse({
      ...req.body,
      userId
    });
    
    // Verify that all scenarios in the comparison belong to the user
    const scenarioIds = validatedData.scenarioIds as number[];
    for (const id of scenarioIds) {
      const scenario = await careerSimulatorService.getScenario(id);
      if (!scenario || scenario.userId !== userId) {
        return res.status(403).json({ message: `Not authorized to include scenario ${id} in comparison` });
      }
    }
    
    const comparison = await careerSimulatorService.createComparison(validatedData);
    res.status(201).json(comparison);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating comparison:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comparison
router.delete('/comparisons/:id', isAuthenticated, async (req, res) => {
  try {
    const comparisonId = parseInt(req.params.id);
    if (isNaN(comparisonId)) {
      return res.status(400).json({ message: 'Invalid comparison ID' });
    }
    
    // Check if the comparison belongs to the user
    const [comparison] = await careerSimulatorService.getUserComparisons(req.user.id);
    const userComparison = comparison?.find(c => c.id === comparisonId);
    
    if (!userComparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }
    
    const deleted = await careerSimulatorService.deleteComparison(comparisonId);
    if (deleted) {
      res.status(200).json({ message: 'Comparison deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete comparison' });
    }
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User preferences routes

// Get user preferences
router.get('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await careerSimulatorService.getUserPreferences(userId);
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = insertScenarioPreferencesSchema.partial().parse(req.body);
    
    const updatedPreferences = await careerSimulatorService.updateUserPreferences(userId, validatedData);
    res.status(200).json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;