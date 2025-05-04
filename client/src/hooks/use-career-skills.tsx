import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export interface UserSkill {
  id: number;
  userId: number;
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  yearsOfExperience: number;
  lastUsed: Date | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  salaryPriority: number;
  workLifeBalance: number;
  growthOpportunity: number;
  jobSecurity: number;
  skillPreferences: string[];
  locationPreferences: string[];
}

export function useCareerSkills() {
  const { toast } = useToast();
  
  const {
    data: skills,
    isLoading: skillsLoading,
    error: skillsError,
  } = useQuery<UserSkill[]>({
    queryKey: ['/api/user/skills'],
    queryFn: async ({ signal }) => {
      const res = await apiRequest('GET', '/api/user/skills', undefined, { signal });
      if (!res.ok) {
        throw new Error('Failed to fetch user skills');
      }
      return res.json();
    },
    // Add fallback data when user has no skills set yet 
    // This is just for demo/visualization purposes
    placeholderData: [
      {
        id: 1,
        userId: 1,
        name: 'JavaScript',
        level: 'advanced',
        category: 'Programming',
        yearsOfExperience: 3,
        lastUsed: new Date(),
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        name: 'React',
        level: 'intermediate',
        category: 'Frontend',
        yearsOfExperience: 2,
        lastUsed: new Date(),
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        name: 'Node.js',
        level: 'intermediate',
        category: 'Backend',
        yearsOfExperience: 2,
        lastUsed: new Date(),
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        userId: 1,
        name: 'SQL',
        level: 'basic',
        category: 'Database',
        yearsOfExperience: 1,
        lastUsed: new Date(),
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        userId: 1,
        name: 'Git',
        level: 'intermediate',
        category: 'DevOps',
        yearsOfExperience: 3,
        lastUsed: new Date(),
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  });

  const {
    data: preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences/career'],
    queryFn: async ({ signal }) => {
      const res = await apiRequest('GET', '/api/user/preferences/career', undefined, { signal });
      if (!res.ok) {
        throw new Error('Failed to fetch user career preferences');
      }
      return res.json();
    },
    // Add fallback data when user has no preferences set yet
    // This is just for demo/visualization purposes
    placeholderData: {
      salaryPriority: 70,
      workLifeBalance: 60,
      growthOpportunity: 85,
      jobSecurity: 50,
      skillPreferences: ['Frontend', 'Backend', 'DevOps'],
      locationPreferences: ['Jakarta', 'Remote']
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: async (newSkill: Omit<UserSkill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const res = await apiRequest('POST', '/api/user/skills', newSkill);
      if (!res.ok) {
        throw new Error('Failed to add skill');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills'] });
      toast({
        title: 'Skill added',
        description: 'Your skill has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, ...skill }: Partial<UserSkill> & { id: number }) => {
      const res = await apiRequest('PATCH', `/api/user/skills/${id}`, skill);
      if (!res.ok) {
        throw new Error('Failed to update skill');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills'] });
      toast({
        title: 'Skill updated',
        description: 'Your skill has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/user/skills/${id}`);
      if (!res.ok) {
        throw new Error('Failed to delete skill');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills'] });
      toast({
        title: 'Skill deleted',
        description: 'Your skill has been successfully removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences: Partial<UserPreferences>) => {
      const res = await apiRequest('PATCH', '/api/user/preferences/career', updatedPreferences);
      if (!res.ok) {
        throw new Error('Failed to update preferences');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences/career'] });
      toast({
        title: 'Preferences updated',
        description: 'Your career preferences have been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const getSkillNames = () => {
    return skills ? skills.map(skill => skill.name) : [];
  };

  const getSkillsByCategory = () => {
    if (!skills) return {};
    
    return skills.reduce((acc: Record<string, UserSkill[]>, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});
  };

  return {
    skills,
    skillsLoading,
    skillsError,
    preferences,
    preferencesLoading,
    preferencesError,
    addSkillMutation,
    updateSkillMutation,
    deleteSkillMutation,
    updatePreferencesMutation,
    getSkillNames,
    getSkillsByCategory,
  };
}