import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, Briefcase, Building, FileText } from "lucide-react";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AdminStatsProps {
  data: any; // Type untuk data statistik
  isLoading: boolean;
}

export default function AdminStats({ data, isLoading }: AdminStatsProps) {
  // Format data untuk chart user types
  const formatUserTypeData = () => {
    if (!data || !data.userTypeStats) return [];
    
    return data.userTypeStats.map((stat: any) => ({
      name: formatUserType(stat.type),
      value: parseInt(stat.count)
    }));
  };
  
  // Format data untuk chart application status
  const formatApplicationStatusData = () => {
    if (!data || !data.applicationStatusStats) return [];
    
    return data.applicationStatusStats.map((stat: any) => ({
      name: formatApplicationStatus(stat.status),
      value: parseInt(stat.count)
    }));
  };
  
  // Format data untuk chart job status
  const formatJobStatusData = () => {
    if (!data || !data.jobStatusStats) return [];
    
    return data.jobStatusStats.map((stat: any) => ({
      name: stat.status ? "Aktif" : "Tidak Aktif",
      value: parseInt(stat.count)
    }));
  };

  // Format user type untuk display
  const formatUserType = (type: string) => {
    switch(type) {
      case "jobseeker": return "Pencari Kerja";
      case "employer": return "Perusahaan";
      case "admin": return "Admin";
      default: return type;
    }
  };
  
  // Format application status untuk display
  const formatApplicationStatus = (status: string) => {
    switch(status) {
      case "pending": return "Menunggu";
      case "reviewed": return "Direview";
      case "shortlisted": return "Shortlist";
      case "rejected": return "Ditolak";
      case "hired": return "Diterima";
      default: return status;
    }
  };
  
  // Format tanggal untuk tampilan chart
  const formatRecentUsers = () => {
    if (!data || !data.recentUsers) return [];
    
    return data.recentUsers.map((item: any) => {
      const date = new Date(item.date);
      return {
        name: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        Pengguna: parseInt(item.count)
      };
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium">Tidak ada data tersedia</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Terjadi kesalahan saat memuat data statistik. Silakan coba lagi nanti.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.users}</div>
            <p className="text-xs text-muted-foreground">
              {data.userTypeStats && data.userTypeStats.length > 0 && (
                `${formatUserType(data.userTypeStats[0].type)}: ${data.userTypeStats[0].count}`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lowongan</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.jobs}</div>
            <p className="text-xs text-muted-foreground">
              {data.jobStatusStats && data.jobStatusStats.some(stat => stat.status) && (
                `Aktif: ${data.jobStatusStats.find(stat => stat.status).count}`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Perusahaan</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lamaran</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.applications}</div>
            <p className="text-xs text-muted-foreground">
              {data.applicationStatusStats && data.applicationStatusStats.length > 0 && (
                `Diproses: ${data.applicationStatusStats.filter(stat => 
                  ["reviewed", "shortlisted"].includes(stat.status)
                ).reduce((sum, stat) => sum + parseInt(stat.count), 0)}`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="applications">Lamaran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Pengguna (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={formatRecentUsers()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pengguna" fill="#1e40af" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Lowongan</CardTitle>
                <CardDescription>Distribusi lowongan berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formatJobStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatJobStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Lamaran</CardTitle>
                <CardDescription>Distribusi lamaran berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formatApplicationStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatApplicationStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Tipe Pengguna</CardTitle>
              <CardDescription>Distribusi pengguna berdasarkan tipe</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={formatUserTypeData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatUserTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Lamaran</CardTitle>
              <CardDescription>Status lamaran kerja</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={formatApplicationStatusData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Jumlah" fill="#1e40af" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}