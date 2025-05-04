import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Redirect } from "wouter";
import JobseekerDashboardLayout from "@/components/dashboard/jobseeker/layout";
import ApplicationsTab from "@/components/dashboard/jobseeker/applications-tab";
import ProfileTab from "@/components/dashboard/jobseeker/profile-tab";
import { Loader2 } from "lucide-react";

const JobseekerDashboard = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.type !== "jobseeker") {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Pencari Kerja - infopekerjaan.id</title>
        <meta name="description" content="Kelola profil, CV, dan lamaran kerja Anda di infopekerjaan.id" />
      </Helmet>

      <JobseekerDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "profile" && <ProfileTab />}
      </JobseekerDashboardLayout>
    </>
  );
};

export default JobseekerDashboard;
