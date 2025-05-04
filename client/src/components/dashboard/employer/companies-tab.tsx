import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  MapPin,
  Globe,
  PencilLine,
  Trash2,
  Plus,
  Briefcase,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CompanyForm from "./company-form";

const CompaniesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch companies
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["/api/my-companies"],
    queryFn: async () => {
      const response = await fetch("/api/my-companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete company");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perusahaan berhasil dihapus",
        description: "Data perusahaan telah dihapus dari sistem",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-companies"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus perusahaan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Filter companies based on search query
  const filteredCompanies = companies
    ? companies.filter((company: any) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleOpenEditForm = (company: any) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingCompany(null);
    setIsFormOpen(false);
  };

  const handleDeleteCompany = (companyId: number) => {
    deleteCompanyMutation.mutate(companyId);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Perusahaan Saya</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div>
                      <Skeleton className="h-6 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-secondary-50 border-t">
                <div className="flex gap-2 w-full">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Perusahaan Saya</h1>
        <p className="text-secondary-600 mb-4">
          Terjadi kesalahan saat memuat data perusahaan.
        </p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Perusahaan Saya</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari perusahaan..."
              className="pl-9 pr-4 py-2 w-full border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Perusahaan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Edit Perusahaan" : "Tambah Perusahaan Baru"}
                </DialogTitle>
              </DialogHeader>
              <CompanyForm 
                company={editingCompany} 
                onSuccess={handleCloseForm} 
                onCancel={handleCloseForm} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-10 bg-secondary-50 rounded-lg border border-secondary-200">
          <Building className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Belum Ada Perusahaan
          </h3>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Anda belum menambahkan perusahaan. Klik tombol di bawah untuk menambahkan perusahaan pertama Anda.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Perusahaan
          </Button>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border border-secondary-200">
          <Search className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Tidak Ada Hasil
          </h3>
          <p className="text-secondary-600 mb-4">
            Tidak ditemukan perusahaan dengan kata kunci "{searchQuery}"
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Reset Pencarian
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((company: any) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-16 w-16 rounded bg-secondary-100 flex items-center justify-center overflow-hidden">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                          const element = e.target as HTMLImageElement;
                          element.style.display = 'none';
                          element.parentElement!.innerHTML = `<span class="text-2xl font-bold text-primary">${company.name.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{company.name}</h3>
                    <p className="text-sm text-secondary-500">{company.industry}</p>
                    <div className="flex items-center mt-1 text-sm text-secondary-600">
                      <MapPin className="h-4 w-4 mr-1 inline-block" />
                      {company.location}
                    </div>
                  </div>
                </div>

                <p className="text-secondary-700 mb-4 line-clamp-2">{company.description}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    <Building className="mr-1 h-3 w-3" />
                    {company.industry}
                  </Badge>
                  {company.website && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Globe className="mr-1 h-3 w-3" />
                      Website
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-6 py-4 bg-secondary-50 border-t flex justify-between gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/companies/${company.id}`} target="_blank" rel="noopener noreferrer">
                      <Building className="mr-1 h-4 w-4" />
                      Lihat
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenEditForm(company)}
                  >
                    <PencilLine className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/post-job?company=${company.id}`}>
                      <Briefcase className="mr-1 h-4 w-4" />
                      Posting Lowongan
                    </a>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-4 w-4" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Hapus perusahaan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Semua data perusahaan termasuk lowongan kerja akan dihapus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCompany(company.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesTab;
