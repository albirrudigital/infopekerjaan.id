import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import {
  careerScenarios,
  careerDecisions,
  alternativeDecisions,
  careerComparisons,
  scenarioPreferences,
  InsertCareerScenario,
  InsertCareerDecision,
  InsertAlternativeDecision,
  InsertCareerComparison,
  InsertScenarioPreference,
  CareerScenario,
  CareerDecision,
  AlternativeDecision,
  CareerComparison,
  ScenarioPreference,
  DecisionType
} from '../shared/schema';

/**
 * Service for managing career scenario simulations
 */
export class CareerSimulatorService {
  /**
   * Create a new career scenario
   */
  async createScenario(data: InsertCareerScenario): Promise<CareerScenario> {
    const [scenario] = await db.insert(careerScenarios).values(data).returning();
    return scenario;
  }

  /**
   * Get a career scenario by ID
   */
  async getScenario(id: number): Promise<CareerScenario | undefined> {
    const [scenario] = await db.select().from(careerScenarios).where(eq(careerScenarios.id, id));
    return scenario;
  }

  /**
   * Get all career scenarios for a user
   */
  async getUserScenarios(userId: number): Promise<CareerScenario[]> {
    return await db.select().from(careerScenarios)
      .where(eq(careerScenarios.userId, userId))
      .orderBy(desc(careerScenarios.updatedAt));
  }

  /**
   * Update a career scenario
   */
  async updateScenario(id: number, data: Partial<CareerScenario>): Promise<CareerScenario | undefined> {
    const [updated] = await db.update(careerScenarios)
      .set(data)
      .where(eq(careerScenarios.id, id))
      .returning();
    return updated;
  }

  /**
   * Delete a career scenario
   */
  async deleteScenario(id: number): Promise<boolean> {
    // First delete all related decisions
    await db.delete(careerDecisions).where(eq(careerDecisions.scenarioId, id));
    
    // Then delete the scenario
    const [deleted] = await db.delete(careerScenarios)
      .where(eq(careerScenarios.id, id))
      .returning();
    
    return !!deleted;
  }

  /**
   * Add a decision to a scenario
   */
  async addDecision(data: InsertCareerDecision): Promise<CareerDecision> {
    const [decision] = await db.insert(careerDecisions).values(data).returning();
    return decision;
  }

  /**
   * Get all decisions for a scenario
   */
  async getScenarioDecisions(scenarioId: number): Promise<CareerDecision[]> {
    return await db.select().from(careerDecisions)
      .where(eq(careerDecisions.scenarioId, scenarioId))
      .orderBy(careerDecisions.timepoint);
  }

  /**
   * Update a decision
   */
  async updateDecision(id: number, data: Partial<CareerDecision>): Promise<CareerDecision | undefined> {
    const [updated] = await db.update(careerDecisions)
      .set(data)
      .where(eq(careerDecisions.id, id))
      .returning();
    return updated;
  }

  /**
   * Delete a decision
   */
  async deleteDecision(id: number): Promise<boolean> {
    // Delete all alternative decisions first
    await db.delete(alternativeDecisions).where(eq(alternativeDecisions.originalDecisionId, id));
    
    // Then delete the decision
    const [deleted] = await db.delete(careerDecisions)
      .where(eq(careerDecisions.id, id))
      .returning();
    
    return !!deleted;
  }

  /**
   * Add an alternative decision
   */
  async addAlternativeDecision(data: InsertAlternativeDecision): Promise<AlternativeDecision> {
    const [alternative] = await db.insert(alternativeDecisions).values(data).returning();
    return alternative;
  }

  /**
   * Get all alternatives for a decision
   */
  async getDecisionAlternatives(decisionId: number): Promise<AlternativeDecision[]> {
    return await db.select().from(alternativeDecisions)
      .where(eq(alternativeDecisions.originalDecisionId, decisionId));
  }

