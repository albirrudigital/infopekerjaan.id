import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import CompanyCard from "@/components/company-card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const CompaniesSection = () => {
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['/api/companies', { limit: 12 }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams({ limit: String(params.limit) });
      const response = await fetch(`/api/companies?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Perusahaan Terpopuler</h2>
            <p className="mt-2 text-secondary-600">Temukan karir impian di perusahaan terbaik</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border border-secondary-200 rounded-lg p-4 flex flex-col items-center justify-center">
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">Oops! Ada masalah</h2>
            <p className="text-secondary-600">Gagal memuat data perusahaan terpopuler.</p>
            <button 
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Coba lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Perusahaan Terpopuler</h2>
          <p className="mt-2 text-secondary-600">Temukan karir impian di perusahaan terbaik</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {companies && companies.map((company: any, index: number) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CompanyCard company={company} />
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/companies">
            <a className="inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua perusahaan</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
