import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MoreHorizontal, Check, X, Building, Globe, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CompaniesListProps {
  searchQuery: string;
  status: string | null;
}

export default function CompaniesList({ searchQuery, status }: CompaniesListProps) {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Fetch companies with filtering
  const { data: companies, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/companies", searchQuery, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (status) params.append("status", status);
      
      const res = await apiRequest("GET", `/api/admin/companies?${params.toString()}`);
      return res.json();
    }
  });

  // Fetch company details
  const { data: companyDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/admin/companies", selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany) return null;
      const res = await apiRequest("GET", `/api/admin/companies/${selectedCompany.id}`);
      return res.json();
    },
    enabled: !!selectedCompany
  });

  // Verify company mutation
  const verifyCompanyMutation = useMutation({
    mutationFn: async ({ companyId, verified }: { companyId: number; verified: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/companies/${companyId}/verify`, { verified });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({
        title: "Status perusahaan berhasil diperbarui",
        description: "Status verifikasi perusahaan telah diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui status perusahaan",
        description: error.message || "Terjadi kesalahan saat memperbarui status perusahaan",
        variant: "destructive",
      });
    }
  });

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Generate avatar fallback text
  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle verify company
  const handleVerifyCompany = (companyId: number, verified: boolean) => {
    verifyCompanyMutation.mutate({ companyId, verified });
  };

  // Show company details dialog
  const showCompanyDetailsDialog = (company: any) => {
    setSelectedCompany(company);
    setShowCompanyDetails(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Gagal memuat data perusahaan. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Tidak ada perusahaan yang ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Industri</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company: any) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {company.logo ? (
                        <AvatarImage src={company.logo} alt={company.name} />
                      ) : (
                        <AvatarFallback>{getCompanyInitials(company.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {company.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                    {company.location}
                  </div>
                </TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>
                  {company.verified ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>
                  ) : (
                    <Badge variant="outline">Belum Terverifikasi</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(company.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => showCompanyDetailsDialog(company)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Lihat Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleVerifyCompany(company.id, !company.verified)}
                      >
                        {company.verified ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            <span>Batalkan Verifikasi</span>
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            <span>Verifikasi</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Company details dialog */}
      <Dialog open={showCompanyDetails} onOpenChange={setShowCompanyDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Perusahaan</DialogTitle>
            <DialogDescription>
              Informasi detail untuk perusahaan {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/5" />
            </div>
          ) : companyDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {companyDetails.company.logo ? (
                      <AvatarImage src={companyDetails.company.logo} alt={companyDetails.company.name} />
                    ) : (
                      <AvatarFallback className="text-xl">
                        {getCompanyInitials(companyDetails.company.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{companyDetails.company.name}</h3>
                    <p className="text-muted-foreground truncate max-w-[250px]">{companyDetails.company.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Informasi Perusahaan</h4>
                  <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Industri:</span>
                    <span>{companyDetails.company.industry || "Tidak tersedia"}</span>
                    
                    <span className="font-medium text-muted-foreground">Lokasi:</span>
                    <span>{companyDetails.company.location || "Tidak tersedia"}</span>
                    
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <div className="flex items-center">
                      {companyDetails.company.verified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>
                      ) : (
                        <Badge variant="outline">Belum Terverifikasi</Badge>
                      )}
                    </div>
                    
                    <span className="font-medium text-muted-foreground">Website:</span>
                    {companyDetails.company.website ? (
                      <a 
                        href={companyDetails.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        {companyDetails.company.website}
                      </a>
                    ) : (
                      <span>Tidak tersedia</span>
                    )}
                    
                    <span className="font-medium text-muted-foreground">Bergabung:</span>
                    <span>{formatDate(companyDetails.company.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">Status Verifikasi</span>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={companyDetails.company.verified}
                      onCheckedChange={(checked) => 
                        handleVerifyCompany(companyDetails.company.id, checked)
                      }
                      disabled={verifyCompanyMutation.isPending}
                    />
                    <span>{companyDetails.company.verified ? "Terverifikasi" : "Belum Terverifikasi"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Lowongan Kerja ({companyDetails.jobs?.length || 0})</h4>
                  {companyDetails.jobs && companyDetails.jobs.length > 0 ? (
                    <div className="space-y-2">
                      {companyDetails.jobs.map((job: any) => (
                        <div key={job.id} className="border rounded-md p-2">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            <span>•</span>
                            <span>{job.type}</span>
                          </div>
                          <div className="text-sm mt-1">
                            {job.isActive ? (
                              <Badge>Aktif</Badge>
                            ) : (
                              <Badge variant="outline">Tidak Aktif</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Belum ada lowongan</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informasi Pemilik</h4>
                  {companyDetails.owner ? (
                    <div className="border rounded-md p-3">
                      <div className="font-medium">{companyDetails.owner.fullName}</div>
                      <div className="text-sm">{companyDetails.owner.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {companyDetails.owner.phone || "Tidak ada nomor telepon"}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Informasi pemilik tidak tersedia</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Gagal memuat detail perusahaan</p>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowCompanyDetails(false)}
              variant="outline"
            >
              Tutup
            </Button>
            <Button
              onClick={() => selectedCompany && handleVerifyCompany(
                selectedCompany.id, 
                !selectedCompany.verified
              )}
              disabled={verifyCompanyMutation.isPending}
              variant="default"
            >
              {verifyCompanyMutation.isPending ? "Memproses..." : (
                selectedCompany?.verified ? "Batalkan Verifikasi" : "Verifikasi Perusahaan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}