  /**
   * Create a comparison between scenarios
   */
  async createComparison(data: InsertCareerComparison): Promise<CareerComparison> {
    const [comparison] = await db.insert(careerComparisons).values(data).returning();
    return comparison;
  }

  /**
   * Get a user's saved comparisons
   */
  async getUserComparisons(userId: number): Promise<CareerComparison[]> {
    return await db.select().from(careerComparisons)
      .where(eq(careerComparisons.userId, userId))
      .orderBy(desc(careerComparisons.updatedAt));
  }

  /**
   * Delete a comparison
   */
  async deleteComparison(id: number): Promise<boolean> {
    const [deleted] = await db.delete(careerComparisons)
      .where(eq(careerComparisons.id, id))
      .returning();
    
    return !!deleted;
  }

  /**
   * Get or create user preferences for the simulator
   */
  async getUserPreferences(userId: number): Promise<ScenarioPreference> {
    const [existing] = await db.select().from(scenarioPreferences)
      .where(eq(scenarioPreferences.userId, userId));
    
    if (existing) {
      return existing;
    }
    
    // Create default preferences if none exist
    const [created] = await db.insert(scenarioPreferences)
      .values({ userId })
      .returning();
    
    return created;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: number, data: Partial<ScenarioPreference>): Promise<ScenarioPreference> {
    // Check if preferences exist
    const existing = await this.getUserPreferences(userId);
    
    // Update the preferences
    const [updated] = await db.update(scenarioPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scenarioPreferences.id, existing.id))
      .returning();
    
