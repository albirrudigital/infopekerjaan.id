import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  PencilLine,
  Eye,
  Trash2,
  PlusCircle,
  Search,
  UsersRound,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import JobForm from "./job-form";

const JobsTab = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch jobs
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["/api/my-jobs"],
    queryFn: async () => {
      // This endpoint doesn't exist in the shared code, so using a workaround with the /api/jobs endpoint
      // In a real implementation, we'd need to add a new endpoint to fetch all jobs for the employer
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      // Filter jobs that belong to the current employer
      // In a real implementation, this filtering would be done on the server
      const allJobs = await response.json();
      return allJobs.filter((job: any) => job.postedBy === (window as any).currentUserId);
    },
  });

  // Toggle job active status mutation
  const toggleJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: number; isActive: boolean }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update job status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status lowongan berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui status lowongan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lowongan berhasil dihapus",
        description: "Data lowongan telah dihapus dari sistem",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus lowongan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Filter jobs based on search query
  const filteredJobs = jobs
    ? jobs.filter(
        (job: any) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleOpenEditForm = (job: any) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingJob(null);
    setIsFormOpen(false);
  };

  const handleToggleJobStatus = (jobId: number, currentStatus: boolean) => {
    toggleJobStatusMutation.mutate({
      jobId,
      isActive: !currentStatus,
    });
  };

  const handleDeleteJob = (jobId: number) => {
    deleteJobMutation.mutate(jobId);
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Penuh Waktu";
      case "part-time":
        return "Paruh Waktu";
      case "contract":
        return "Kontrak";
      case "remote":
        return "Remote";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Lowongan Kerja</h1>
          <Skeleton className="h-10 w-32" />
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
        <h1 className="text-2xl font-bold mb-4">Lowongan Kerja</h1>
        <p className="text-secondary-600 mb-4">
          Terjadi kesalahan saat memuat data lowongan.
        </p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Lowongan Kerja</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari lowongan..."
              className="pl-9 pr-4 py-2 w-full border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Posting Lowongan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingJob ? "Edit Lowongan" : "Posting Lowongan Baru"}
                </DialogTitle>
              </DialogHeader>
              <JobForm 
                job={editingJob} 
                onSuccess={handleCloseForm} 
                onCancel={handleCloseForm} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 bg-secondary-50 rounded-lg border border-secondary-200">
          <Briefcase className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Belum Ada Lowongan
          </h3>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Anda belum memposting lowongan kerja. Klik tombol di bawah untuk memposting lowongan pertama Anda.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Posting Lowongan
          </Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border border-secondary-200">
          <Search className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Tidak Ada Hasil
          </h3>
          <p className="text-secondary-600 mb-4">
            Tidak ditemukan lowongan dengan kata kunci "{searchQuery}"
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Reset Pencarian
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tanggal Posting</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job: any) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-secondary-500" />
                      {job.company?.name || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary-500" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={job.type === "remote" ? "bg-blue-100 text-blue-800" : ""}
                    >
                      {getJobTypeLabel(job.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-secondary-500">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={job.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {job.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleJobStatus(job.id, job.isActive)}
                        title={job.isActive ? "Nonaktifkan lowongan" : "Aktifkan lowongan"}
                      >
                        {job.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-secondary-500" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/employer/dashboard/applications?jobId=${job.id}`}>
                          <UsersRound className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEditForm(job)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus lowongan?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Lowongan ini akan dihapus secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteJob(job.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default JobsTab;
