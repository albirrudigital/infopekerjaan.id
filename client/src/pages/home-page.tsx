import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Briefcase, 
  Building, 
  Network,
  Users, 
  LayoutDashboard, 
  Factory, 
  Briefcase as BriefcaseIcon, 
  GraduationCap,
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/main-layout';
import Logo from '@/components/ui/logo';
import AnimatedSearchBox from '@/components/animated-search-box';
import AnimatedJobCategories from '@/components/animated-job-categories';
import AnimatedCompanySlider from '@/components/animated-company-slider';
import AnimatedJobCard from '@/components/animated-job-card';

export default function HomePage() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a slight delay for initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  // Fetch featured jobs
  const { data: featuredJobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    }
  });

  // Fetch companies
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

  // Job categories with icons
  const jobCategories = [
    {
      id: "it",
      name: "IT & Software",
      icon: <LayoutDashboard className="h-6 w-6 text-white" />,
      color: "bg-blue-500",
      jobCount: 25
    },
    {
      id: "manufacturing",
      name: "Manufaktur",
      icon: <Factory className="h-6 w-6 text-white" />,
      color: "bg-green-500",
      jobCount: 18
    },
    {
      id: "business",
      name: "Bisnis",
      icon: <BriefcaseIcon className="h-6 w-6 text-white" />,
      color: "bg-yellow-500",
      jobCount: 32
    },
    {
      id: "education",
      name: "Pendidikan",
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      color: "bg-purple-500",
      jobCount: 15
    },
    {
      id: "healthcare",
      name: "Kesehatan",
      icon: <Users className="h-6 w-6 text-white" />,
      color: "bg-red-500",
      jobCount: 20
    },
    {
      id: "engineering",
      name: "Teknik",
      icon: <Network className="h-6 w-6 text-white" />,
      color: "bg-indigo-500",
      jobCount: 24
    },
    {
      id: "accounting",
      name: "Akuntansi",
      icon: <Briefcase className="h-6 w-6 text-white" />,
      color: "bg-teal-500",
      jobCount: 12
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: <Building className="h-6 w-6 text-white" />,
      color: "bg-pink-500",
      jobCount: 19
    }
  ];
  
  return (
    <MainLayout>
      <Helmet>
        <title>Platform Rekrutmen Kerja di Indonesia</title>
        <meta name="description" content="Platform rekrutmen kerja terpercaya di Indonesia, menghubungkan pencari kerja dengan lowongan dari berbagai perusahaan." />
      </Helmet>
      
      {/* Hero Section dengan Search Box */}
      <motion.section 
        className="relative py-16 bg-white overflow-hidden"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Konten Kiri */}
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              variants={itemVariants}
            >
              <motion.h1 
                className="text-3xl md:text-5xl font-bold"
                variants={itemVariants}
              >
                Temukan <span className="text-primary">Pekerjaan Impian</span> Anda Bersama Kami
              </motion.h1>
              
              <motion.p 
                className="text-gray-600 text-lg"
                variants={itemVariants}
              >
                Platform rekrutmen kerja terpercaya di Indonesia dengan ribuan lowongan dari perusahaan terkemuka di Indonesia.
              </motion.p>
              
              {/* Search Box */}
              <motion.div 
                className="mt-8"
                variants={itemVariants}
              >
                <AnimatedSearchBox />
              </motion.div>
            </motion.div>
            
            {/* Gambar Kanan */}
            <motion.div 
              className="w-full md:w-1/2"
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={isLoaded ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Person working on laptop" 
                className="w-full h-auto rounded-lg shadow-xl object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Job Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
              Kategori Lowongan Populer
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Temukan lowongan berdasarkan kategori industri yang sesuai dengan keahlian dan minat Anda
            </p>
          </motion.div>
          
          <AnimatedJobCategories categories={jobCategories} />
        </div>
      </section>
      
      {/* Fitur Unggulan */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
              Fitur Unggulan
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Dapatkan pengalaman pencarian kerja terbaik dengan fitur-fitur canggih kami
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fitur 1 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border border-secondary-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold text-center mb-2">Pencarian Cerdas</h3>
              <p className="text-gray-600 text-center">
                Temukan lowongan yang sesuai dengan keahlian dan preferensi Anda dengan sistem pencarian cerdas kami.
              </p>
            </motion.div>
            
            {/* Fitur 2 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border border-secondary-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                    <path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M12 13V7"></path>
                    <path d="M9 10h6"></path>
                  </svg>
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold text-center mb-2">Profil Profesional</h3>
              <p className="text-gray-600 text-center">
                Buat profil profesional yang menarik untuk mempersiapkan diri Anda bagi prosses rekrutmen.
              </p>
            </motion.div>
            
            {/* Fitur 3 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border border-secondary-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                    <path d="M5.8 11.3 2 22l10.7-3.79"></path>
                    <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a8 8 0 0 0-5.13 5.13L12 22"></path>
                    <path d="M17 6 6 17"></path>
                  </svg>
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold text-center mb-2">Apply Cepat</h3>
              <p className="text-gray-600 text-center">
                Lamar pekerjaan dengan cepat dan mudah menggunakan fitur Apply Cepat kami, tanpa proses yang rumit.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                Lowongan Terbaru
              </h2>
              <p className="text-secondary-600">
                Jelajahi lowongan kerja terbaru dari perusahaan terkemuka
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button 
                variant="outline" 
                className="hidden sm:flex"
                onClick={() => window.location.href = "/search"}
              >
                Lihat Semua
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
          
          <div className="space-y-4">
            {featuredJobs && featuredJobs.slice(0, 3).map((job: any, index: number) => (
              <AnimatedJobCard
                key={job.id}
                job={{ ...job, companyName: companies.find((c: any) => c.id === job.companyId)?.name }}
                index={index}
              />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block sm:hidden"
            >
              <Button onClick={() => window.location.href = "/search"}>
                Lihat Semua Lowongan
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Company Slider */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedCompanySlider 
            companies={companies.map((company: any) => ({
              ...company,
              industry: company.industry || "Industri"
            }))}
            title="Perusahaan Terpercaya"
            subtitle="Bekerja sama dengan perusahaan terkemuka di Indonesia"
          />
        </div>
      </section>
      
      {/* Call to Action untuk Memulai Karir */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Siap Untuk Memulai Karir Baru?
            </h2>
            
            <p className="mb-8 max-w-2xl mx-auto opacity-90">
              Bergabunglah dengan ribuan pencari kerja yang telah menemukan pekerjaan impian mereka melalui platform kami.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="px-6 py-3 bg-white text-primary-800 hover:bg-gray-100 hover:text-primary-900"
                  onClick={() => window.location.href = "/auth"}
                >
                  Daftar Sekarang
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  className="px-6 py-3 text-white border-white hover:bg-white/10"
                  onClick={() => window.location.href = "/search"}
                >
                  Cari Lowongan
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kolom Perusahaan */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-600 hover:text-primary">Posting Lowongan</Link></li>
                <li><Link href="/companies" className="text-gray-600 hover:text-primary">Hubungi Kami</Link></li>
                <li><Link href="/companies" className="text-gray-600 hover:text-primary">Karir</Link></li>
              </ul>
            </div>
            
            {/* Kolom Kandidat */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kandidat</h3>
              <ul className="space-y-2">
                <li><Link href="/search" className="text-gray-600 hover:text-primary">Cari Lowongan</Link></li>
                <li><Link href="/companies" className="text-gray-600 hover:text-primary">Perusahaan di Bekasi</Link></li>
                <li><Link href="/regulations" className="text-gray-600 hover:text-primary">Regulasi Ketenagakerjaan</Link></li>
              </ul>
            </div>
            
            {/* Kolom Employer */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employer</h3>
              <ul className="space-y-2">
                <li><Link href="/employer" className="text-gray-600 hover:text-primary">Posting Lowongan</Link></li>
                <li><Link href="/dashboard" className="text-gray-600 hover:text-primary">Dashboard Employer</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-primary">Harga</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <motion.div 
              className="mb-3 flex justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Logo size="md" />
            </motion.div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}