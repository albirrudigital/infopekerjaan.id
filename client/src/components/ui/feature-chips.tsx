import React, { useState } from 'react';
import { 
  Eye, 
  Percent, 
  BarChart, 
  Share2, 
  LayoutDashboard, 
  Building2, 
  Search, 
  Mail, 
  Database,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface FeatureChip {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function FeatureChips() {
  const [showAll, setShowAll] = useState(false);
  
  const features: FeatureChip[] = [
    {
      id: 'accessibility',
      label: 'Accessibility mode with screen reader optimizations',
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: 'skill-match',
      label: 'User skill match percentage for job listings',
      icon: <Percent className="h-4 w-4" />
    },
    {
      id: 'salary-comparison',
      label: 'Interactive salary comparison tool',
      icon: <BarChart className="h-4 w-4" />
    },
    {
      id: 'social-sharing',
      label: 'One-click social media job sharing feature',
      icon: <Share2 className="h-4 w-4" />
    },
    {
      id: 'analytics',
      label: 'Employer analytics dashboard with job posting performance metrics',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      id: 'multi-company',
      label: 'Multi-company support for employers',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'advanced-search',
      label: 'Advanced search filters and recommendations',
      icon: <Search className="h-4 w-4" />
    },
    {
      id: 'notifications',
      label: 'Email notification system',
      icon: <Mail className="h-4 w-4" />
    }
  ];
  
  // Initial view shows first 4 items
  const visibleFeatures = showAll ? features : features.slice(0, 5);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {visibleFeatures.map(feature => (
          <div
            key={feature.id}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-accent/10 text-accent-foreground border border-accent/20"
          >
            {feature.icon}
            <span>{feature.label}</span>
          </div>
        ))}
      </div>
      
      {features.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show more
            </>
          )}
        </button>
      )}
    </div>
  );
}