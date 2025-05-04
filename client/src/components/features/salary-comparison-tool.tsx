import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart2 } from 'lucide-react';

// Data rata-rata gaji berdasarkan posisi dan wilayah
const salaryData = {
  "Software Engineer": {
    "Jakarta": 12000000,
    "Bandung": 9000000,
    "Surabaya": 8500000,
    "Yogyakarta": 7000000,
    "Denpasar": 7500000,
    "Makassar": 6500000,
    "Medan": 6000000,
    "Bekasi": 8000000,
  },
  "Data Scientist": {
    "Jakarta": 15000000,
    "Bandung": 12000000,
    "Surabaya": 11000000,
    "Yogyakarta": 9000000,
    "Denpasar": 8500000,
    "Makassar": 8000000,
    "Medan": 7500000,
    "Bekasi": 9500000,
  },
  "UX Designer": {
    "Jakarta": 10000000,
    "Bandung": 8000000,
    "Surabaya": 7500000,
    "Yogyakarta": 6500000,
    "Denpasar": 6000000,
    "Makassar": 5500000,
    "Medan": 5000000,
    "Bekasi": 7000000,
  },
  "Product Manager": {
    "Jakarta": 18000000,
    "Bandung": 14000000,
    "Surabaya": 13000000,
    "Yogyakarta": 11000000,
    "Denpasar": 10000000,
    "Makassar": 9500000,
    "Medan": 9000000,
    "Bekasi": 12000000,
  },
  "Marketing Specialist": {
    "Jakarta": 9000000,
    "Bandung": 7000000,
    "Surabaya": 6500000,
    "Yogyakarta": 5500000,
    "Denpasar": 5000000,
    "Makassar": 4500000,
    "Medan": 4000000,
    "Bekasi": 6000000,
  }
};

export default function SalaryComparisonTool() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("Software Engineer");
  const [selectedCities, setSelectedCities] = useState<string[]>(["Jakarta", "Bandung", "Bekasi"]);
  const [experience, setExperience] = useState<number[]>([3]);
  const [customSalary, setCustomSalary] = useState<number>(0);
  
  // Convert data to format needed for chart
  const chartData = Object.entries(salaryData[position as keyof typeof salaryData] || {})
    .filter(([city]) => selectedCities.includes(city))
    .map(([city, salary]) => {
      const adjustedSalary = Math.round(Number(salary) * (1 + (experience[0] - 3) * 0.15));
      return {
        city,
        salary: adjustedSalary,
        yourSalary: city === "Jakarta" ? customSalary : undefined,
      };
    });
  
  const handleCityToggle = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter(c => c !== city));
      }
    } else {
      if (selectedCities.length < 5) {
        setSelectedCities([...selectedCities, city]);
      }
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const positions = Object.keys(salaryData);
  const allCities = Object.keys(salaryData["Software Engineer"]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          <span>Perbandingan Gaji</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Perbandingan Gaji</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="position">Posisi</Label>
                <Select 
                  value={position} 
                  onValueChange={setPosition}
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Pilih posisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Pengalaman (tahun)</Label>
                <Slider
                  value={experience}
                  onValueChange={setExperience}
                  min={0}
                  max={10}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-center">
                  {experience[0]} tahun
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-salary">Gaji Anda (optional)</Label>
                <Input
                  id="custom-salary"
                  type="number"
                  placeholder="Masukkan gaji Anda"
                  value={customSalary}
                  onChange={(e) => setCustomSalary(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pilih Kota (maks. 5)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allCities.map(city => (
                    <Button
                      key={city}
                      variant={selectedCities.includes(city) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCityToggle(city)}
                      className="text-xs"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="border rounded-md p-4 h-full">
              <h3 className="text-lg font-medium mb-4">Perbandingan Gaji {position}</h3>
              <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="city"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value / 1000000}jt`} 
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Kota: ${label}`}
                    />
                    <Bar 
                      dataKey="salary" 
                      name="Rata-rata Gaji" 
                      fill="#4a6da7" 
                    />
                    {customSalary > 0 && (
                      <Bar 
                        dataKey="yourSalary" 
                        name="Gaji Anda" 
                        fill="#d63031" 
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Data gaji bersifat perkiraan berdasarkan data yang dikumpulkan oleh InfoPekerjaan.id
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}