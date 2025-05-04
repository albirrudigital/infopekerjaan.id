import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/layout/main-layout';
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Map, 
  BarChart2, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter
} from 'lucide-react';

// Dummy data untuk visualisasi
const salaryTrendData = [
  { year: '2019', salary: 8500000 },
  { year: '2020', salary: 9200000 },
  { year: '2021', salary: 9800000 },
  { year: '2022', salary: 10500000 },
  { year: '2023', salary: 11200000 },
  { year: '2024', salary: 12000000 },
];

const skillDemandData = [
  { name: 'Programming', value: 35 },
  { name: 'Data Analysis', value: 25 },
  { name: 'UI/UX Design', value: 20 },
  { name: 'Project Management', value: 15 },
  { name: 'Digital Marketing', value: 5 },
];

const industryGrowthData = [
  { name: 'Technology', growth: 28 },
  { name: 'Healthcare', growth: 23 },
  { name: 'Finance', growth: 20 },
  { name: 'Education', growth: 18 },
  { name: 'Retail', growth: 15 },
  { name: 'Manufacturing', growth: 12 },
  { name: 'Construction', growth: 10 },
];

const regionJobCountData = [
  { name: 'Jakarta', jobs: 32500 },
  { name: 'Bandung', jobs: 12300 },
  { name: 'Surabaya', jobs: 11500 },
  { name: 'Yogyakarta', jobs: 8700 },
  { name: 'Medan', jobs: 6800 },
  { name: 'Makassar', jobs: 5200 },
  { name: 'Denpasar', jobs: 4800 },
  { name: 'Bekasi', jobs: 12800 },
];

const educationLevelData = [
  { name: 'SMA/SMK', percent: 27 },
  { name: 'Diploma', percent: 18 },
  { name: 'S1', percent: 42 },
  { name: 'S2', percent: 10 },
  { name: 'S3', percent: 3 },
];

const jobTypeDistribution = [
  { name: 'Full-time', value: 65 },
  { name: 'Part-time', value: 10 },
  { name: 'Contract', value: 15 },
  { name: 'Freelance', value: 5 },
  { name: 'Internship', value: 5 },
];

const unemploymentRateData = [
  { month: 'Jan', rate: 5.6 },
  { month: 'Feb', rate: 5.5 },
  { month: 'Mar', rate: 5.4 },
  { month: 'Apr', rate: 5.4 },
  { month: 'May', rate: 5.3 },
  { month: 'Jun', rate: 5.2 },
  { month: 'Jul', rate: 5.0 },
  { month: 'Aug', rate: 4.9 },
  { month: 'Sep', rate: 4.8 },
  { month: 'Oct', rate: 4.7 },
  { month: 'Nov', rate: 4.6 },
  { month: 'Dec', rate: 4.5 },
];

const monthlySummaryData = [
  { name: 'Jan', newJobs: 8700, applications: 34800 },
  { name: 'Feb', newJobs: 9200, applications: 36800 },
  { name: 'Mar', newJobs: 10500, applications: 42000 },
  { name: 'Apr', newJobs: 11200, applications: 44800 },
  { name: 'May', newJobs: 12800, applications: 51200 },
  { name: 'Jun', newJobs: 14500, applications: 58000 },
];

// Colors for pie charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

