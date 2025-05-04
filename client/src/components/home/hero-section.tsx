import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [, setLocation_route] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append("query", keyword);
    if (location) params.append("location", location);
    setLocation_route(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 md:pr-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 leading-tight mb-4">
            Temukan <span className="text-primary">Pekerjaan Impian</span> Anda Bersama Kami
          </h1>
          <p className="text-lg md:text-xl text-secondary-600 mb-8">
            Platform rekrutmen kerja terpercaya dengan ribuan lowongan dari perusahaan terkemuka di Indonesia.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <form className="space-y-4" onSubmit={handleSearch}>
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-secondary-700 mb-1">Kata Kunci</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                  </div>
                  <Input 
                    id="keyword" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Posisi, perusahaan, atau keahlian"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">Lokasi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-secondary-400" />
                  </div>
                  <Input 
                    id="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kota atau provinsi"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Cari Lowongan
              </Button>
            </form>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
            alt="Profesional di tempat kerja" 
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
