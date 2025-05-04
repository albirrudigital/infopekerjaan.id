import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/main-layout";
import AnimatedSearchBox from "@/components/animated-search-box";
import AnimatedJobCard from "@/components/animated-job-card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Filter,
  SlidersHorizontal,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const SearchPage = () => {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    industry: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const pageSize = 6;

  // Extract search parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const newFilters = { ...filters };
    
    if (params.has("query")) newFilters.query = params.get("query") || "";
    if (params.has("location")) newFilters.location = params.get("location") || "";
    if (params.has("type")) newFilters.type = params.get("type") || "";
    if (params.has("experience")) newFilters.experience = params.get("experience") || "";
    if (params.has("salary")) newFilters.salary = params.get("salary") || "";
    if (params.has("industry")) newFilters.industry = params.get("industry") || "";
    
    setFilters(newFilters);
    
    // Count active filters
    let count = 0;
    Object.values(newFilters).forEach(value => {
      if (value && value !== "") count++;
    });
    setFilterCount(count);
  }, [location]);

  // Fetch jobs based on filters
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs', filters, sortBy, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.query) params.append("query", filters.query);
      if (filters.location) params.append("location", filters.location);
      if (filters.type) params.append("type", filters.type);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.salary) params.append("salary", filters.salary);
      if (filters.industry) params.append("industry", filters.industry);
      
      params.append("sort", sortBy);
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      return response.json();
    }
  });

  // Fetch companies for job cards
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil((jobs?.length || 0) / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      query: "",
      location: "",
      type: "",
      experience: "",
      salary: "",
      industry: "",
    });
    setFilterCount(0);
  };

  // Filter transitions
  const filterVariants = {
    hidden: { 
      x: "-100%",
      opacity: 0 
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 250
      }
    },
    exit: { 
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 250
      }
    }
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Cari Lowongan Kerja | infopekerjaan.id</title>
        <meta
          name="description"
          content="Temukan lowongan kerja terbaru dari perusahaan terkemuka di Indonesia."
        />
      </Helmet>

      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Cari Lowongan Kerja</h1>
          <AnimatedSearchBox expanded showJobTypeFilter className="shadow-md" />
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Section - Mobile Toggle */}
            <div className="md:hidden mb-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {filterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {filterCount}
                  </Badge>
                )}
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Urut berdasarkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevansi</SelectItem>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="salary_desc">Gaji Tertinggi</SelectItem>
                  <SelectItem value="salary_asc">Gaji Terendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Section - Mobile Slide In */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                >
                  <motion.div
                    className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white p-4 overflow-y-auto z-50"
                    variants={filterVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Filter Lowongan</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Filter items (same as desktop) */}
                      {/* Tipe Pekerjaan */}
                      <div>
                        <h3 className="font-medium mb-2">Tipe Pekerjaan</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="ft-mobile" />
                            <Label htmlFor="ft-mobile">Penuh Waktu</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="pt-mobile" />
                            <Label htmlFor="pt-mobile">Paruh Waktu</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="contract-mobile" />
                            <Label htmlFor="contract-mobile">Kontrak</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="remote-mobile" />
                            <Label htmlFor="remote-mobile">Remote</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Pengalaman */}
                      <div>
                        <h3 className="font-medium mb-2">Pengalaman</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="entry-mobile" />
                            <Label htmlFor="entry-mobile">Entry Level</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="mid-mobile" />
                            <Label htmlFor="mid-mobile">Mid Level</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="senior-mobile" />
                            <Label htmlFor="senior-mobile">Senior Level</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Gaji */}
                      <div>
                        <h3 className="font-medium mb-2">Gaji</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="s1-mobile" />
                            <Label htmlFor="s1-mobile">Kurang dari 5 juta</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="s2-mobile" />
                            <Label htmlFor="s2-mobile">5 - 10 juta</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="s3-mobile" />
                            <Label htmlFor="s3-mobile">10 - 20 juta</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="s4-mobile" />
                            <Label htmlFor="s4-mobile">Lebih dari 20 juta</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={resetFilters}
                      >
                        Reset
                      </Button>
                      <Button className="flex-1">
                        Terapkan
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Section - Desktop */}
            <motion.div 
              className="hidden md:block w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filter</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Reset
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Tipe Pekerjaan */}
                <div>
                  <h3 className="font-medium mb-2">Tipe Pekerjaan</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ft" />
                      <Label htmlFor="ft">Penuh Waktu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pt" />
                      <Label htmlFor="pt">Paruh Waktu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="contract" />
                      <Label htmlFor="contract">Kontrak</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remote" />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Pengalaman */}
                <div>
                  <h3 className="font-medium mb-2">Pengalaman</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="entry" />
                      <Label htmlFor="entry">Entry Level</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mid" />
                      <Label htmlFor="mid">Mid Level</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="senior" />
                      <Label htmlFor="senior">Senior Level</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Gaji */}
                <div>
                  <h3 className="font-medium mb-2">Gaji</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="s1" />
                      <Label htmlFor="s1">Kurang dari 5 juta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="s2" />
                      <Label htmlFor="s2">5 - 10 juta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="s3" />
                      <Label htmlFor="s3">10 - 20 juta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="s4" />
                      <Label htmlFor="s4">Lebih dari 20 juta</Label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            <div className="w-full md:w-3/4">
              {/* Sort Section - Desktop */}
              <motion.div 
                className="hidden md:flex justify-between items-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-medium">{jobs.length}</span> lowongan
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Urut berdasarkan:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevansi</SelectItem>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="salary_desc">Gaji Tertinggi</SelectItem>
                      <SelectItem value="salary_asc">Gaji Terendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Results */}
              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-start">
                        <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                        <div className="ml-4 flex-grow">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : jobs.length > 0 ? (
                  jobs.map((job: any, index: number) => (
                    <AnimatedJobCard
                      key={job.id}
                      job={{ ...job, companyName: companies.find((c: any) => c.id === job.companyId)?.name }}
                      index={index}
                    />
                  ))
                ) : (
                  <motion.div 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="h-8 w-8 text-gray-400 flex items-center justify-center">🔍</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Lowongan Tidak Ditemukan</h3>
                    <p className="text-gray-600 mb-4">
                      Tidak ada lowongan yang sesuai dengan filter yang dipilih.
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filter
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Pagination */}
              {jobs.length > 0 && totalPages > 1 && (
                <motion.div 
                  className="mt-8 flex justify-center items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    
                    // Show limited number of pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return (
                        <span key={page} className="text-gray-500">
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default SearchPage;