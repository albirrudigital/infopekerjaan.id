import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import JobCard from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";

const LatestJobsSection = () => {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['/api/jobs', { limit: 6 }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams({ limit: String(params.limit) });
      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-secondary-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Lowongan Terbaru</h2>
              <p className="mt-2 text-secondary-600">Kesempatan karir yang baru saja diposting perusahaan</p>
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-5">
                <div className="flex items-start">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-8 w-full" />
                </div>
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
      <section className="bg-secondary-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">Oops! Ada masalah</h2>
            <p className="text-secondary-600">Gagal memuat data lowongan kerja terbaru.</p>
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
    <section className="bg-secondary-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Lowongan Terbaru</h2>
            <p className="mt-2 text-secondary-600">Kesempatan karir yang baru saja diposting perusahaan</p>
          </div>
          <Link href="/search">
            <a className="hidden md:inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua lowongan</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        
        <div className="text-center mt-8 md:hidden">
          <Link href="/search">
            <a className="inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua lowongan</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestJobsSection;
