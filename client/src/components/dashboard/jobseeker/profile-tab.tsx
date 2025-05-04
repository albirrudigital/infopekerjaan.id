import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Briefcase, GraduationCap, Award } from "lucide-react";

// Schema for experience
const experienceSchema = z.object({
  role: z.string().min(1, "Jabatan harus diisi"),
  company: z.string().min(1, "Perusahaan harus diisi"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  current: z.boolean().optional(),
});

// Schema for education
const educationSchema = z.object({
  institution: z.string().min(1, "Institusi harus diisi"),
  degree: z.string().min(1, "Gelar harus diisi"),
  field: z.string().min(1, "Bidang studi harus diisi"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  current: z.boolean().optional(),
});

// Schema for profile data
const profileSchema = z.object({
  headline: z.string().optional(),
  summary: z.string().optional(),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()).min(1, "Minimal satu keahlian harus diisi"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileTab = () => {
  const { toast } = useToast();
  const [isSkillInputActive, setIsSkillInputActive] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/profile");
        
        if (response.status === 404) {
          // Profile doesn't exist yet, create a new one
          return {
            headline: "",
            summary: "",
            experiences: [],
            education: [],
            skills: [],
          };
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        return response.json();
      } catch (error) {
        // Return default empty profile if error
        return {
          headline: "",
          summary: "",
          experiences: [],
          education: [],
          skills: [],
        };
      }
    },
  });

  // Setup form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
    },
  });

  // Setup field arrays for experiences, education, and skills
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = 
    useFieldArray({
      control: form.control,
      name: "experiences",
    });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = 
    useFieldArray({
      control: form.control,
      name: "education",
    });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = 
    useFieldArray({
      control: form.control,
      name: "skills",
    });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      // Reset the form with the fetched data
      form.reset({
        headline: profile.headline || "",
        summary: profile.summary || "",
        experiences: profile.experiences || [],
        education: profile.education || [],
        skills: profile.skills || [],
      });
    }
  }, [profile, form]);

  // Mutation to save profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Check if profile exists
      if (profile && profile.id) {
        // Update existing profile
        const response = await apiRequest("PUT", "/api/profile", data);
        return response.json();
      } else {
        // Create new profile
        const response = await apiRequest("POST", "/api/profile", data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Profil berhasil disimpan",
        description: "Data profil CV Anda telah diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan profil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    saveProfileMutation.mutate(data);
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      appendSkill(skillInput.trim());
      setSkillInput("");
      setIsSkillInputActive(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Profil CV</h1>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <div className="space-y-2">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profil CV</h1>
        <Button 
          type="button" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={saveProfileMutation.isPending}
        >
          {saveProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: Software Engineer dengan 5 tahun pengalaman" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Headline singkat untuk profil Anda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ringkasan Profil</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jelaskan secara singkat tentang diri Anda, keterampilan, dan tujuan karir" 
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Ringkasan profesional akan menjadi hal pertama yang dilihat oleh recruiter
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Experiences */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Pengalaman Kerja
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendExperience({
                  role: "",
                  company: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                  current: false,
                })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Tambah Pengalaman
              </Button>
            </div>

            {experienceFields.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-secondary-500">
                  <p>Belum ada pengalaman kerja. Klik "Tambah Pengalaman" untuk menambahkan.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {experienceFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 text-secondary-500 hover:text-red-500"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jabatan/Posisi</FormLabel>
                              <FormControl>
                                <Input placeholder="Software Engineer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Perusahaan</FormLabel>
                              <FormControl>
                                <Input placeholder="PT Example Indonesia" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Mulai</FormLabel>
                              <FormControl>
                                <Input type="month" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Selesai</FormLabel>
                              <FormControl>
                                <Input 
                                  type="month" 
                                  {...field} 
                                  placeholder="Present" 
                                  disabled={form.watch(`experiences.${index}.current`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`current-job-${index}`}
                            checked={form.watch(`experiences.${index}.current`)}
                            onChange={(e) => {
                              form.setValue(
                                `experiences.${index}.current`, 
                                e.target.checked
                              );
                              if (e.target.checked) {
                                form.setValue(`experiences.${index}.endDate`, "");
                              }
                            }}
                            className="rounded border-secondary-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`current-job-${index}`}
                            className="text-sm font-medium"
                          >
                            Saya masih bekerja di sini
                          </label>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Jelaskan tanggung jawab dan pencapaian Anda" 
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                Pendidikan
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendEducation({
                  institution: "",
                  degree: "",
                  field: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                  current: false,
                })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Tambah Pendidikan
              </Button>
            </div>

            {educationFields.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-secondary-500">
                  <p>Belum ada pendidikan. Klik "Tambah Pendidikan" untuk menambahkan.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {educationFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 text-secondary-500 hover:text-red-500"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Institusi</FormLabel>
                              <FormControl>
                                <Input placeholder="Universitas Indonesia" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gelar</FormLabel>
                              <FormControl>
                                <Input placeholder="Sarjana (S1)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mb-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bidang Studi</FormLabel>
                              <FormControl>
                                <Input placeholder="Teknik Informatika" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tahun Mulai</FormLabel>
                              <FormControl>
                                <Input type="month" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tahun Selesai</FormLabel>
                              <FormControl>
                                <Input 
                                  type="month" 
                                  {...field} 
                                  disabled={form.watch(`education.${index}.current`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`current-edu-${index}`}
                            checked={form.watch(`education.${index}.current`)}
                            onChange={(e) => {
                              form.setValue(`education.${index}.current`, e.target.checked);
                              if (e.target.checked) {
                                form.setValue(`education.${index}.endDate`, "");
                              }
                            }}
                            className="rounded border-secondary-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`current-edu-${index}`}
                            className="text-sm font-medium"
                          >
                            Saya masih berkuliah di sini
                          </label>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`education.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi (Opsional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Jelaskan prestasi atau kegiatan selama masa pendidikan" 
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Keahlian
              </h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <FormLabel htmlFor="skills" className="block mb-2">Daftar Keahlian</FormLabel>
                  <FormDescription className="mb-4">
                    Tambahkan keahlian yang Anda miliki, seperti bahasa pemrograman, keterampilan teknis, atau soft skills
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skillFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <span>{form.watch(`skills.${index}`)}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {!isSkillInputActive && (
                      <button
                        type="button"
                        onClick={() => setIsSkillInputActive(true)}
                        className="border border-dashed border-secondary-300 text-secondary-500 hover:text-primary hover:border-primary px-3 py-1 rounded-full flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span>Tambah Keahlian</span>
                      </button>
                    )}
                  </div>

                  {isSkillInputActive && (
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Contoh: JavaScript, Leadership, English"
                        className="max-w-md"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSkill}>
                        Tambah
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsSkillInputActive(false);
                          setSkillInput("");
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  )}

                  {form.formState.errors.skills && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={saveProfileMutation.isPending}
            >
              {saveProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileTab;
