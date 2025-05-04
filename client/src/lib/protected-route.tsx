import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If jobseeker tries to access employer dashboard
  if (path.includes('employer') && user.type === 'jobseeker') {
    return (
      <Route path={path}>
        <Redirect to="/jobseeker/dashboard" />
      </Route>
    );
  }

  // If employer tries to access jobseeker dashboard
  if (path.includes('jobseeker') && user.type === 'employer') {
    return (
      <Route path={path}>
        <Redirect to="/employer/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
