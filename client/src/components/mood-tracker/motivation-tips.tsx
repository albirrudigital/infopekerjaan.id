import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  Brain, 
  Search, 
  UserCheck, 
  Users, 
  RefreshCw, 
  BookOpenText 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMotivationTips } from "@/hooks/use-motivation-tips";
import { MoodLevel } from "@/hooks/use-mood-tracker";

type TipCategory = "career_development" | "mental_health" | "job_search" | "interview_preparation" | "networking";

const CATEGORY_INFO: Record<TipCategory, { label: string, icon: React.ReactNode }> = {
  "career_development": {
    label: "Pengembangan Karir",
    icon: <BookOpenText className="h-5 w-5" />
  },
  "mental_health": {
    label: "Kesehatan Mental",
    icon: <Brain className="h-5 w-5" />
  },
  "job_search": {
    label: "Pencarian Kerja",
    icon: <Search className="h-5 w-5" />
  },
  "interview_preparation": {
    label: "Persiapan Interview",
    icon: <UserCheck className="h-5 w-5" />
  },
  "networking": {
    label: "Networking",
    icon: <Users className="h-5 w-5" />
  }
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  "very_high": "Sangat Baik",
  "high": "Baik",
  "moderate": "Biasa Saja",
  "low": "Kurang Baik",
  "very_low": "Sangat Buruk"
};

interface MotivationTipCardProps {
  title: string;
  content: string;
  category: TipCategory;
}

function MotivationTipCard({ title, content, category }: MotivationTipCardProps) {
  const categoryInfo = CATEGORY_INFO[category];
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {categoryInfo.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{categoryInfo.label}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{content}</p>
      </CardContent>
    </Card>
  );
}

export function MotivationTips() {
  const { tips, isLoading, getTipsByCategory, getTipsForMood } = useMotivationTips();
  const [filterMode, setFilterMode] = useState<"category" | "mood">("category");
  const [selectedCategory, setSelectedCategory] = useState<TipCategory>("career_development");
  const [selectedMood, setSelectedMood] = useState<MoodLevel>("moderate");

  const filteredTips = filterMode === "category" 
    ? getTipsByCategory(selectedCategory)
    : getTipsForMood(selectedMood);

  // Choose a random highlighted tip from all tips
  const randomTipIndex = Math.floor(Math.random() * (tips.length || 1));
  const highlightedTip = tips[randomTipIndex];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tips Motivasi</CardTitle>
        <CardDescription>
          Temukan tips untuk membantu Anda tetap termotivasi selama proses pencarian kerja
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Random Highlight Tip */}
        {isLoading ? (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : highlightedTip ? (
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tip Hari Ini</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-1">{highlightedTip.title}</p>
              <p className="text-sm">{highlightedTip.content}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_INFO[highlightedTip.category as TipCategory].label}
              </p>
            </CardFooter>
          </Card>
        ) : null}

        {/* Filter Controls */}
        <div className="space-y-2">
          <Tabs defaultValue="category" onValueChange={(value) => setFilterMode(value as "category" | "mood")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">
                <BookOpenText className="h-4 w-4 mr-2" />
                Kategori
              </TabsTrigger>
              <TabsTrigger value="mood">
                <RefreshCw className="h-4 w-4 mr-2" />
                Mood
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="category" className="mt-4">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TipCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategori Tips</SelectLabel>
                    {Object.entries(CATEGORY_INFO).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="mood" className="mt-4">
              <Select value={selectedMood} onValueChange={(value) => setSelectedMood(value as MoodLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Mood</SelectLabel>
                    {Object.entries(MOOD_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium mb-3">
            {filterMode === "category" ? (
              <span>Tips {CATEGORY_INFO[selectedCategory].label}</span>
            ) : (
              <span>Tips untuk Mood {MOOD_LABELS[selectedMood]}</span>
            )}
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTips.length > 0 ? (
            <div>
              {filteredTips.map((tip) => (
                <MotivationTipCard
                  key={tip.id}
                  title={tip.title}
                  content={tip.content}
                  category={tip.category as TipCategory}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Tidak ada tips ditemukan. Coba pilih kategori atau mood lain.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}