import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "wouter";

interface JobCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  jobCount: number;
}

interface AnimatedJobCategoriesProps {
  categories: JobCategory[];
}

const AnimatedJobCategories = ({ categories }: AnimatedJobCategoriesProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    hover: {
      y: -5,
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
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

  const iconVariants = {
    hidden: { scale: 0.8, rotate: -5 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {categories.map((category) => (
        <Link key={category.id} href={`/search?industry=${category.id}`}>
          <motion.div
            className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-4 flex flex-col items-center cursor-pointer overflow-hidden`}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div
              className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-3`}
              variants={iconVariants}
            >
              {category.icon}
            </motion.div>
            <h3 className="text-center font-medium text-secondary-900">{category.name}</h3>
            <p className="text-sm text-secondary-500 mt-1">{category.jobCount} lowongan</p>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default AnimatedJobCategories;