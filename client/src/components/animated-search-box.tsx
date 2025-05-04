import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
// Define location and job type data
const LOCATIONS = [
  { value: "jakarta", label: "Jakarta" },
  { value: "bandung", label: "Bandung" },
  { value: "surabaya", label: "Surabaya" },
  { value: "yogyakarta", label: "Yogyakarta" },
  { value: "semarang", label: "Semarang" },
  { value: "medan", label: "Medan" },
  { value: "makassar", label: "Makassar" },
  { value: "bali", label: "Bali" },
  { value: "bekasi", label: "Bekasi" },
  { value: "tangerang", label: "Tangerang" },
  { value: "bogor", label: "Bogor" },
  { value: "depok", label: "Depok" },
  { value: "malang", label: "Malang" },
  { value: "palembang", label: "Palembang" },
  { value: "remote", label: "Remote" },
];

const JOB_TYPES = [
  { value: "full-time", label: "Penuh Waktu" },
  { value: "part-time", label: "Paruh Waktu" },
  { value: "contract", label: "Kontrak" },
  { value: "internship", label: "Magang" },
  { value: "remote", label: "Remote" },
  { value: "freelance", label: "Freelance" },
];

interface AnimatedSearchBoxProps {
  expanded?: boolean;
  showJobTypeFilter?: boolean;
  className?: string;
}

const AnimatedSearchBox = ({ 
  expanded = false, 
  showJobTypeFilter = false,
  className = ''
}: AnimatedSearchBoxProps) => {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Variants for animations
  const containerVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    focused: { 
      scale: 1.02,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    hover: {
      scale: 1.01,
      boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
    }
  };

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, rotate: 5 }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.98 }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    if (jobType) params.append('type', jobType);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <motion.div
      className={`bg-white rounded-lg ${expanded ? 'p-6' : 'p-4'} ${className}`}
      initial="initial"
      animate={isFocused ? 'focused' : 'initial'}
      whileHover="hover"
      variants={containerVariants}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <form 
        onSubmit={handleSearch} 
        className={`flex ${expanded ? 'flex-col gap-4' : 'flex-col md:flex-row gap-2'}`}
      >
        <div className="relative flex-grow group">
          <motion.div 
            className="absolute left-3 top-2.5 text-secondary-400"
            variants={iconVariants}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Search className="h-5 w-5" />
          </motion.div>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Posisi, perusahaan, atau keahlian"
            className="pl-10 transition-colors group-hover:border-primary"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query && (
            <motion.div 
              className="absolute top-3 right-3 h-4 w-4 bg-secondary-200 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setQuery('')}
            />
          )}
        </div>

        <div className="relative flex-grow group">
          <motion.div 
            className="absolute left-3 top-2.5 text-secondary-400"
            variants={iconVariants}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <MapPin className="h-5 w-5" />
          </motion.div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="pl-10 transition-colors group-hover:border-primary">
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showJobTypeFilter && (
          <div className="relative flex-grow group">
            <motion.div 
              className="absolute left-3 top-2.5 text-secondary-400"
              variants={iconVariants}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Briefcase className="h-5 w-5" />
            </motion.div>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="pl-10 transition-colors group-hover:border-primary">
                <SelectValue placeholder="Tipe pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <motion.div 
          className={expanded ? 'w-full' : 'w-full md:w-auto'}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button 
            type="submit" 
            className="w-full transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Cari Lowongan
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default AnimatedSearchBox;