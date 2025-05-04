import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { INDUSTRIES, LOCATIONS } from "@/lib/constants";
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
import { Loader2, Upload, Image } from "lucide-react";

// Company schema with Zod
const companySchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  industry: z.string().min(1, "Industri harus dipilih"),
  location: z.string().min(1, "Lokasi harus dipilih"),
  website: z.string().url("URL website tidak valid").or(z.string().length(0)),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  logo: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const CompanyForm = ({ company, onSuccess, onCancel }: CompanyFormProps) => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Setup form with react-hook-form
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      location: "",
      website: "",
      description: "",
      logo: "",
    },
  });

  // Initialize form with existing company data if editing
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        industry: company.industry,
        location: company.location,
        website: company.website || "",
        description: company.description,
        logo: company.logo || "",
      });
      
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    }
  }, [company, form]);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Format file tidak valid",
          description: "File harus berupa gambar (JPG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Ukuran file terlalu besar",
          description: "Ukuran maksimum file adalah 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create or update company mutation
  const companyMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real implementation, we would handle file upload here
      // For this demo, just simulate it
      
      // Prepare form data if there's a logo file
      if (logoFile) {
        // Here we would normally upload the logo file to a server
        // and get back a URL to store in the database
        // For now, we'll just use the preview data URL
        data.logo = logoPreview;
      }
      
      if (company) {
        // Update existing company
        const response = await apiRequest("PUT", `/api/companies/${company.id}`, data);
        return response.json();
      } else {
        // Create new company
        const response = await apiRequest("POST", "/api/companies", data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: company ? "Perusahaan berhasil diperbarui" : "Perusahaan berhasil ditambahkan",
        description: company 
          ? "Perubahan telah disimpan" 
          : "Perusahaan baru telah ditambahkan ke akun Anda",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-companies"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: company ? "Gagal memperbarui perusahaan" : "Gagal menambahkan perusahaan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CompanyFormValues) => {
    companyMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Perusahaan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: PT Maju Sejahtera" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://perusahaan-anda.com" {...field} />
                </FormControl>
                <FormDescription>
                  Opsional. Pastikan diawali dengan http:// atau https://
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Perusahaan</FormLabel>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center">
                {logoPreview ? (
                  <div className="mb-4">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="h-24 w-24 object-contain mx-auto mb-2"
                    />
                    <p className="text-sm text-secondary-500">
                      Logo saat ini
                    </p>
                  </div>
                ) : (
                  <Image className="h-12 w-12 text-secondary-400 mb-2" />
                )}
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {logoPreview ? "Ganti Logo" : "Unggah Logo"}
                </label>
                <p className="mt-2 text-xs text-secondary-500">
                  Maks. 2MB (JPG, PNG, GIF)
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Perusahaan</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Jelaskan secara singkat tentang perusahaan Anda, termasuk visi, misi, dan keunggulan" 
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                Deskripsi yang menarik dapat meningkatkan minat pencari kerja
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={companyMutation.isPending}
          >
            {companyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {company ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm;