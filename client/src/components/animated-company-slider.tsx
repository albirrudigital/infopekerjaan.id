import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
}

interface AnimatedCompanySliderProps {
  companies: Company[];
  title?: string;
  subtitle?: string;
}

const AnimatedCompanySlider = ({
  companies,
  title = "Perusahaan Terpercaya",
  subtitle = "Bekerja sama dengan perusahaan terkemuka di Indonesia"
}: AnimatedCompanySliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const controls = useAnimation();

  // Number of items to show based on screen size
  const getItemsToShow = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 1024) return 3;
      return 4;
    }
    return 4;
  };

  const [itemsToShow, setItemsToShow] = useState(getItemsToShow());

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

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
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsToShow >= companies.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, companies.length - itemsToShow) : prevIndex - 1
    );
  };

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentIndex, itemsToShow, companies.length]);

  const visibleCompanies = companies.slice(
    currentIndex,
    currentIndex + itemsToShow
  );

  // If we need to loop back to the beginning
  const needsExtraItems = currentIndex + itemsToShow > companies.length;
  const extraItems = needsExtraItems
    ? companies.slice(0, (currentIndex + itemsToShow) % companies.length)
    : [];

  const allVisibleCompanies = [...visibleCompanies, ...extraItems];

  return (
    <div className="relative" ref={ref}>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
            {title}
          </h2>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      )}

      <div className="flex items-center">
        <motion.button
          className="hidden md:flex h-8 w-8 rounded-full bg-white shadow-md items-center justify-center mx-2 z-10"
          onClick={prevSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ opacity: companies.length <= itemsToShow ? 0.5 : 1 }}
          disabled={companies.length <= itemsToShow}
        >
          <ChevronLeft className="h-5 w-5 text-secondary-600" />
        </motion.button>

        <motion.div
          className="flex-1 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="flex gap-4">
            {allVisibleCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                variants={itemVariants}
                whileHover="hover"
              >
                <Link href={`/companies/${company.id}`}>
                  <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center justify-center h-28 mb-4">
                      <img
                        src={company.logo || `https://via.placeholder.com/150?text=${company.name.charAt(0)}`}
                        alt={company.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/150?text=${company.name.charAt(0)}`;
                        }}
                      />
                    </div>
                    <h3 className="text-center font-medium text-secondary-900 line-clamp-1">
                      {company.name}
                    </h3>
                    <p className="text-sm text-secondary-500 text-center mt-1">
                      {company.industry}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.button
          className="hidden md:flex h-8 w-8 rounded-full bg-white shadow-md items-center justify-center mx-2 z-10"
          onClick={nextSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ opacity: companies.length <= itemsToShow ? 0.5 : 1 }}
          disabled={companies.length <= itemsToShow}
        >
          <ChevronRight className="h-5 w-5 text-secondary-600" />
        </motion.button>
      </div>

      {/* Pagination indicators */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.min(companies.length, 5) }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              Math.floor(currentIndex / itemsToShow) === index
                ? "bg-primary"
                : "bg-secondary-300"
            }`}
            whileHover={{ scale: 1.5 }}
            onClick={() => setCurrentIndex(index * itemsToShow)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

      {/* Mobile Navigation Buttons */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={prevSlide}
          disabled={companies.length <= itemsToShow}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={nextSlide}
          disabled={companies.length <= itemsToShow}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default AnimatedCompanySlider;