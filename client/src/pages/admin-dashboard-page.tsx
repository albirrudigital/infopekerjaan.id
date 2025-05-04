import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Users, Briefcase, Building, FileText, BarChart3, Activity, LogIn } from "lucide-react";
import CompaniesList from "@/components/admin/companies-list";
import JobsList from "@/components/admin/jobs-list";
// Temporary inline components while waiting for imports resolution
const UsersList = ({ searchQuery, userType }: { searchQuery: string, userType: string | null }) => {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto h-10 w-10 text-muted-foreground">⏳</div>
      <h3 className="mt-4 text-lg font-medium">Sedang memuat data pengguna...</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {searchQuery && `Pencarian: ${searchQuery}`}
        {userType && ` | Tipe: ${userType}`}
      </p>
    </div>
  );
};

const AdminStats = ({ data, isLoading }: { data: any, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm h-24 animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5 pb-3">
          <h3 className="text-lg font-semibold">Total Pengguna</h3>
        </div>
        <div className="text-2xl font-bold">
          {data?.counts?.users || "0"}
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5 pb-3">
          <h3 className="text-lg font-semibold">Total Lowongan</h3>
        </div>
        <div className="text-2xl font-bold">
          {data?.counts?.jobs || "0"}
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5 pb-3">
          <h3 className="text-lg font-semibold">Total Perusahaan</h3>
        </div>
        <div className="text-2xl font-bold">
          {data?.counts?.companies || "0"}
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5 pb-3">
          <h3 className="text-lg font-semibold">Total Lamaran</h3>
        </div>
        <div className="text-2xl font-bold">
          {data?.counts?.applications || "0"}
        </div>
      </div>
    </div>
  );
};

const AdminNotice = () => {
  return null;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<string | null>(null);

  // Cek apakah user adalah admin
  if (user && user.type !== "admin") {
    return <Redirect to="/" />;
  }

  // Jika masih loading atau tidak ada user (belum login), tampilkan loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Ambil statistik dashboard admin
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.type === "admin"
  });

  return (
    <>
      <Helmet>
        <title>Dashboard Admin | InfoPekerjaan.id</title>
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Dashboard Superadmin</h1>
            
            {user.email === "tritunggalpancabuana@gmail.com" && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-700">
                  <span className="font-bold">User Superadmin:</span> {user.email}
                </p>
              </div>
            )}
          </div>

          <AdminNotice />

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-4">
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Statistik</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Pengguna</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Perusahaan</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Lowongan</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <AdminStats data={statsData} isLoading={statsLoading} />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Pengguna</CardTitle>
                  <CardDescription>
                    Kelola pengguna aplikasi, reset password, atau masuk sebagai pengguna.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari pengguna..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select
                        value={userType ?? ""}
                        onValueChange={(value) => setUserType(value === "" ? null : value)}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Tipe Pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua Tipe</SelectItem>
                          <SelectItem value="jobseeker">Pencari Kerja</SelectItem>
                          <SelectItem value="employer">Perusahaan</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <UsersList searchQuery={searchQuery} userType={userType} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Perusahaan</CardTitle>
                  <CardDescription>
                    Kelola perusahaan, verifikasi perusahaan baru, atau ubah status perusahaan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari perusahaan..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select
                        value={userType ?? ""}
                        onValueChange={(value) => setUserType(value === "" ? null : value)}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Status Verifikasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua</SelectItem>
                          <SelectItem value="verified">Terverifikasi</SelectItem>
                          <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <CompaniesList searchQuery={searchQuery} status={userType} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Lowongan</CardTitle>
                  <CardDescription>
                    Kelola lowongan kerja, verifikasi lowongan baru, atau nonaktifkan lowongan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari lowongan..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select
                        value={userType ?? ""}
                        onValueChange={(value) => setUserType(value === "" ? null : value)}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Status Lowongan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Non-aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <JobsList searchQuery={searchQuery} status={userType} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}