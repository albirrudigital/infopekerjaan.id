import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    logo?: string;
    jobCount?: number;
  };
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  // Get a default logo if none provided
  const companyLogo = company.logo || `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s/g, "")}.com`;

  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="bg-white border border-secondary-200 rounded-lg p-4 flex flex-col items-center justify-center h-full transition duration-200 cursor-pointer hover:shadow-md hover:border-primary-300 group">
        <div className="h-12 w-auto flex items-center justify-center mb-3">
          <img 
            src={companyLogo} 
            alt={company.name} 
            className="h-12 w-auto object-contain"
            onError={(e) => {
              // If image fails to load, show first letter of company name
              const element = e.target as HTMLImageElement;
              element.style.display = 'none';
              const parent = element.parentElement!;
              const fallback = document.createElement('div');
              fallback.className = 'w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-lg font-semibold text-primary';
              fallback.innerText = company.name.charAt(0).toUpperCase();
              parent.appendChild(fallback);
            }}
          />
        </div>
        <h3 className="font-medium text-secondary-900 group-hover:text-primary text-center">{company.name}</h3>
        {company.jobCount !== undefined && (
          <p className="text-sm text-secondary-500 mt-1">{company.jobCount} lowongan</p>
        )}
      </Card>
    </Link>
  );
};

export default CompanyCard;
