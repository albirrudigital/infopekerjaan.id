import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  ChevronDown,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import { APPLICATION_STATUS } from "@/lib/constants";

const ApplicationsTab = () => {
  const [, params] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Parse query params to get jobId if provided
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const jobId = searchParams.get("jobId");
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, [params]);

  // Fetch jobs for filter
  const { data: jobs } = useQuery({
    queryKey: ["/api/my-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const allJobs = await response.json();
      return allJobs.filter((job: any) => job.postedBy === (window as any).currentUserId);
    },
  });

  // Fetch applications
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["/api/applications", { jobId: selectedJobId }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const jobId = params.jobId;
      
      let url = jobId ? `/api/jobs/${jobId}/applications` : "/api/applications";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update application status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status aplikasi berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui status aplikasi",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Filter applications based on search query and selected status
  const filteredApplications = applications
    ? applications.filter((app: any) => {
        const matchesSearch =
          app.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesStatus = selectedStatus ? app.status === selectedStatus : true;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleOpenDetails = (application: any) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Pelamar</h1>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Pelamar</h1>
        <p className="text-secondary-600 mb-4">
          Terjadi kesalahan saat memuat data pelamar.
        </p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Pelamar</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau posisi..."
              className="pl-9 pr-4 py-2 w-full md:w-64 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {(selectedStatus || selectedJobId) && (
                  <Badge className="ml-2 bg-primary-100 text-primary-800" variant="secondary">
                    {selectedStatus && selectedJobId ? "2" : "1"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Status</p>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 text-sm border border-secondary-200 rounded-md"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="reviewed">Dipertimbangkan</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Ditolak</option>
                  <option value="hired">Diterima</option>
                </select>
              </div>
              <div className="p-2 pt-0">
                <p className="text-sm font-medium mb-2">Lowongan</p>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full p-2 text-sm border border-secondary-200 rounded-md"
                >
                  <option value="">Semua Lowongan</option>
                  {jobs?.map((job: any) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-2 border-t border-secondary-100">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedStatus("");
                    setSelectedJobId("");
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-10 bg-secondary-50 rounded-lg border border-secondary-200">
          <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Belum Ada Pelamar
          </h3>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Belum ada pelamar untuk lowongan Anda. Pastikan lowongan Anda aktif dan coba promosikan di berbagai platform.
          </p>
          <Button asChild>
            <a href="/post-job">Posting Lowongan Baru</a>
          </Button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border border-secondary-200">
          <Search className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Tidak Ada Hasil
          </h3>
          <p className="text-secondary-600 mb-4">
            Tidak ditemukan pelamar yang sesuai dengan filter Anda.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("");
              setSelectedJobId("");
            }}
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Tanggal Melamar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application: any) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{application.user?.fullName}</span>
                      <span className="text-sm text-secondary-500">{application.user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{application.job?.title}</TableCell>
                  <TableCell>
                    {format(new Date(application.appliedAt), "d MMMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={getStatusBadgeColor(application.status)}
                    >
                      {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS] || application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenDetails(application)}
                      >
                        Detail
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Status <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, "pending")}
                            className={application.status === "pending" ? "bg-secondary-100" : ""}
                          >
                            Menunggu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, "reviewed")}
                            className={application.status === "reviewed" ? "bg-secondary-100" : ""}
                          >
                            Dipertimbangkan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, "shortlisted")}
                            className={application.status === "shortlisted" ? "bg-secondary-100" : ""}
                          >
                            Shortlisted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, "rejected")}
                            className={application.status === "rejected" ? "bg-secondary-100" : ""}
                          >
                            Ditolak
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, "hired")}
                            className={application.status === "hired" ? "bg-secondary-100" : ""}
                          >
                            Diterima
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detail Pelamar</DialogTitle>
              <DialogDescription>
                Lamaran untuk posisi{" "}
                <span className="font-medium">
                  {selectedApplication.job?.title}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    Informasi Pelamar
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">Nama</span>
                      <span>{selectedApplication.user?.fullName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Email</span>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-secondary-500" />
                        <a 
                          href={`mailto:${selectedApplication.user?.email}`}
                          className="text-primary hover:underline"
                        >
                          {selectedApplication.user?.email}
                        </a>
                      </div>
                    </div>
                    {selectedApplication.user?.phone && (
                      <div className="flex flex-col">
                        <span className="font-medium">Telepon</span>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-secondary-500" />
                          <a 
                            href={`tel:${selectedApplication.user?.phone}`}
                            className="text-primary hover:underline"
                          >
                            {selectedApplication.user?.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">Tanggal Melamar</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-secondary-500" />
                        <span>
                          {format(new Date(selectedApplication.appliedAt), "d MMMM yyyy", { locale: id })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Status Lamaran</h3>
                  <div className="space-y-2">
                    <Badge 
                      variant="secondary"
                      className={`${getStatusBadgeColor(selectedApplication.status)} text-base px-3 py-1`}
                    >
                      {APPLICATION_STATUS[selectedApplication.status as keyof typeof APPLICATION_STATUS] || selectedApplication.status}
                    </Badge>
                    
                    <div className="pt-2">
                      <p className="text-sm text-secondary-600 mb-2">Ubah status:</p>
                      <div className="space-y-2">
                        {Object.entries(APPLICATION_STATUS).map(([key, label]) => (
                          <Button
                            key={key}
                            variant={selectedApplication.status === key ? "default" : "outline"}
                            size="sm"
                            className="mr-2 mb-2"
                            onClick={() => handleUpdateStatus(selectedApplication.id, key)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    CV & Dokumen
                  </h3>
                  <Button className="w-full" asChild>
                    <a 
                      href={selectedApplication.cv} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Unduh CV
                    </a>
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Posisi yang Dilamar</h3>
                  <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{selectedApplication.job?.title}</h4>
                        <p className="text-secondary-600">
                          {selectedApplication.job?.location} • {selectedApplication.job?.type === "full-time" ? "Penuh Waktu" : selectedApplication.job?.type}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`/jobs/${selectedApplication.job?.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          Lihat
                        </a>
                      </Button>
                    </div>
                    <div className="text-sm text-secondary-700 line-clamp-3">
                      {selectedApplication.job?.description}
                    </div>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Surat Lamaran</h3>
                    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                      <p className="text-secondary-700 whitespace-pre-line">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </div>
                )}

                {selectedApplication.profile && (
                  <div className="space-y-4">
                    {selectedApplication.profile.experiences?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Pengalaman Kerja</h3>
                        <div className="space-y-4">
                          {selectedApplication.profile.experiences.map((exp: any, index: number) => (
                            <div 
                              key={index}
                              className="border-l-2 border-primary-200 pl-4 pb-4"
                            >
                              <div className="flex flex-col">
                                <h4 className="font-medium">{exp.role}</h4>
                                <p className="text-secondary-600">{exp.company}</p>
                                <p className="text-sm text-secondary-500">
                                  {format(new Date(exp.startDate), "MMM yyyy", { locale: id })} 
                                  {" - "}
                                  {exp.current 
                                    ? "Sekarang" 
                                    : format(new Date(exp.endDate), "MMM yyyy", { locale: id })}
                                </p>
                                {exp.description && (
                                  <p className="text-sm text-secondary-700 mt-2">
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApplication.profile.education?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Pendidikan</h3>
                        <div className="space-y-4">
                          {selectedApplication.profile.education.map((edu: any, index: number) => (
                            <div 
                              key={index}
                              className="border-l-2 border-primary-200 pl-4 pb-4"
                            >
                              <div className="flex flex-col">
                                <h4 className="font-medium">{edu.institution}</h4>
                                <p className="text-secondary-600">
                                  {edu.degree}, {edu.field}
                                </p>
                                <p className="text-sm text-secondary-500">
                                  {format(new Date(edu.startDate), "yyyy", { locale: id })} 
                                  {" - "}
                                  {edu.current 
                                    ? "Sekarang" 
                                    : format(new Date(edu.endDate), "yyyy", { locale: id })}
                                </p>
                                {edu.description && (
                                  <p className="text-sm text-secondary-700 mt-2">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApplication.profile.skills?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Keahlian</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.profile.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApplicationsTab;
