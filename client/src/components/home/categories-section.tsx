import { Link } from "wouter";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { 
  Laptop, 
  ChartLine, 
  ShoppingCart, 
  Users,
  Building,
  Truck,
  GraduationCap,
  PenTool,
  ArrowRight
} from "lucide-react";

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

const CategoriesSection = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Kategori Pekerjaan Populer</h2>
          <p className="mt-2 text-secondary-600">Temukan lowongan berdasarkan kategori yang paling banyak dicari</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
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
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/search">
            <a className="inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua kategori</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
