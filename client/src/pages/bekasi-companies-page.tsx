import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Building2, MapPin, Users, BadgeInfo } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';
import { Skeleton } from '@/components/ui/skeleton';

type CompanyRegulation = {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  province: string;
  businessType?: string;
  status?: string;
  employeeCount?: number;
  taxId?: string;
  createdAt: Date;
};

function BekasiCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 24;
  
  // Get bekasi companies
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/bekasi-companies', selectedDistrict, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', ((page - 1) * limit).toString());
      
      if (selectedDistrict && selectedDistrict !== 'all') {
        queryParams.append('district', selectedDistrict);
      }
      
      const response = await fetch(`/api/bekasi-companies?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    }
  });
  
  // Get unique districts for filter
  const { data: districtsData } = useQuery({
    queryKey: ['/api/bekasi-districts'],
    queryFn: async () => {
      try {
        // For now, we'll use a simple approach to get districts
        const response = await fetch('/api/bekasi-companies?limit=1000');
        if (!response.ok) {
          throw new Error('Failed to fetch districts');
        }
        const data = await response.json();
        
        // Extract unique districts
        const districts = [...new Set(data.companies.map((company: CompanyRegulation) => company.district))].filter(Boolean);
        return districts.sort();
      } catch (error) {
        console.error('Error fetching districts:', error);
        return [];
      }
    }
  });
  
  // Filter companies by search
  const filteredCompanies = data?.companies?.filter((company: CompanyRegulation) => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Calculate total pages
  const totalPages = data?.meta ? Math.ceil(data.meta.total / limit) : 0;
  
  // Generate pagination items
  const paginationItems = [];
  if (totalPages > 0) {
    // Previous button
    paginationItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setPage(old => Math.max(1, old - 1))}
          className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    // Page numbers and ellipsis logic
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      paginationItems.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        paginationItems.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      paginationItems.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    paginationItems.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setPage(old => Math.min(totalPages, old + 1))}
          className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
  }
  
  return (
    <MainLayout>
      <Helmet>
        <title>Data Perusahaan Bekasi | InfoPekerjaan.id</title>
        <meta name="description" content="Daftar perusahaan di Kabupaten Bekasi - Informasi lengkap lokasi dan kontak untuk pencari kerja" />
      </Helmet>
      
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Data Perusahaan Bekasi</h1>
            <p className="text-muted-foreground mt-2">
              Database {data?.meta?.total || 0} perusahaan di Kabupaten Bekasi untuk referensi pencarian kerja
            </p>
          </div>
        </div>
        
        {/* Filter and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Cari nama atau alamat perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kecamatan</SelectItem>
                {districtsData?.map((district: string) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Separator className="mb-8" />
        
        {/* Companies grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Terjadi kesalahan saat memuat data perusahaan.</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg">Tidak ada perusahaan yang ditemukan.</p>
            {searchQuery || (selectedDistrict && selectedDistrict !== 'all') ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDistrict('all');
                }}
                className="mt-4"
              >
                Reset Filter
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: CompanyRegulation) => (
              <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{company.name}</CardTitle>
                  <CardDescription>
                    {company.businessType || 'Umum'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{company.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Kec. {company.district}</span>
                    </div>
                    {company.employeeCount ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.employeeCount} karyawan</span>
                      </div>
                    ) : null}
                    {company.status ? (
                      <div className="flex items-center gap-2">
                        <BadgeInfo className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Status: {company.status}</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              {paginationItems}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </MainLayout>
  );
}

export default BekasiCompaniesPage;