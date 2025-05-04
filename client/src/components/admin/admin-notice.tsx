import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function AdminNotice() {
  const { toast } = useToast();

  // Check if in admin mode
  const adminMode = sessionStorage.getItem("adminMode") === "true";

  // Return to admin mutation
  const returnToAdminMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/return");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kembali ke admin",
        description: "Anda berhasil kembali ke akun admin",
      });
      sessionStorage.removeItem("adminMode");
      queryClient.setQueryData(["/api/user"], data.user);
      window.location.href = "/admin";
    },
    onError: (error: any) => {
      toast({
        title: "Gagal kembali ke admin",
        description: error.message || "Terjadi kesalahan saat kembali ke akun admin",
        variant: "destructive",
      });
    }
  });

  // Handle return to admin
  const handleReturnToAdmin = () => {
    returnToAdminMutation.mutate();
  };

  if (adminMode) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Mode Admin</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Anda sedang masuk sebagai pengguna lain. Hati-hati dengan tindakan yang dilakukan.</p>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={handleReturnToAdmin}
            disabled={returnToAdminMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {returnToAdminMutation.isPending ? "Memproses..." : "Kembali ke Akun Admin"}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}