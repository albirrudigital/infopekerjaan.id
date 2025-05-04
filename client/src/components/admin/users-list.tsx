import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, MoreHorizontal, UserCog, LogIn, Ban, Shield, User, Building, FileText } from "lucide-react";

interface UsersListProps {
  searchQuery: string;
  userType: string | null;
}

export default function UsersList({ searchQuery, userType }: UsersListProps) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch users with filtering
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/users", searchQuery, userType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (userType) params.append("type", userType);
      
      const res = await apiRequest("GET", `/api/admin/users?${params.toString()}`);
      return res.json();
    }
  });

  // Fetch user details
  const { data: userDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/admin/users", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const res = await apiRequest("GET", `/api/admin/users/${selectedUser.id}`);
      return res.json();
    },
    enabled: !!selectedUser
  });

  // Login as user mutation
  const loginAsMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/admin/login-as/${userId}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login berhasil",
        description: `Anda sekarang masuk sebagai ${data.user.username}`,
      });
      queryClient.setQueryData(["/api/user"], data.user);
      window.location.href = getUserHomePage(data.user.type);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal masuk sebagai pengguna",
        description: error.message || "Terjadi kesalahan saat masuk sebagai pengguna",
        variant: "destructive",
      });
    }
  });

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Generate avatar fallback text
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get icon for user type
  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "employer":
        return <Building className="h-4 w-4" />;
      case "jobseeker":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Get badge color for user type
  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "admin":
        return <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>;
      case "employer":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Perusahaan</Badge>;
      case "jobseeker":
        return <Badge className="bg-green-500 hover:bg-green-600">Pencari Kerja</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Get home page for user type
  const getUserHomePage = (type: string) => {
    switch (type) {
      case "admin":
        return "/admin";
      case "employer":
        return "/dashboard";
      case "jobseeker":
        return "/jobs";
      default:
        return "/";
    }
  };

  // Handle login as user
  const handleLoginAs = (userId: number) => {
    loginAsMutation.mutate(userId);
  };

  // Show user details dialog
  const showUserDetailsDialog = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Gagal memuat data pengguna. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Tidak ada pengguna yang ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getUserTypeBadge(user.type)}
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => showUserDetailsDialog(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Lihat Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLoginAs(user.id)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Masuk Sebagai</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User details dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
            <DialogDescription>
              Informasi detail untuk pengguna {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/5" />
            </div>
          ) : userDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {getInitials(userDetails.user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userDetails.user.fullName}</h3>
                    <p className="text-muted-foreground">@{userDetails.user.username}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Informasi Kontak</h4>
                  <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span>{userDetails.user.email}</span>
                    
                    <span className="font-medium text-muted-foreground">Telepon:</span>
                    <span>{userDetails.user.phone || "Tidak tersedia"}</span>
                    
                    <span className="font-medium text-muted-foreground">Tipe Akun:</span>
                    <div className="flex items-center">
                      {getUserTypeIcon(userDetails.user.type)}
                      <span className="ml-2">{formatUserType(userDetails.user.type)}</span>
                    </div>
                    
                    <span className="font-medium text-muted-foreground">Bergabung:</span>
                    <span>{formatDate(userDetails.user.createdAt)}</span>
                  </div>
                </div>
              </div>

              {userDetails.user.type === "jobseeker" && (
                <div className="space-y-4">
                  <h4 className="font-medium">Profil Pencari Kerja</h4>
                  {userDetails.profile ? (
                    <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="font-medium text-muted-foreground">Headline:</span>
                      <span>{userDetails.profile.headline || "Tidak tersedia"}</span>
                      
                      <span className="font-medium text-muted-foreground">Keahlian:</span>
                      <div className="flex flex-wrap gap-1">
                        {userDetails.profile.skills && userDetails.profile.skills.length > 0 ? (
                          userDetails.profile.skills.map((skill: string, i: number) => (
                            <Badge key={i} variant="outline">{skill}</Badge>
                          ))
                        ) : (
                          <span>Tidak tersedia</span>
                        )}
                      </div>
                      
                      <span className="font-medium text-muted-foreground">Lamaran:</span>
                      <span>{userDetails.applications?.length || 0} lamaran</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Profil belum lengkap</p>
                  )}
                </div>
              )}

              {userDetails.user.type === "employer" && (
                <div className="space-y-4">
                  <h4 className="font-medium">Perusahaan</h4>
                  {userDetails.companies && userDetails.companies.length > 0 ? (
                    <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="font-medium text-muted-foreground">Jumlah Perusahaan:</span>
                      <span>{userDetails.companies.length}</span>
                      
                      <span className="font-medium text-muted-foreground">Nama Perusahaan:</span>
                      <div className="flex flex-col space-y-1">
                        {userDetails.companies.map((company: any) => (
                          <span key={company.id}>{company.name}</span>
                        ))}
                      </div>
                      
                      <span className="font-medium text-muted-foreground">Lowongan Aktif:</span>
                      <span>{userDetails.jobs?.length || 0} lowongan</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Belum ada perusahaan terdaftar</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Gagal memuat detail pengguna</p>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowUserDetails(false)}
              variant="outline"
            >
              Tutup
            </Button>
            <Button
              onClick={() => selectedUser && handleLoginAs(selectedUser.id)}
              disabled={loginAsMutation.isPending}
            >
              {loginAsMutation.isPending ? "Memproses..." : "Masuk Sebagai Pengguna Ini"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Format user type untuk display
function formatUserType(type: string) {
  switch(type) {
    case "jobseeker": return "Pencari Kerja";
    case "employer": return "Perusahaan";
    case "admin": return "Admin";
    default: return type;
  }
}