# DYNAMIC CAREER PATH SCENARIO SIMULATOR

## 🎯 FEATURE OVERVIEW

The Dynamic Career Path Scenario Simulator enables users to visualize and compare potential career trajectories based on different choices and scenarios. This interactive tool allows jobseekers to make more informed career decisions by simulating outcomes of various career paths, skill acquisitions, and job transitions.

### Core Capabilities:
- **Multi-path visualization:** Compare 2-3 different career trajectories side-by-side
- **What-if analysis:** Simulate outcomes of different skill acquisitions, education, or job choices
- **Timeline projection:** Visualize career progression over 1, 3, 5, and 10-year horizons
- **Salary/compensation forecasting:** Project potential earnings across different paths
- **Skill impact analysis:** See how acquiring specific skills affects career options
- **Market demand overlay:** Visualize how projected paths align with market trends
- **Decision point highlighting:** Identify key decision moments that significantly impact outcomes

## 🏗️ ARCHITECTURE DESIGN

### Component Structure

```
┌─────────────────────────┐      ┌──────────────────────────┐
│ Scenario Manager        │      │ Path Visualization Layer  │
│ - Create scenarios      │      │ - Timeline rendering      │
│ - Compare scenarios     │◄────►│ - Comparison view         │
│ - Save/load scenarios   │      │ - Decision point markers  │
└─────────────────────────┘      └──────────────────────────┘
            ▲                                  ▲
            │                                  │
            ▼                                  ▼
┌─────────────────────────┐      ┌──────────────────────────┐
│ Career Trajectory Engine│      │ Data Insights Provider   │
│ - Path calculation      │◄────►│ - Market trends          │
│ - Outcome simulation    │      │ - Salary data            │
│ - Decision point impact │      │ - Skill demand analytics │
└─────────────────────────┘      └──────────────────────────┘
            ▲                                  ▲
            │                                  │
            └──────────────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Career Data Sources │
                    │ - User profile      │
                    │ - Market data       │
                    │ - Job statistics    │
                    │ - Skill database    │
                    └─────────────────────┘
```

### Key Services:

1. **ScenarioManagerService**
   - Manages creation, saving, and comparison of career scenarios
   - Handles user scenario preferences and settings

2. **CareerTrajectoryEngine**
   - Calculates potential career paths based on inputs and rules
   - Simulates outcomes of different career decisions
   - Identifies decision points and their impact

3. **DataInsightsService**
   - Provides real-world data to inform the simulation
   - Sources market trends, salary data, and skill demand

4. **VisualizationService**
   - Renders career paths in an interactive timeline format
   - Creates comparative views for multiple scenarios
   - Emphasizes decision points and outcome differences

## 🗂️ DATA MODEL

### Key Entities:

#### CareerScenario
```typescript
interface CareerScenario {
  id: number;
  userId: number;
  name: string;
  description: string; 
  currentRole: string;
  targetRole: string;
  timeframe: number; // in years
  startingSalary: number;
  startingSkills: SkillSet[];
  decisions: CareerDecision[];
  outcomes: CareerOutcome;
  createdAt: Date;
  updatedAt: Date;
}
```

#### CareerDecision
```typescript
interface CareerDecision {
  id: number;
  scenarioId: number;
  decisionType: 'education' | 'job_change' | 'skill_acquisition' | 'relocation' | 'other';
  description: string;
  timepoint: number; // months from scenario start
  impact: DecisionImpact;
  alternatives: CareerDecision[]; // other possible decisions at this point
  isActive: boolean; // whether this decision is selected in current scenario
  metadata: Record<string, any>; // flexible storage for type-specific data
}
```

#### DecisionImpact
```typescript
interface DecisionImpact {
  skillDelta: SkillDelta[];
  salaryImpact: SalaryImpact;
  careerPathAlteration: PathAlteration;
  timeInvestment: number; // in months
  confidenceLevel: number; // 0-1 how confident we are in this prediction
}
```

#### CareerOutcome
```typescript
interface CareerOutcome {
  endRole: string;
  projectedSalary: SalaryRange;
  acquiredSkills: SkillSet[];
  marketAlignment: number; // 0-1 how well aligned with market demand
  satisfactionProjection: number; // 0-1 projected satisfaction based on user preferences
  employmentSecurity: number; // 0-1 projected job security
  growthPotential: number; // 0-1 future growth opportunities
  comparableRoles: string[];
}
```

#### SkillSet
```typescript
interface SkillSet {
  skills: Skill[];
  category: string;
  overallLevel: number; // 0-1 aggregate proficiency
}

interface Skill {
  id: number;
  name: string;
  level: number; // 0-1 proficiency level
  relevance: number; // 0-1 how relevant to the career path
  trending: boolean; // is this skill trending up in demand
}

interface SkillDelta {
  skillId: number;
  levelChange: number; // positive or negative change
  timeToAcquire: number; // in months
}
```

