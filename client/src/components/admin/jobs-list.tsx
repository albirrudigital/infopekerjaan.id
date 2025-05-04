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
import { 
  Eye, MoreHorizontal, Calendar, MapPin, Building, CheckCircle2, 
  XCircle, AlertCircle, User, ToggleLeft, ToggleRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobsListProps {
  searchQuery: string;
  status: string | null;
}

export default function JobsList({ searchQuery, status }: JobsListProps) {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  // Fetch jobs with filtering
  const { data: jobs, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/jobs", searchQuery, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (status) params.append("status", status);
      
      const res = await apiRequest("GET", `/api/admin/jobs?${params.toString()}`);
      return res.json();
    }
  });

  // Fetch job details
  const { data: jobDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/admin/jobs", selectedJob?.id],
    queryFn: async () => {
      if (!selectedJob) return null;
      const res = await apiRequest("GET", `/api/admin/jobs/${selectedJob.id}`);
      return res.json();
    },
    enabled: !!selectedJob
  });

  // Toggle job active status mutation
  const toggleJobActiveMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/jobs/${jobId}/toggle-active`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: "Status lowongan berhasil diperbarui",
        description: "Status lowongan telah diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui status lowongan",
        description: error.message || "Terjadi kesalahan saat memperbarui status lowongan",
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

  // Format job type
  const formatJobType = (type: string) => {
    switch (type) {
      case "full-time": return "Full Time";
      case "part-time": return "Part Time";
      case "contract": return "Kontrak";
      case "remote": return "Remote";
      default: return type;
    }
  };

  // Handle toggle job active status
  const handleToggleJobActive = (jobId: number, isActive: boolean) => {
    toggleJobActiveMutation.mutate({ jobId, isActive });
  };

  // Show job details dialog
  const showJobDetailsDialog = (job: any) => {
    setSelectedJob(job);
    setShowJobDetails(true);
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
        <p className="text-red-500">Gagal memuat data lowongan. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Tidak ada lowongan yang ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Posting</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: any) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {job.industry} • {job.salary}
                  </div>
                </TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatJobType(job.type)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                    {job.location}
                  </div>
                </TableCell>
                <TableCell>
                  {job.isActive ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Non-aktif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                    {formatDate(job.createdAt)}
                  </div>
                </TableCell>
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
                      <DropdownMenuItem onClick={() => showJobDetailsDialog(job)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Lihat Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleJobActive(job.id, !job.isActive)}
                      >
                        {job.isActive ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            <span>Aktifkan</span>
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

      {/* Job details dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Lowongan</DialogTitle>
            <DialogDescription>
              Informasi detail untuk lowongan {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/5" />
            </div>
          ) : jobDetails ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="details">Detail Lowongan</TabsTrigger>
                <TabsTrigger value="company">Informasi Perusahaan</TabsTrigger>
                <TabsTrigger value="applications">Lamaran ({jobDetails.applications?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{jobDetails.job.title}</h3>
                    <div className="text-muted-foreground">
                      <span className="inline-flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {jobDetails.job.location}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{formatJobType(jobDetails.job.type)}</span>
                      <span className="mx-2">•</span>
                      <span>{jobDetails.job.salary}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={jobDetails.job.isActive}
                      onCheckedChange={(checked) => 
                        handleToggleJobActive(jobDetails.job.id, checked)
                      }
                      disabled={toggleJobActiveMutation.isPending}
                    />
                    <span>{jobDetails.job.isActive ? "Aktif" : "Non-aktif"}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">Industri:</span>
                  <span>{jobDetails.job.industry}</span>
                  
                  <span className="font-medium text-muted-foreground">Level Karir:</span>
                  <span>{jobDetails.job.careerLevel}</span>
                  
                  <span className="font-medium text-muted-foreground">Keahlian:</span>
                  <div className="flex flex-wrap gap-1">
                    {jobDetails.job.skills && jobDetails.job.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  
                  <span className="font-medium text-muted-foreground">Tanggal Posting:</span>
                  <span>{formatDate(jobDetails.job.createdAt)}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Deskripsi Pekerjaan</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-4 bg-muted/30">
                    {jobDetails.job.description}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Persyaratan</h4>
                  <div className="text-sm whitespace-pre-line border rounded-md p-4 bg-muted/30">
                    {jobDetails.job.requirements}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="company">
                {jobDetails.company ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{jobDetails.company.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {jobDetails.company.location}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{jobDetails.company.industry}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Tentang Perusahaan</h4>
                      <div className="text-sm whitespace-pre-line border rounded-md p-4 bg-muted/30">
                        {jobDetails.company.description}
                      </div>
                    </div>
                    
                    {jobDetails.company.website && (
                      <div>
                        <span className="font-medium text-muted-foreground mr-2">Website:</span>
                        <a 
                          href={jobDetails.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {jobDetails.company.website}
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-muted-foreground mr-2">Status:</span>
                      {jobDetails.company.verified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>
                      ) : (
                        <Badge variant="outline">Belum Terverifikasi</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2">Informasi perusahaan tidak tersedia</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="applications">
                {jobDetails.applications && jobDetails.applications.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pelamar</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal Melamar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobDetails.applications.map((application: any) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{application.userName || "Pelamar"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                switch (application.status) {
                                  case "pending":
                                    return <Badge variant="outline">Menunggu</Badge>;
                                  case "reviewed":
                                    return <Badge variant="secondary">Direview</Badge>;
                                  case "shortlisted":
                                    return <Badge className="bg-blue-500 hover:bg-blue-600">Shortlist</Badge>;
                                  case "rejected":
                                    return <Badge variant="destructive">Ditolak</Badge>;
                                  case "hired":
                                    return <Badge className="bg-green-500 hover:bg-green-600">Diterima</Badge>;
                                  default:
                                    return <Badge variant="outline">{application.status}</Badge>;
                                }
                              })()}
                            </TableCell>
                            <TableCell>{formatDate(application.appliedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2">Belum ada lamaran untuk lowongan ini</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-muted-foreground">Gagal memuat detail lowongan</p>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowJobDetails(false)}
              variant="outline"
            >
              Tutup
            </Button>
            <Button
              onClick={() => selectedJob && handleToggleJobActive(
                selectedJob.id, 
                !selectedJob.isActive
              )}
              disabled={toggleJobActiveMutation.isPending}
              variant="default"
            >
              {toggleJobActiveMutation.isPending ? "Memproses..." : (
                selectedJob?.isActive ? "Nonaktifkan Lowongan" : "Aktifkan Lowongan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}