import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, Building, ExternalLink, FileText } from "lucide-react";

const getStatusColor = (status: string) => {
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

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "reviewed":
      return "Dipertimbangkan";
    case "shortlisted":
      return "Shortlisted";
    case "rejected":
      return "Ditolak";
    case "hired":
      return "Diterima";
    default:
      return status;
  }
};

const ApplicationsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["/api/my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/my-applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
  });

  const filteredApplications = applications
    ? applications.filter(
        (app: any) =>
          app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Lamaran Saya</h1>
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
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
        <h1 className="text-2xl font-bold mb-4">Lamaran Saya</h1>
        <p className="text-secondary-600 mb-4">
          Terjadi kesalahan saat memuat data lamaran.
        </p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Lamaran Saya</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan posisi atau perusahaan..."
            className="pl-9 pr-4 py-2 w-full md:w-64 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-10 bg-secondary-50 rounded-lg border border-secondary-200">
          <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Belum Ada Lamaran
          </h3>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Anda belum mengajukan lamaran pekerjaan. Mulai cari pekerjaan dan kirim lamaran sekarang.
          </p>
          <Button asChild>
            <Link href="/search">Cari Lowongan</Link>
          </Button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border border-secondary-200">
          <Search className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            Tidak Ada Hasil
          </h3>
          <p className="text-secondary-600 mb-4">
            Tidak ditemukan lamaran dengan kata kunci "{searchQuery}"
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
                <TableHead>Perusahaan</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Tanggal Melamar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application: any) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary-100 rounded flex items-center justify-center overflow-hidden">
                        {application.company?.logo ? (
                          <img 
                            src={application.company.logo} 
                            alt={application.company?.name} 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const element = e.target as HTMLImageElement;
                              element.style.display = 'none';
                              element.parentElement!.innerText = application.company.name.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {application.company?.name.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-secondary-900">{application.company?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{application.job?.title}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(application.appliedAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/jobs/${application.jobId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Detail
                      </Link>
                    </Button>
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

export default ApplicationsTab;
