import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Building, UsersRound, LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EmployerDashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EmployerDashboardLayout = ({
  children,
  activeTab,
  onTabChange,
}: EmployerDashboardLayoutProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <Briefcase className="text-primary h-6 w-6 mr-2" />
              <span className="text-xl font-semibold text-primary">infopekerjaan.id</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-secondary-700 hidden md:inline-block">
              {user?.fullName}
            </span>
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                  <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-secondary-900">{user?.fullName}</h2>
                  <p className="text-sm text-secondary-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => onTabChange("companies")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === "companies"
                      ? "bg-primary text-white"
                      : "text-secondary-700 hover:bg-secondary-100"
                  }`}
                >
                  <Building className="h-5 w-5" />
                  <span>Perusahaan Saya</span>
                </button>
                <button
                  onClick={() => onTabChange("jobs")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === "jobs"
                      ? "bg-primary text-white"
                      : "text-secondary-700 hover:bg-secondary-100"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Lowongan Kerja</span>
                </button>
                <button
                  onClick={() => onTabChange("applications")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === "applications"
                      ? "bg-primary text-white"
                      : "text-secondary-700 hover:bg-secondary-100"
                  }`}
                >
                  <UsersRound className="h-5 w-5" />
                  <span>Pelamar</span>
                </button>
              </nav>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-secondary-700 hover:text-secondary-900" 
                  asChild
                >
                  <Link href="/post-job">
                    <Plus className="mr-2 h-5 w-5" />
                    Posting Lowongan
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-secondary-700 hover:text-secondary-900"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardLayout;