    return updated;
  }

  /**
   * Calculate the outcome of a career scenario based on decisions
   * This is a complex calculation that would combine various factors
   */
  async calculateScenarioOutcome(scenarioId: number): Promise<any> {
    // Get the scenario
    const scenario = await this.getScenario(scenarioId);
    if (!scenario) throw new Error('Scenario not found');
    
    // Get all active decisions
    const decisions = await db.select()
      .from(careerDecisions)
      .where(and(
        eq(careerDecisions.scenarioId, scenarioId),
        eq(careerDecisions.isActive, true)
      ))
      .orderBy(careerDecisions.timepoint);
    
    // In a real implementation, this would involve a complex calculation
    // based on the scenario's starting point, decisions, and market data
    
    // This is a simplified outcome calculation
    const outcome = {
      endRole: scenario.targetRole,
      projectedSalary: this.calculateProjectedSalary(scenario, decisions),
      acquiredSkills: this.calculateAcquiredSkills(scenario, decisions),
      marketAlignment: this.calculateMarketAlignment(scenario, decisions),
      satisfactionProjection: this.calculateSatisfactionProjection(scenario, decisions),
      employmentSecurity: this.calculateEmploymentSecurity(scenario, decisions),
      growthPotential: this.calculateGrowthPotential(scenario, decisions),
      comparableRoles: this.findComparableRoles(scenario, decisions)
    };
    
    // Update the scenario with the calculated outcome
    await this.updateScenario(scenarioId, { outcomes: outcome });
    
    return outcome;
  }
  
  // Helper methods for outcome calculation
  
  private calculateProjectedSalary(scenario: CareerScenario, decisions: CareerDecision[]): any {
    // Starting with the base salary
    let baseSalary = scenario.startingSalary;
    
    // Apply the impact of each decision
    for (const decision of decisions) {
      const impact = decision.impact as any;
      
      // Immediate change
      baseSalary += baseSalary * (impact.salaryImpact?.immediateChange || 0);
      
      // Growth over time
      // For simplicity, we're not considering compound growth here
      const timeInYears = decision.timepoint / 12;
      baseSalary += baseSalary * (impact.salaryImpact?.projectedChangeRate || 0) * timeInYears;
    }
    
    // Calculate ranges based on the final projected salary
    return {
      min: Math.round(baseSalary * 0.8),
      max: Math.round(baseSalary * 1.2),
      median: Math.round(baseSalary),
      percentile75: Math.round(baseSalary * 1.1),
      percentile90: Math.round(baseSalary * 1.15)
    };
  }
  
  private calculateAcquiredSkills(scenario: CareerScenario, decisions: CareerDecision[]): any {
    // Start with initial skills
    const startingSkills = scenario.startingSkills as any[];
    const acquiredSkills = [...startingSkills];
    
    // Apply skill changes from decisions
    for (const decision of decisions) {
      const impact = decision.impact as any;
      
      // Process skill deltas
      for (const skillDelta of (impact.skillDelta || [])) {
        // Find the skill category to update
        const category = this.findSkillCategory(acquiredSkills, skillDelta);
        
        if (category) {
          // Update existing skill
          const skillIndex = category.skills.findIndex(s => s.id === skillDelta.skillId);
          
          if (skillIndex >= 0) {
            category.skills[skillIndex].level = Math.min(
              1,
              Math.max(0, category.skills[skillIndex].level + skillDelta.levelChange)
            );
          } else {
            // Add new skill
            category.skills.push({
              id: skillDelta.skillId,
              name: `Skill ${skillDelta.skillId}`, // This would be a lookup in a real implementation
              level: Math.min(1, Math.max(0, skillDelta.levelChange)),
              relevance: 0.8, // Default relevance
              trending: false
            });
          }
          
          // Recalculate category overall level
          category.overallLevel = category.skills.reduce((sum, skill) => sum + skill.level, 0) / category.skills.length;
        }
      }
    }
    
    return acquiredSkills;
  }
  
  private findSkillCategory(skillSets: any[], skillDelta: any): any {
    // In a real implementation, this would look up the skill's category
    // For simplicity, we'll just put it in the first category or create a new one
    
    if (skillSets.length === 0) {
      // Create a new category
      const newCategory = {
        skills: [],
        category: 'General Skills',
        overallLevel: 0
      };
      skillSets.push(newCategory);
      return newCategory;
    }
    
    return skillSets[0];
  }
  
  private calculateMarketAlignment(scenario: CareerScenario, decisions: CareerDecision[]): number {
    // This would use market data to determine alignment
    // For simplicity, we'll generate a random score between 0.4 and 0.9
    return 0.4 + Math.random() * 0.5;
  }
  
  private calculateSatisfactionProjection(scenario: CareerScenario, decisions: CareerDecision[]): number {
    // This would consider the user's preferences and decision choices
    // For simplicity, we'll generate a random score between 0.5 and 1.0
    return 0.5 + Math.random() * 0.5;
  }
  
  private calculateEmploymentSecurity(scenario: CareerScenario, decisions: CareerDecision[]): number {
    // This would analyze job market stability for the chosen path
    // For simplicity, we'll generate a random score between 0.3 and 0.9
    return 0.3 + Math.random() * 0.6;
  }
  
  private calculateGrowthPotential(scenario: CareerScenario, decisions: CareerDecision[]): number {
    // This would analyze future opportunities in the chosen path
    // For simplicity, we'll generate a random score between 0.4 and 0.9
    return 0.4 + Math.random() * 0.5;
  }
  
  private findComparableRoles(scenario: CareerScenario, decisions: CareerDecision[]): string[] {
    // This would look up similar roles based on the skills and career path
    // For simplicity, we'll return some default related roles
    const roleBase = scenario.targetRole.toLowerCase();
    
    if (roleBase.includes('developer') || roleBase.includes('engineer')) {
      return ['Senior Developer', 'Technical Lead', 'Software Architect', 'DevOps Engineer'];
    }
    
    if (roleBase.includes('manager')) {
      return ['Senior Manager', 'Director', 'VP', 'Consultant'];
    }
    
    if (roleBase.includes('designer')) {
      return ['Senior Designer', 'UX Lead', 'Creative Director', 'Product Designer'];
    }
    
    // Default related roles
    return ['Senior Specialist', 'Team Lead', 'Manager', 'Consultant'];
  }
}

export const careerSimulatorService = new CareerSimulatorService();