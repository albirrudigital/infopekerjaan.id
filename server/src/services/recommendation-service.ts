import { db } from '../db';
import { users, jobRecommendations, premiumSubscriptions } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as tf from '@tensorflow/tfjs-node';
import { RedisService } from './redis-service';

interface UserProfile {
  id: number;
  skills: string[];
  experience: number;
  education: string;
  location: string;
  preferences: {
    jobType: string[];
    salaryRange: number[];
    remote: boolean;
  };
}

interface JobProfile {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  salary: number;
  type: string;
  remote: boolean;
}

export class RecommendationService {
  private model: tf.LayersModel;
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
    this.initializeModel();
  }

  private async initializeModel() {
    // Load pre-trained model or create new one
    try {
      this.model = await tf.loadLayersModel('file://./models/recommendation/model.json');
    } catch (error) {
      console.log('Creating new model...');
      this.model = this.createModel();
    }
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer for user features
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [10] // Adjust based on feature count
    }));
    
    // Hidden layers
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    
    // Output layer
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    
    // Compile model
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  private async preprocessData(userProfile: UserProfile, jobProfile: JobProfile): Promise<tf.Tensor> {
    // Convert features to numerical values
    const features = [
      // User features
      userProfile.experience,
      this.encodeEducation(userProfile.education),
      this.encodeLocation(userProfile.location),
      this.encodeSkills(userProfile.skills, jobProfile.skills),
      
      // Job features
      this.encodeJobType(jobProfile.type),
      jobProfile.salary / 1000000, // Normalize salary
      jobProfile.remote ? 1 : 0,
      
      // Match features
      this.calculateSkillMatch(userProfile.skills, jobProfile.skills),
      this.calculateLocationMatch(userProfile.location, jobProfile.location),
      this.calculateSalaryMatch(userProfile.preferences.salaryRange, jobProfile.salary)
    ];
    
    return tf.tensor2d([features]);
  }

  private encodeEducation(education: string): number {
    const educationLevels = {
      'high_school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };
    return educationLevels[education] || 0;
  }

  private encodeLocation(location: string): number {
    // Implement location encoding logic
    return 0;
  }

  private encodeSkills(userSkills: string[], jobSkills: string[]): number {
    return this.calculateSkillMatch(userSkills, jobSkills);
  }

  private encodeJobType(type: string): number {
    const jobTypes = {
      'full_time': 1,
      'part_time': 2,
      'contract': 3,
      'internship': 4
    };
    return jobTypes[type] || 0;
  }

  private calculateSkillMatch(userSkills: string[], jobSkills: string[]): number {
    const matchedSkills = userSkills.filter(skill => jobSkills.includes(skill));
    return matchedSkills.length / jobSkills.length;
  }

  private calculateLocationMatch(userLocation: string, jobLocation: string): number {
    return userLocation === jobLocation ? 1 : 0;
  }

  private calculateSalaryMatch(userRange: number[], jobSalary: number): number {
    const [min, max] = userRange;
    if (jobSalary < min) return 0;
    if (jobSalary > max) return 0;
    return 1;
  }

  public async generateRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    // Check cache first
    const cached = await this.redisService.get(`recommendations:${userId}`);
    if (cached) {
      return cached;
    }

    // Get user profile
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userProfile: UserProfile = {
      id: user.id,
      skills: user.skills || [],
      experience: user.experience || 0,
      education: user.education || 'high_school',
      location: user.location || '',
      preferences: user.preferences || {
        jobType: [],
        salaryRange: [0, 1000000],
        remote: false
      }
    };

    // Get active jobs
    const jobs = await db.query.jobs.findMany({
      where: and(
        eq(jobs.status, 'active'),
        gte(jobs.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    });

    // Generate recommendations
    const recommendations = await Promise.all(
      jobs.map(async (job) => {
        const jobProfile: JobProfile = {
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements || [],
          skills: job.skills || [],
          location: job.location,
          salary: job.salary || 0,
          type: job.type || 'full_time',
          remote: job.remote || false
        };

        const input = await this.preprocessData(userProfile, jobProfile);
        const prediction = this.model.predict(input) as tf.Tensor;
        const score = await prediction.data();
        
        return {
          jobId: job.id,
          score: score[0],
          matchDetails: {
            skills: this.calculateSkillMatch(userProfile.skills, jobProfile.skills),
            location: this.calculateLocationMatch(userProfile.location, jobProfile.location),
            salary: this.calculateSalaryMatch(userProfile.preferences.salaryRange, jobProfile.salary)
          }
        };
      })
    );

    // Sort by score and limit results
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache results
    await this.redisService.set(`recommendations:${userId}`, sortedRecommendations, 3600); // 1 hour cache

    return sortedRecommendations;
  }

  public async trainModel(): Promise<void> {
    // Get historical data
    const historicalData = await db.query.jobRecommendations.findMany({
      where: gte(jobRecommendations.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    });

    // Prepare training data
    const trainingData = await Promise.all(
      historicalData.map(async (record) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, record.userId)
        });
        const job = await db.query.jobs.findFirst({
          where: eq(jobs.id, record.jobId)
        });

        if (!user || !job) return null;

        const userProfile: UserProfile = {
          id: user.id,
          skills: user.skills || [],
          experience: user.experience || 0,
          education: user.education || 'high_school',
          location: user.location || '',
          preferences: user.preferences || {
            jobType: [],
            salaryRange: [0, 1000000],
            remote: false
          }
        };

        const jobProfile: JobProfile = {
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements || [],
          skills: job.skills || [],
          location: job.location,
          salary: job.salary || 0,
          type: job.type || 'full_time',
          remote: job.remote || false
        };

        return {
          input: await this.preprocessData(userProfile, jobProfile),
          output: record.score
        };
      })
    );

    // Filter out null values
    const validData = trainingData.filter(data => data !== null);

    // Train model
    const xs = tf.concat(validData.map(data => data.input));
    const ys = tf.tensor1d(validData.map(data => data.output));

    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2
    });

    // Save model
    await this.model.save('file://./models/recommendation');
  }
} 