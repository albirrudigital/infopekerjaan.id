import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Clock, Lightbulb } from "lucide-react";
import { MoodEntryForm } from "@/components/mood-tracker/mood-entry-form";
import { MoodHistory } from "@/components/mood-tracker/mood-history";
import { MotivationTips } from "@/components/mood-tracker/motivation-tips";
import { MoodTrackerProvider } from "@/hooks/use-mood-tracker";
import { MotivationTipsProvider } from "@/hooks/use-motivation-tips";
import { ProtectedRoute } from "@/lib/protected-route";

export default function MoodTrackerPage() {
  return (
    <ProtectedRoute
      path="/mood-tracker"
      component={() => (
        <MoodTrackerProvider>
          <MotivationTipsProvider>
            <div className="container py-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
                <p className="text-muted-foreground mt-1">
                  Lacak mood Anda selama proses pencarian kerja dan dapatkan tips motivasi
                </p>
              </div>
              
              <Tabs defaultValue="entry" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-3">
                  <TabsTrigger value="entry">
                    <Pencil className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Catat Mood</span>
                    <span className="sm:hidden">Catat</span>
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Riwayat</span>
                    <span className="sm:hidden">Riwayat</span>
                  </TabsTrigger>
                  <TabsTrigger value="tips">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tips Motivasi</span>
                    <span className="sm:hidden">Tips</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="entry" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <MoodEntryForm />
                    <div className="hidden md:block">
                      <MotivationTips />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                  <MoodHistory />
                </TabsContent>
                
                <TabsContent value="tips" className="mt-6">
                  <MotivationTips />
                </TabsContent>
              </Tabs>
            </div>
          </MotivationTipsProvider>
        </MoodTrackerProvider>
      )}
    />
  );
}