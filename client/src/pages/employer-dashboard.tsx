import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Redirect } from "wouter";
import EmployerDashboardLayout from "@/components/dashboard/employer/layout";
import CompaniesTab from "@/components/dashboard/employer/companies-tab";
import JobsTab from "@/components/dashboard/employer/jobs-tab";
import ApplicationsTab from "@/components/dashboard/employer/applications-tab";
import { Loader2 } from "lucide-react";

const EmployerDashboard = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("companies");

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

  if (user.type !== "employer") {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Perusahaan - infopekerjaan.id</title>
        <meta name="description" content="Kelola profil perusahaan, lowongan kerja, dan kandidat di infopekerjaan.id" />
      </Helmet>

      <EmployerDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "companies" && <CompaniesTab />}
        {activeTab === "jobs" && <JobsTab />}
        {activeTab === "applications" && <ApplicationsTab />}
      </EmployerDashboardLayout>
    </>
  );
};

export default EmployerDashboard;
