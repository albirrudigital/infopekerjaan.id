import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JOB_TYPES, INDUSTRIES, LOCATIONS, CAREER_LEVELS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Job schema with Zod
const jobSchema = z.object({
  title: z.string().min(3, "Judul lowongan minimal 3 karakter"),
  companyId: z.string().min(1, "Perusahaan harus dipilih"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  requirements: z.string().min(20, "Persyaratan minimal 20 karakter"),
  responsibilities: z.string().min(20, "Tanggung jawab minimal 20 karakter"),
  location: z.string().min(1, "Lokasi harus diisi"),
  type: z.string().min(1, "Tipe pekerjaan harus dipilih"),
  careerLevel: z.string().min(1, "Jenjang karir harus dipilih"),
  industry: z.string().min(1, "Industri harus dipilih"),
  salary: z.string().min(1, "Gaji harus diisi"),
  skills: z.string().min(1, "Keahlian harus diisi"),
  isActive: z.boolean().default(true),
  isRemote: z.boolean().default(false),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobForm = ({ job, onSuccess, onCancel }: JobFormProps) => {
  const { toast } = useToast();
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Fetch companies for dropdown
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["/api/my-companies"],
    queryFn: async () => {
      const response = await fetch("/api/my-companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  // Setup form with react-hook-form
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      companyId: "",
      description: "",
      requirements: "",
      responsibilities: "",
      location: "",
      type: "",
      careerLevel: "",
      industry: "",
      salary: "",
      skills: "",
      isActive: true,
      isRemote: false,
    },
  });

  // Initialize form with existing job data if editing
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        companyId: job.companyId.toString(),
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        location: job.location,
        type: job.type,
        careerLevel: job.careerLevel,
        industry: job.industry,
        salary: job.salary,
        skills: job.skills.join(", "),
        isActive: job.isActive,
        isRemote: job.isRemote || false,
      });
      
      if (job.skills && Array.isArray(job.skills)) {
        setSkillsList(job.skills);
      }
    }
  }, [job, form]);

  // Create or update job mutation
  const jobMutation = useMutation({
    mutationFn: async (data: any) => {
      if (job) {
        // Update existing job
        const response = await apiRequest("PUT", `/api/jobs/${job.id}`, data);
        return response.json();
      } else {
        // Create new job
        const response = await apiRequest("POST", "/api/jobs", data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: job ? "Lowongan berhasil diperbarui" : "Lowongan berhasil ditambahkan",
        description: job 
          ? "Perubahan telah disimpan" 
          : "Lowongan kerja baru telah dipublikasikan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: job ? "Gagal memperbarui lowongan" : "Gagal menambahkan lowongan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: JobFormValues) => {
    // Parse skills string to array if needed
    const skillsArray = values.skills.split(",").map(skill => skill.trim()).filter(Boolean);
    
    // Prepare data for submission
    const jobData = {
      ...values,
      companyId: parseInt(values.companyId),
      skills: skillsArray,
    };
    
    jobMutation.mutate(jobData);
  };

  if (isLoadingCompanies) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Lowongan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perusahaan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih perusahaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies?.map((company: any) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Pekerjaan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe pekerjaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industri</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih industri" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="careerLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenjang Karir</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang karir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CAREER_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gaji</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Rp 8.000.000 - Rp 12.000.000 per bulan" {...field} />
              </FormControl>
              <FormDescription>
                Cantumkan rentang gaji atau tuliskan "Negosiasi" jika gaji dapat dinegosiasikan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keahlian yang Dibutuhkan</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Contoh: JavaScript, React, Node.js" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Pisahkan dengan koma (,) untuk beberapa keahlian
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Pekerjaan</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Jelaskan secara detail mengenai posisi pekerjaan ini" 
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggung Jawab</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Uraikan tanggung jawab utama untuk posisi ini" 
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persyaratan</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Jelaskan kualifikasi yang dibutuhkan untuk posisi ini" 
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isRemote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-2 space-y-0 rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Pekerjaan Remote</FormLabel>
                  <FormDescription>
                    Posisi ini dapat dikerjakan dari mana saja
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-2 space-y-0 rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Status Lowongan</FormLabel>
                  <FormDescription>
                    Lowongan akan {field.value ? "aktif" : "tidak aktif"} setelah diterbitkan
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={jobMutation.isPending}
          >
            {jobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {job ? "Perbarui Lowongan" : "Terbitkan Lowongan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JobForm;