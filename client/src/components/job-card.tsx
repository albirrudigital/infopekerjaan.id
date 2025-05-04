import { Link } from "wouter";
import { MapPin, BriefcaseBusiness, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    companyId: number;
    location: string;
    type: string;
    salary: string;
    skills: string[];
    createdAt: string;
    company?: {
      name: string;
      logo?: string;
    };
  };
}

const JobCard = ({ job }: JobCardProps) => {
  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Penuh Waktu";
      case "part-time":
        return "Paruh Waktu";
      case "contract":
        return "Kontrak";
      case "remote":
        return "Remote";
      default:
        return type;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return "Baru saja";
    }
  };

  // Get a default logo if none provided
  const companyLogo = job.company?.logo || `https://logo.clearbit.com/${job.company?.name.toLowerCase().replace(/\s/g, "")}.com`;

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-secondary-200 hover:shadow-md transition duration-200">
      <CardContent className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-12 w-12 bg-secondary-100 rounded flex items-center justify-center">
            {job.company && (
              <img 
                src={companyLogo} 
                alt={job.company.name} 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  // If image fails to load, show first letter of company name
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerText = job.company!.name.charAt(0).toUpperCase();
                }}
              />
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-secondary-900">{job.title}</h3>
            <p className="text-primary">{job.company?.name}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-secondary-500">
            <MapPin className="w-5 h-5 min-w-5" />
            <span className="ml-2">{job.location}</span>
          </div>
          <div className="flex items-center text-secondary-500">
            <DollarSign className="w-5 h-5 min-w-5" />
            <span className="ml-2">{job.salary}</span>
          </div>
          <div className="flex items-center text-secondary-500">
            <BriefcaseBusiness className="w-5 h-5 min-w-5" />
            <span className="ml-2">{getJobTypeLabel(job.type)}</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills && job.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {skill}
            </Badge>
          ))}
          {job.skills && job.skills.length > 3 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              +{job.skills.length - 3} lainnya
            </Badge>
          )}
        </div>
        
        <div className="mt-5 pt-4 border-t border-secondary-200 flex justify-between items-center">
          <span className="text-sm text-secondary-500">
            Diposting {getTimeAgo(job.createdAt)}
          </span>
          <Link href={`/jobs/${job.id}`}>
            <Button variant="link" className="text-primary hover:text-primary-700 font-medium">
              Lamar Sekarang
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
