import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, UserCircle, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import logoPath from "@assets/04197B infopekerjaan 3.png";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema with confirmation password
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [userType, setUserType] = useState<string>("jobseeker");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab");
    const type = searchParams.get("type");
    
    if (tab && (tab === "login" || tab === "register")) {
      setActiveTab(tab);
    }
    
    if (type && (type === "jobseeker" || type === "employer")) {
      setUserType(type);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.type === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else if (user.type === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  // Setup login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Setup registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      type: userType,
    },
  });

  // Update registration form when user type changes
  useEffect(() => {
    registerForm.setValue("type", userType);
  }, [userType, registerForm]);

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <Helmet>
        <title>Login atau Register - infopekerjaan.id</title>
        <meta name="description" content="Masuk atau daftar akun di infopekerjaan.id untuk akses ke fitur pencarian kerja dan perekrutan." />
      </Helmet>

      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img src={logoPath} alt="infopekerjaan.id" className="h-10" />
            </a>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>Masuk ke Akun Anda</CardTitle>
                  <CardDescription>
                    Masukkan username dan password Anda untuk melanjutkan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username atau Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Masukkan username atau email" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showLoginPassword ? "text" : "password"} 
                                  placeholder="Masukkan password" 
                                  {...field} 
                                  disabled={loginMutation.isPending}
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                tabIndex={-1}
                              >
                                {showLoginPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Memproses..." : "Masuk"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-center">
                    <span className="text-secondary-500">Belum punya akun? </span>
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Daftar sekarang
                    </button>
                  </div>
                </CardFooter>
              </TabsContent>
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle>Buat Akun Baru</CardTitle>
                  <CardDescription>
                    Daftar untuk mengakses fitur lengkap infopekerjaan.id
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm text-secondary-600 mb-3">Pilih tipe akun:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType("jobseeker")}
                        className={`border rounded-md p-3 flex flex-col items-center transition-colors ${
                          userType === "jobseeker"
                            ? "border-primary bg-primary-50 text-primary"
                            : "border-secondary-200 hover:border-secondary-300"
                        }`}
                      >
                        <UserCircle size={24} className="mb-2" />
                        <span className="text-sm font-medium">Pencari Kerja</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("employer")}
                        className={`border rounded-md p-3 flex flex-col items-center transition-colors ${
                          userType === "employer"
                            ? "border-primary bg-primary-50 text-primary"
                            : "border-secondary-200 hover:border-secondary-300"
                        }`}
                      >
                        <Briefcase size={24} className="mb-2" />
                        <span className="text-sm font-medium">Perusahaan</span>
                      </button>
                    </div>
                  </div>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Masukkan nama lengkap" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="email@contoh.com" 
                                  {...field} 
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Telepon</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="08xxxxxxxxxx" 
                                  {...field} 
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Username" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type={showRegisterPassword ? "text" : "password"} 
                                    placeholder="Minimal 6 karakter" 
                                    {...field} 
                                    disabled={registerMutation.isPending}
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  tabIndex={-1}
                                >
                                  {showRegisterPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Konfirmasi Password</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Konfirmasi password" 
                                    {...field} 
                                    disabled={registerMutation.isPending}
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <RadioGroup 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="jobseeker" id="jobseeker" />
                                  <FormLabel htmlFor="jobseeker">Pencari Kerja</FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="employer" id="employer" />
                                  <FormLabel htmlFor="employer">Perusahaan</FormLabel>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Memproses..." : "Daftar Sekarang"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-center">
                    <span className="text-secondary-500">Sudah punya akun? </span>
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Masuk
                    </button>
                  </div>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="hidden md:flex flex-col justify-center bg-primary-900 text-white rounded-lg p-8 shadow-lg">
            <div className="mb-6">
              {userType === "jobseeker" ? (
                <UserCircle size={48} className="text-primary-300 mb-4" />
              ) : (
                <Briefcase size={48} className="text-primary-300 mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-2">
                {userType === "jobseeker" 
                  ? "Temukan Karir Impian Anda" 
                  : "Temukan Kandidat Terbaik"}
              </h2>
              <p className="text-primary-100">
                {userType === "jobseeker"
                  ? "Akses ribuan lowongan kerja dan bangun profil profesional Anda dengan infopekerjaan.id"
                  : "Rekrut talenta terbaik untuk perusahaan Anda dengan platform rekrutmen terpercaya"}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {userType === "jobseeker" ? (
                <>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Akses ke ribuan lowongan kerja terbaru</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Buat CV profesional dengan mudah</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Simpan lowongan favorit dan pantau lamaran</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Dapatkan notifikasi lowongan yang sesuai dengan keahlian Anda</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Posting lowongan pekerjaan dengan mudah</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Akses database kandidat berkualitas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Kelola proses rekrutmen dari satu dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary-800 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowRight size={14} className="text-primary-300" />
                    </div>
                    <span>Bangun branding perusahaan dengan profil menarik</span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-auto">
              <div className="flex items-center gap-3">
                <UserPlus size={20} className="text-primary-300" />
                <p className="text-sm text-primary-100">
                  {userType === "jobseeker"
                    ? "Bergabung dengan 1 juta+ pencari kerja lainnya"
                    : "Bergabung dengan 5,000+ perusahaan terkemuka"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-4 border-t border-secondary-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-secondary-500">
            © 2023 infopekerjaan.id. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
