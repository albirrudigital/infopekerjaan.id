import { Link } from "wouter";
import { 
  Laptop, 
  ChartLine, 
  ShoppingCart, 
  Users,
  Building,
  Truck,
  GraduationCap,
  PenTool
} from "lucide-react";

interface CategoryCardProps {
  category: {
    name: string;
    icon: string;
    jobCount: number;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  // Icon mapping
  const getIcon = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    
    switch (iconName) {
      case "laptop-code":
        return <Laptop {...iconProps} />;
      case "chart-line":
        return <ChartLine {...iconProps} />;
      case "shopping-cart":
        return <ShoppingCart {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      case "building":
        return <Building {...iconProps} />;
      case "truck":
        return <Truck {...iconProps} />;
      case "graduation-cap":
        return <GraduationCap {...iconProps} />;
      case "pencil-alt":
        return <PenTool {...iconProps} />;
      default:
        return <Building {...iconProps} />;
    }
  };

  return (
    <Link href={`/search?category=${encodeURIComponent(category.name)}`}>
      <a className="group block">
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 md:p-6 text-center transition duration-200 hover:shadow-md hover:border-primary-300 hover:bg-primary-50">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary mb-4">
            {getIcon(category.icon)}
          </div>
          <h3 className="font-medium text-secondary-900 group-hover:text-primary">{category.name}</h3>
          <p className="text-sm text-secondary-500 mt-1">{category.jobCount} lowongan</p>
        </div>
      </a>
    </Link>
  );
};

export default CategoryCard;