#### SalaryImpact
```typescript
interface SalaryImpact {
  immediateChange: number; // percentage change on decision
  projectedChangeRate: number; // annual percentage growth rate
  ceiling: number; // maximum projected salary with this path
  volatility: number; // 0-1 how variable/unpredictable
}

interface SalaryRange {
  min: number;
  max: number;
  median: number;
  percentile75: number;
  percentile90: number;
}
```

#### PathAlteration
```typescript
interface PathAlteration {
  newPathsUnlocked: string[]; // career paths that become available
  pathsClosed: string[]; // opportunities potentially lost
  timelineChange: number; // acceleration or delay to target role (in months)
  riskLevel: number; // 0-1 how risky is this change
}
```

## 💻 IMPLEMENTATION APPROACH

### Phase 1: Core Scenario Building (Sprint 3)

1. **Scenario Creation Interface**
   - Basic scenario definition (current/target role, timeframe)
   - Simple decision point creation 
   - Initial path visualization

2. **Basic Trajectory Calculation**
   - Rule-based path generation
   - Simple salary projection
   - Common career path patterns

3. **Foundation Visualization**
   - Timeline view of single path
   - Basic decision points
   - Simple outcome summary

### Phase 2: Comparison & Insights (Sprint 4)

1. **Multi-Scenario Comparison**
   - Side-by-side path visualization
   - Outcome comparison metrics
   - Toggle between scenarios

2. **Enhanced Analysis**
   - Skill gap highlighting
   - Market demand overlay
   - Decision point impact analysis

3. **Data-Driven Insights**
   - Integration with market data
   - Trend-based projections
   - Confidence indicators

### Phase 3: Advanced Features (Future)

1. **AI-Powered Recommendations**
   - ML-based outcome predictions
   - Personalized path suggestions
   - Optimization recommendations

2. **Collaborative Scenarios**
   - Share scenarios with mentors/coaches
   - Community benchmarks
   - Expert-created templates

3. **Integration Capabilities**
   - Export to career action plan
   - Integration with learning platforms
   - Real job opportunity matching

## 🎨 UI/UX DESIGN APPROACH

### Key Interfaces:

