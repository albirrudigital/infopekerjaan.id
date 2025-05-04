import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  MapPin, 
  Building,
  Briefcase,
  DollarSign,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { JOB_TYPES, CAREER_LEVELS, INDUSTRIES, LOCATIONS } from "@/lib/constants";

interface SearchFormProps {
  compact?: boolean;
  initialValues?: {
    query?: string;
    location?: string;
    industry?: string;
    type?: string;
    minSalary?: number;
    maxSalary?: number;
    careerLevel?: string;
    remote?: boolean;
  };
}

const SearchForm = ({ compact = false, initialValues = {} }: SearchFormProps) => {
  const [, navigate] = useLocation();
  
  // Form state
  const [query, setQuery] = useState(initialValues.query || "");
  const [location, setLocation] = useState(initialValues.location || "");
  const [industry, setIndustry] = useState(initialValues.industry || "");
  const [jobType, setJobType] = useState(initialValues.type || "");
  const [careerLevel, setCareerLevel] = useState(initialValues.careerLevel || "");
  const [salaryRange, setSalaryRange] = useState([
    initialValues.minSalary || 0, 
    initialValues.maxSalary || 50
  ]);
  const [isRemote, setIsRemote] = useState(initialValues.remote || false);

  // Parse query params on component mount
  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      
      setQuery(params.get("query") || "");
      setLocation(params.get("location") || "");
      setIndustry(params.get("industry") || "");
      setJobType(params.get("type") || "");
      setCareerLevel(params.get("careerLevel") || "");
      
      const minSalary = params.get("minSalary");
      const maxSalary = params.get("maxSalary");
      if (minSalary && maxSalary) {
        setSalaryRange([Number(minSalary), Number(maxSalary)]);
      }
      
      setIsRemote(params.get("remote") === "true");
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (query) params.append("query", query);
    if (location) params.append("location", location);
    if (industry) params.append("industry", industry);
    if (jobType) params.append("type", jobType);
    if (careerLevel) params.append("careerLevel", careerLevel);
    
    if (salaryRange[0] > 0) {
      params.append("minSalary", salaryRange[0].toString());
    }
    
    if (salaryRange[1] < 50) {
      params.append("maxSalary", salaryRange[1].toString());
    }
    
    if (isRemote) {
      params.append("remote", "true");
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setQuery("");
    setLocation("");
    setIndustry("");
    setJobType("");
    setCareerLevel("");
    setSalaryRange([0, 50]);
    setIsRemote(false);
  };

  // Format salary display
  const formatSalary = (value: number) => {
    if (value === 0) return "Rp0";
    if (value === 50) return "Rp50jt+";
    return `Rp${value}jt`;
  };

  if (compact) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Posisi, perusahaan, atau keahlian"
              className="pl-10"
            />
          </div>
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
            <Input 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokasi"
              className="pl-10"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" type="button" className="w-full md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-auto">
              <SheetHeader>
                <SheetTitle>Filter Lowongan</SheetTitle>
                <SheetDescription>
                  Sesuaikan pencarian dengan preferensi Anda
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industri</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih industri" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Industri</SelectItem>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobType">Tipe Pekerjaan</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe pekerjaan" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="careerLevel">Jenjang Karir</Label>
                  <Select value={careerLevel} onValueChange={setCareerLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang karir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Level</SelectItem>
                      {CAREER_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Gaji Bulanan (juta rupiah)</Label>
                    <div className="text-sm text-primary">
                      {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
                    </div>
                  </div>
                  <Slider
                    value={salaryRange}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={setSalaryRange}
                    className="mt-6"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="remote"
                    checked={isRemote}
                    onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                  />
                  <label
                    htmlFor="remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tampilkan hanya pekerjaan remote
                  </label>
                </div>
              </div>
              <SheetFooter className="gap-2 sm:justify-between sm:flex-row">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button 
                    onClick={() => handleSearch()}
                    className="w-full sm:w-auto"
                  >
                    Terapkan Filter
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Button type="submit" className="w-full md:w-auto">
            Cari
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Kata Kunci</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
              <Input 
                id="keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Posisi, perusahaan, atau keahlian"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
              <Input 
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kota atau provinsi"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industri</Label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Pilih industri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Industri</SelectItem>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobType">Tipe Pekerjaan</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Pilih tipe pekerjaan" />
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
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Gaji Bulanan (juta rupiah)</Label>
            <div className="text-sm text-primary">
              {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
            </div>
          </div>
          <div className="px-2">
            <Slider
              value={salaryRange}
              min={0}
              max={50}
              step={1}
              onValueChange={setSalaryRange}
              className="mt-6"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="careerLevel">Jenjang Karir</Label>
            <Select value={careerLevel} onValueChange={setCareerLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenjang karir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                {CAREER_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-2 h-full">
              <Checkbox
                id="remote"
                checked={isRemote}
                onCheckedChange={(checked) => setIsRemote(checked as boolean)}
              />
              <label
                htmlFor="remote"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tampilkan hanya pekerjaan remote
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" type="button" onClick={handleReset} className="w-full sm:w-auto">
            Reset
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Cari Lowongan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
