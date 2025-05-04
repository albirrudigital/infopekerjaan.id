import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MoodLevel, useMoodTracker } from "@/hooks/use-mood-tracker";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  mood: z.enum(["very_high", "high", "moderate", "low", "very_low"]),
  notes: z.string().min(3, "Catatan minimal 3 karakter").max(500, "Catatan maksimal 500 karakter"),
  activities: z.array(z.string()).min(1, "Pilih minimal 1 aktivitas"),
});

type FormData = z.infer<typeof formSchema>;

const ACTIVITIES = [
  { id: "job_application", label: "Mengirim Lamaran" },
  { id: "interview", label: "Interview" },
  { id: "networking", label: "Networking" },
  { id: "skill_building", label: "Belajar Skill Baru" },
  { id: "career_research", label: "Riset Karir" },
  { id: "resume_update", label: "Update CV" },
  { id: "self_care", label: "Aktivitas Self-Care" },
  { id: "rejection", label: "Menerima Penolakan" },
];

const MOOD_LABELS: Record<MoodLevel, { label: string, emoji: string }> = {
  "very_high": { label: "Sangat Baik", emoji: "😄" },
  "high": { label: "Baik", emoji: "🙂" },
  "moderate": { label: "Biasa Saja", emoji: "😐" },
  "low": { label: "Kurang Baik", emoji: "😕" },
  "very_low": { label: "Sangat Buruk", emoji: "😢" },
};

interface MoodEntryFormProps {
  onSubmitSuccess?: () => void;
}

export function MoodEntryForm({ onSubmitSuccess }: MoodEntryFormProps) {
  const { addEntryMutation } = useMoodTracker();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "moderate",
      notes: "",
      activities: [],
    },
  });

  const onSubmit = (data: FormData) => {
    addEntryMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        if (onSubmitSuccess) onSubmitSuccess();
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bagaimana Perasaan Anda Hari Ini?</CardTitle>
        <CardDescription>
          Catat mood dan aktivitas pencarian kerja Anda untuk melacak perkembangan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Pilih Mood Anda Hari Ini</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {Object.entries(MOOD_LABELS).map(([value, { label, emoji }]) => (
                        <FormItem key={value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {emoji} {label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activities"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Aktivitas Hari Ini</FormLabel>
                    <FormDescription>
                      Pilih aktivitas pencarian kerja yang Anda lakukan hari ini
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ACTIVITIES.map((activity) => (
                      <FormField
                        key={activity.id}
                        control={form.control}
                        name="activities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={activity.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(activity.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, activity.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== activity.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {activity.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis catatan tentang mood dan aktivitas Anda hari ini..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Bagikan apa yang Anda rasakan, tantangan yang dihadapi, atau hal positif yang terjadi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={addEntryMutation.isPending}
              className="w-full"
            >
              {addEntryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Catatan Mood"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}