#### 1. Scenario Builder
![Scenario Builder](https://via.placeholder.com/800x400?text=Scenario+Builder)

- Intuitive wizard for creating career scenarios
- Current state assessment (role, skills, salary)
- Target state definition
- Timeline selection
- Decision point creator

#### 2. Path Visualization
![Path Visualization](https://via.placeholder.com/800x400?text=Path+Visualization)

- Interactive timeline with decision points
- Skill acquisition milestones
- Salary progression curve
- Market demand indicators
- Opportunity markers

#### 3. Comparison View
![Comparison View](https://via.placeholder.com/800x400?text=Comparison+View)

- Side-by-side path comparison
- Highlighted divergence points
- Outcome metrics comparison
- Trade-off visualization
- Decision impact assessment

#### 4. Detailed Outcome Analysis
![Outcome Analysis](https://via.placeholder.com/800x400?text=Outcome+Analysis)

- Comprehensive skills breakdown
- Salary potential visualization
- Market alignment assessment
- Risk analysis
- Time investment overview

### Mobile Considerations:
- Simplified view focusing on single path at a time
- Swipe interface for comparing scenarios
- Progressive disclosure of complex metrics
- Optimized visualization for smaller screens

## 🧪 DATA SOURCES & VALIDATION

### Initial Data Sources:

1. **User Profile Data**
   - Current skills, experience, education
   - Past career progression
   - Stated preferences and goals

2. **Market Data**
   - Job posting trends by role and location
   - Salary ranges from InfoPekerjaan.id database
   - Skill demand patterns

3. **Career Progression Patterns**
   - Common career trajectories by industry
   - Typical time-in-role statistics
   - Skill requirements by career level

### Validation Approach:

1. **Historical Validation**
   - Backtest career path model against known career progressions
   - Validate against successful professionals' career trajectories
   - Compare salary projections against actual market data

2. **Expert Input**
   - Career counselor review of path models
   - Industry expert validation of role progressions
   - HR professional assessment of salary projections

3. **User Feedback Loop**
   - Continuous refinement based on user outcomes
   - Confidence scoring adjustment based on real-world results
   - Community verification of projections

## 🚀 IMPLEMENTATION PLAN

### Sprint 3 Tasks (Phase 1)

#### Backend Development

| Task | Estimate | Priority |
|------|----------|----------|
| Create data models for scenarios & decisions | 3 days | High |
| Develop basic trajectory calculation engine | 5 days | High |
| Implement scenario storage & retrieval API | 2 days | High |
| Build rule-based outcome projection service | 4 days | Medium |
| Create decision impact assessment logic | 3 days | Medium |
| Develop basic salary projection algorithms | 2 days | Medium |
| Set up data connectors for career patterns | 3 days | Low |

#### Frontend Development

| Task | Estimate | Priority |
|------|----------|----------|
| Design & implement scenario creation wizard | 4 days | High |
| Build interactive timeline visualization | 5 days | High |
| Create career path node & edge rendering | 3 days | High |
| Implement decision point markers & tooltips | 2 days | Medium |
| Build outcome summary component | 3 days | Medium |
| Develop scenario management interface | 2 days | Medium |
| Create responsive design for all components | 3 days | Low |

### Testing & Validation

| Task | Estimate | Priority |
|------|----------|----------|
| Unit tests for trajectory engine | 2 days | High |
| Integration tests for full scenario flow | 2 days | High |
| Performance testing with complex scenarios | 1 day | Medium |
| Usability testing with target users | 2 days | Medium |
| Validation of projections against real data | 3 days | Low |

## 📊 SUCCESS METRICS

### User Engagement
- **Active Usage:** 30%+ of dashboard users engage with the simulator
- **Scenario Creation:** Average 2+ scenarios created per engaged user
- **Time on Feature:** Average 5+ minutes spent per session
- **Return Rate:** 40%+ return to update or create new scenarios

### Value Metrics
- **User Satisfaction:** 80%+ positive feedback on usefulness
- **Decision Confidence:** 70%+ report increased confidence in career planning
- **Action Taking:** 50%+ users take at least one recommended action
- **Career Milestone Achievement:** Long-term tracking of projected vs. actual outcomes

### Technical Performance
- **Calculation Speed:** <3 seconds for scenario generation
- **Visualization Performance:** Smooth rendering of complex paths
- **Accuracy:** 70%+ alignment with actual industry progression patterns
- **Reliability:** <1% error rate in calculations and projections

## 🛡️ RISKS & MITIGATION

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Accuracy of long-term projections | High | High | - Start with shorter timeframes<br>- Clear confidence indicators<br>- Regular recalibration with market data |
| Complexity overwhelming users | Medium | Medium | - Progressive disclosure<br>- Guided walkthroughs<br>- Templates and presets |
| Data availability for niche careers | Medium | High | - Focus on well-documented paths first<br>- Allow manual input/correction<br>- Community contribution model |
| Computational performance with many scenarios | Medium | Low | - Optimization techniques<br>- Background calculation<br>- Result caching |
| False sense of certainty in projections | High | Medium | - Clear disclaimer language<br>- Visualization of probability ranges<br>- Multiple outcome possibilities |

## 🔄 INTEGRATIONS

### Internal Systems
- **Career Dashboard:** Primary hosting context
- **Skill Assessment System:** Source of user skill data
- **Job Application History:** Career trajectory inputs
- **Achievement System:** Recognition for milestone completion
- **Recommendation Engine:** Informed by simulator choices

### Potential External Integrations
- **Learning Platforms:** Direct links to skill acquisition resources
- **Job Opportunity Database:** Matching actual openings to projected paths
- **Salary Data Services:** Enhanced compensation projections
- **Industry Trend APIs:** Market demand forecasting
- **Professional Network Data:** Career path validation

## 📱 MOBILE STRATEGY

### Responsive Approach
- Simplified visualization for smaller screens
- Focus on single path view with swipe comparison
- Touch-optimized decision point interaction
- Progressive disclosure of complex metrics
- Offline capability for saved scenarios

### Key Mobile Interactions
- Pinch-zoom on timeline for detailed view
- Swipe between compared scenarios
- Tap and hold for detailed decision information
- Share button for screenshots or scenario links
- Save to home screen for quick access

## 🧠 FUTURE ML ENHANCEMENTS

In future phases, we plan to enhance the simulator with machine learning capabilities:

1. **Personalized Path Recommendations**
   - ML models trained on successful career trajectories
   - Personalized suggestions based on user profile and preferences
   - Continuous learning from user choices and outcomes

2. **Predictive Outcome Modeling**
   - Advanced prediction of career outcomes using historical data
   - Confidence scoring based on data availability and pattern strength
   - Anomaly detection for unlikely career projections

3. **Dynamic Market Adaptation**
   - Real-time adjustment based on changing market conditions
   - Trend prediction for emerging roles and skills
   - Geographic opportunity mapping and relocation impact analysis

4. **Optimization Suggestions**
   - Identifying most efficient paths to career goals
   - Highlighting high-impact skill investments
   - Suggesting optimal timing for career moves

## 🏆 CONCLUSION

The Dynamic Career Path Scenario Simulator represents a significant advancement in career planning tools for InfoPekerjaan.id users. By providing interactive, data-informed projections of potential career paths, this feature will empower users to make more confident and strategic career decisions.

The phased implementation approach ensures we can deliver value quickly while building toward a sophisticated, AI-enhanced tool in the future. With careful attention to data validation, user experience, and performance, the simulator will become a cornerstone feature of the Career Intelligence Dashboard.

---

**Prepared for:** InfoPekerjaan.id  
**Date:** April 2025  
**Version:** 1.0