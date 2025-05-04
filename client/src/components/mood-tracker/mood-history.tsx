import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Pencil, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MoodEntry, MoodLevel, useMoodTracker } from "@/hooks/use-mood-tracker";
import { Skeleton } from "@/components/ui/skeleton";

const MOOD_COLORS: Record<MoodLevel, string> = {
  "very_high": "bg-green-500",
  "high": "bg-emerald-400",
  "moderate": "bg-yellow-400",
  "low": "bg-orange-400",
  "very_low": "bg-red-500"
};

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  "very_high": "😄",
  "high": "🙂",
  "moderate": "😐",
  "low": "😕",
  "very_low": "😢"
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  "very_high": "Sangat Baik",
  "high": "Baik",
  "moderate": "Biasa Saja",
  "low": "Kurang Baik",
  "very_low": "Sangat Buruk"
};

export function MoodHistory() {
  const { entries, isLoading, deleteEntryMutation } = useMoodTracker();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const firstDayCurrentMonth = startOfMonth(currentMonth);
  const lastDayCurrentMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: lastDayCurrentMonth,
  });

  const handleDeleteEntry = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEntry) {
      deleteEntryMutation.mutate(selectedEntry.id, {
        onSuccess: () => {
          toast({
            title: "Berhasil dihapus",
            description: "Catatan mood telah dihapus"
          });
          setDeleteConfirmOpen(false);
        }
      });
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const getDayMoodEntry = (day: Date): MoodEntry | undefined => {
    return entries.find(entry => isSameDay(new Date(entry.date), day));
  };

  const renderDay = (day: Date) => {
    const entry = getDayMoodEntry(day);
    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
    const isOutsideMonth = !isSameMonth(day, currentMonth);
    
    return (
      <div
        key={day.toString()}
        className={`relative w-full h-10 flex items-center justify-center rounded-full cursor-pointer 
          ${isSelected ? "bg-primary text-primary-foreground" : ""}
          ${isOutsideMonth ? "text-muted-foreground opacity-50" : ""}
        `}
        onClick={() => setSelectedDate(day)}
      >
        <span className="text-sm">{format(day, "d")}</span>
        {entry && (
          <span 
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full
              ${MOOD_COLORS[entry.mood]} ${isSelected ? "border-2 border-primary-foreground" : ""}
            `}
          />
        )}
      </div>
    );
  };

  const selectedDateEntry = selectedDate ? getDayMoodEntry(selectedDate) : undefined;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Riwayat Mood</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {format(currentMonth, "MMMM yyyy")}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(28)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="text-xs font-medium">Min</div>
              <div className="text-xs font-medium">Sen</div>
              <div className="text-xs font-medium">Sel</div>
              <div className="text-xs font-medium">Rab</div>
              <div className="text-xs font-medium">Kam</div>
              <div className="text-xs font-medium">Jum</div>
              <div className="text-xs font-medium">Sab</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day) => renderDay(day))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                <div key={mood} className="flex items-center gap-1 text-xs">
                  <div className={`w-3 h-3 rounded-full ${color}`} /> 
                  <span>{MOOD_LABELS[mood as MoodLevel]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedDateEntry ? (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MOOD_EMOJIS[selectedDateEntry.mood]}</span>
                <div>
                  <p className="font-medium">{MOOD_LABELS[selectedDateEntry.mood]}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDateEntry.date), "d MMMM yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteEntry(selectedDateEntry)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Aktivitas:</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedDateEntry.activities.map((activity) => (
                  <Badge key={activity} variant="secondary">{activity}</Badge>
                ))}
              </div>
              
              {selectedDateEntry.notes && (
                <>
                  <p className="text-sm font-medium mb-1">Catatan:</p>
                  <p className="text-sm">{selectedDateEntry.notes}</p>
                </>
              )}
            </div>
          </div>
        ) : selectedDate && !isLoading ? (
          <div className="mt-6 flex flex-col items-center justify-center p-4 border rounded-lg text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
            <p>Tidak ada catatan mood untuk {format(selectedDate, "d MMMM yyyy")}</p>
          </div>
        ) : null}
      </CardContent>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus catatan mood ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteEntryMutation.isPending}
            >
              {deleteEntryMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}