const MarketInsightsPage: React.FC = () => {
  const [region, setRegion] = useState<string>('all');
  const [industry, setIndustry] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('1y');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => `${value}%`;

  return (
    <MainLayout>
      <Helmet>
        <title>Analisis Pasar Tenaga Kerja | InfoPekerjaan.id</title>
        <meta name="description" content="Analisis real-time pasar tenaga kerja Indonesia, tren gaji, permintaan keahlian, dan statistik ketenagakerjaan." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Analisis Pasar Tenaga Kerja</h1>
            <p className="text-secondary-600 mt-2">
              Pemantauan real-time statistik dan tren pasar ketenagakerjaan Indonesia
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="w-full md:w-auto">
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih Wilayah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Wilayah</SelectItem>
                  <SelectItem value="jakarta">Jakarta</SelectItem>
                  <SelectItem value="bandung">Bandung</SelectItem>
                  <SelectItem value="surabaya">Surabaya</SelectItem>
                  <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
                  <SelectItem value="bekasi">Bekasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih Industri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Industri</SelectItem>
                  <SelectItem value="technology">Teknologi</SelectItem>
                  <SelectItem value="healthcare">Kesehatan</SelectItem>
                  <SelectItem value="finance">Keuangan</SelectItem>
                  <SelectItem value="education">Pendidikan</SelectItem>
                  <SelectItem value="manufacturing">Manufaktur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Periode Waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="6m">6 Bulan Terakhir</SelectItem>
                  <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                  <SelectItem value="2y">2 Tahun Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-secondary-500 text-sm">Total Lowongan Aktif</p>
                <h3 className="text-2xl font-bold">94,750</h3>
                <p className="text-sm text-green-600">↑ 12.3% dari bulan lalu</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-secondary-500 text-sm">Rata-rata Gaji</p>
                <h3 className="text-2xl font-bold">{formatCurrency(8200000)}</h3>
                <p className="text-sm text-green-600">↑ 5.8% dari tahun lalu</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-secondary-500 text-sm">Tingkat Kesempatan Kerja</p>
                <h3 className="text-2xl font-bold">95.5%</h3>
                <p className="text-sm text-green-600">↑ 0.7% dari kuartal lalu</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-secondary-500 text-sm">Keahlian Paling Dicari</p>
                <h3 className="text-xl font-bold">Programming</h3>
                <p className="text-sm text-blue-600">35% dari semua lowongan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="mb-8 flex justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Ikhtisar</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Tren Gaji</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Permintaan Keahlian</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span>Analisis Wilayah</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    <span>Tren Lowongan Kerja (2024)</span>
                  </CardTitle>
                  <CardDescription>Jumlah lowongan baru dan pelamar perbulan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlySummaryData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorNewJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => [`${(value).toLocaleString()}`, undefined]}
                        />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="newJobs"
                          stroke="#0088FE"
                          fillOpacity={1}
                          fill="url(#colorNewJobs)"
                          name="Lowongan Baru"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="applications"
                          stroke="#00C49F"
                          fillOpacity={1}
                          fill="url(#colorApplications)"
                          name="Jumlah Pelamar"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <span>Pertumbuhan Industri</span>
                  </CardTitle>
                  <CardDescription>Persentase pertumbuhan berdasarkan sektor industri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={industryGrowthData}
                        margin={{ top: 10, right: 30, left: 60, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={formatPercent} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Pertumbuhan']} />
                        <Bar dataKey="growth" fill="#8884d8" radius={[0, 4, 4, 0]}>
                          {industryGrowthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    <span>Distribusi Jenis Pekerjaan</span>
                  </CardTitle>
                  <CardDescription>Persentase berdasarkan jenis kontrak kerja</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={jobTypeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {jobTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 md:mt-0">
                    {jobTypeDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-xs text-secondary-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Tingkat Pengangguran Terbuka</span>
                  </CardTitle>
                  <CardDescription>Persentase pengangguran per bulan (2024)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={unemploymentRateData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[4, 6]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Tingkat Pengangguran']} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#FF6B6B"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Salary Tab */}
          <TabsContent value="salary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    <span>Perkembangan Rata-rata Gaji (2019-2024)</span>
                  </CardTitle>
                  <CardDescription>Tren gaji tahunan dalam Rupiah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salaryTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)} jt`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Gaji Rata-rata']} />
                        <Line
                          type="monotone"
                          dataKey="salary"
                          stroke="#0088FE"
                          strokeWidth={2}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <span>Gaji Berdasarkan Tingkat Pendidikan</span>
                  </CardTitle>
                  <CardDescription>Perbandingan gaji rata-rata berdasarkan jenjang pendidikan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={educationLevelData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                        <Bar dataKey="percent" fill="#00C49F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <span>Perbandingan Gaji Berdasarkan Industri</span>
                  </CardTitle>
                  <CardDescription>Gaji rata-rata berdasarkan sektor industri (dalam juta)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Teknologi', salary: 15.2 },
                          { name: 'Keuangan', salary: 14.5 },
                          { name: 'Kesehatan', salary: 12.8 },
                          { name: 'Pendidikan', salary: 9.3 },
                          { name: 'Manufaktur', salary: 8.7 },
                          { name: 'Retail', salary: 7.5 },
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 20]} tickFormatter={(value) => `${value} jt`} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value) * 1000000), 'Gaji Rata-rata']} 
                        />
                        <Bar dataKey="salary" fill="#0088FE" radius={[0, 4, 4, 0]}>
                          {salaryTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    <span>Permintaan Keahlian</span>
                  </CardTitle>
                  <CardDescription>Persentase permintaan keahlian di pasar kerja</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={skillDemandData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {skillDemandData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 md:mt-0">
                    {skillDemandData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Tren Keahlian yang Berkembang</span>
                  </CardTitle>
                  <CardDescription>Keahlian dengan pertumbuhan tercepat dalam 12 bulan terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'AI & Machine Learning', growth: 82 },
                          { name: 'Data Science', growth: 68 },
                          { name: 'Cloud Computing', growth: 54 },
                          { name: 'Cybersecurity', growth: 47 },
                          { name: 'DevOps', growth: 43 },
                          { name: 'UI/UX Design', growth: 38 },
                        ]}
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Pertumbuhan']} />
                        <Bar dataKey="growth" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Keahlian vs Gaji</span>
                  </CardTitle>
                  <CardDescription>Hubungan antara keahlian teknis dan gaji rata-rata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Machine Learning', salary: 18500000, demand: 75 },
                          { name: 'Backend Dev', salary: 16800000, demand: 85 },
                          { name: 'Cloud Architecture', salary: 17500000, demand: 70 },
                          { name: 'Data Engineering', salary: 16200000, demand: 80 },
                          { name: 'Frontend Dev', salary: 15000000, demand: 90 },
                          { name: 'Mobile Dev', salary: 15500000, demand: 82 },
                          { name: 'DevOps', salary: 16000000, demand: 78 },
                          { name: 'UI/UX', salary: 14000000, demand: 88 },
                        ]}
                        margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'salary') return [formatCurrency(Number(value)), 'Gaji Rata-rata'];
                            return [`${value}%`, 'Permintaan'];
                          }} 
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="salary" name="Gaji Rata-rata" fill="#0088FE" />
                        <Bar yAxisId="right" dataKey="demand" name="Tingkat Permintaan" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Regions Tab */}
          <TabsContent value="regions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    <span>Distribusi Lowongan per Wilayah</span>
                  </CardTitle>
                  <CardDescription>Jumlah lowongan kerja berdasarkan kota</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={regionJobCountData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                        <Tooltip 
                          formatter={(value) => [`${Number(value).toLocaleString()}`, 'Jumlah Lowongan']} 
                        />
                        <Bar dataKey="jobs" fill="#FF8042">
                          {regionJobCountData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Tren Pertumbuhan Wilayah</span>
                  </CardTitle>
                  <CardDescription>Pertumbuhan jumlah lowongan kerja per wilayah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: 'Jan', Jakarta: 100, Bandung: 100, Surabaya: 100, Bekasi: 100 },
                          { month: 'Feb', Jakarta: 105, Bandung: 103, Surabaya: 104, Bekasi: 110 },
                          { month: 'Mar', Jakarta: 110, Bandung: 107, Surabaya: 109, Bekasi: 118 },
                          { month: 'Apr', Jakarta: 115, Bandung: 112, Surabaya: 114, Bekasi: 123 },
                          { month: 'May', Jakarta: 118, Bandung: 115, Surabaya: 118, Bekasi: 130 },
                          { month: 'Jun', Jakarta: 122, Bandung: 120, Surabaya: 120, Bekasi: 138 },
                        ]}
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[95, 145]} />
                        <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                        <Legend />
                        <Line type="monotone" dataKey="Jakarta" stroke="#0088FE" />
                        <Line type="monotone" dataKey="Bandung" stroke="#00C49F" />
                        <Line type="monotone" dataKey="Surabaya" stroke="#FFBB28" />
                        <Line type="monotone" dataKey="Bekasi" stroke="#FF8042" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span>Perbandingan Gaji Antar Wilayah</span>
                  </CardTitle>
                  <CardDescription>Gaji rata-rata untuk posisi yang sama di berbagai kota</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { position: 'Software Dev', Jakarta: 15, Bandung: 12, Surabaya: 11, Bekasi: 13 },
                          { position: 'Marketing', Jakarta: 10, Bandung: 8.5, Surabaya: 8, Bekasi: 9 },
                          { position: 'Sales', Jakarta: 8, Bandung: 7, Surabaya: 6.5, Bekasi: 7.5 },
                          { position: 'Admin', Jakarta: 6, Bandung: 5, Surabaya: 5.2, Bekasi: 5.8 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="position" />
                        <YAxis tickFormatter={(value) => `${value}jt`} />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value) * 1000000), undefined]} 
                        />
                        <Legend />
                        <Bar dataKey="Jakarta" fill="#0088FE" />
                        <Bar dataKey="Bandung" fill="#00C49F" />
                        <Bar dataKey="Surabaya" fill="#FFBB28" />
                        <Bar dataKey="Bekasi" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-10 text-secondary-400 text-sm">
          <p>Data diperbarui terakhir: 27 April 2025</p>
          <p>Sumber: Kemenaker, BPS, dan data InfoPekerjaan.id</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketInsightsPage;