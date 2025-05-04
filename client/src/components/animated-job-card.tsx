import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Clock, Calendar, CreditCard } from "lucide-react";

interface AnimatedJobCardProps {
  job: any;
  index: number;
}

const AnimatedJobCard = ({ job, index }: AnimatedJobCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.1, // staggered animation
        ease: "easeOut" 
      }
    },
    hover: { 
      y: -5,
      scale: 1.02,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 5px 10px rgba(0,0,0,0.05)",
    }
  };

  const tagVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.05),
        duration: 0.2
      }
    }),
    hover: { scale: 1.05 }
  };

  const companyLogoPath = job.companyLogo ? job.companyLogo : "https://via.placeholder.com/50?text=" + job.title?.charAt(0);

  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu yang lalu`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan yang lalu`;
    }
  };

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-lg shadow-sm border border-secondary-200 p-5 overflow-hidden cursor-pointer"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      onClick={() => window.location.href = `/jobs/${job.id}`}
    >
      <div className="block">
        <div className="flex items-start">
          <motion.div 
            className="h-12 w-12 rounded-md overflow-hidden bg-primary-50 flex-shrink-0 border border-secondary-200 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={companyLogoPath}
              alt={job.companyName || "Company logo"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/50?text=${job.title?.charAt(0)}`;
              }}
            />
          </motion.div>

          <div className="ml-4 flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-secondary-900 hover:text-primary transition-colors">
                {job.title}
              </h3>
              <motion.div 
                className="text-sm text-secondary-500 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                {formatDate(job.createdAt)}
              </motion.div>
            </div>

            <div className="flex items-center mt-1 text-secondary-600 text-sm">
              <Building className="h-3.5 w-3.5 mr-1" />
              <span>{job.companyName || "Nama Perusahaan"}</span>
              <span className="mx-2">•</span>
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{job.location}</span>
            </div>

            <div className="flex items-center mt-1 text-secondary-600 text-sm">
              <CreditCard className="h-3.5 w-3.5 mr-1" />
              <span>{job.salary || "Gaji tidak ditampilkan"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-secondary-600 text-sm line-clamp-2">
            {job.description}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills && job.skills.map((skill: string, i: number) => (
            <motion.div
              key={i}
              custom={i}
              variants={tagVariants}
              whileHover="hover"
            >
              <Badge variant="outline" className="bg-secondary-50 text-secondary-700">
                {skill}
              </Badge>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            <Badge variant={job.type === "full-time" ? "default" : "secondary"} className="mr-2">
              {job.type === "full-time" ? "Penuh Waktu" : 
               job.type === "part-time" ? "Paruh Waktu" : 
               job.type === "contract" ? "Kontrak" : 
               job.type === "remote" ? "Remote" : job.type}
            </Badge>
            <Badge variant="outline">
              {job.careerLevel || "Entry Level"}
            </Badge>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="sm" 
              variant="secondary"
              className="text-xs" 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/jobs/${job.id}`;
              }}
            >
              Lihat Detail
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedJobCard;