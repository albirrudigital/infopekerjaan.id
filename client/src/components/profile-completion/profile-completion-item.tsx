import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  LucideIcon,
  UserCircle2,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Image,
  Award,
  MapPin,
  Settings,
  Clock,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCompletionItemProps {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  category: string;
  iconName?: string;
  pointValue: number;
  onToggle?: (itemId: number, completed: boolean) => void;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'user': UserCircle2,
  'briefcase': Briefcase,
  'education': GraduationCap,
  'file': FileText,
  'email': Mail,
  'phone': Phone,
  'image': Image,
  'award': Award,
  'location': MapPin,
  'settings': Settings,
  'time': Clock,
  'shield': Shield
};

/**
 * Menampilkan item kelengkapan profil dengan efek gamifikasi
 */
export function ProfileCompletionItem({
  id,
  name,
  description,
  completed,
  category,
  iconName = 'user',
  pointValue,
  onToggle,
  className
}: ProfileCompletionItemProps) {
  const { toast } = useToast();
  const Icon = ICON_MAP[iconName] || UserCircle2;

  // Fungsi untuk menangani perubahan status item
  const handleChange = (checked: boolean) => {
    if (onToggle) {
      onToggle(id, checked);
    }
  };

  // Fungsi untuk menangani navigasi ke halaman terkait
  const handleNavigate = () => {
    let navigationUrl = '/profile';
    
    switch (category) {
      case 'basic_info':
        navigationUrl = '/profile/edit';
        break;
      case 'professional_info':
        navigationUrl = '/profile/professional';
        break;
      case 'documents':
        navigationUrl = '/profile/documents';
        break;
      case 'preferences':
        navigationUrl = '/profile/preferences';
        break;
      case 'verification':
        navigationUrl = '/profile/verification';
        break;
    }
    
    // Untuk tujuan demo, tampilkan toast saja
    toast({
      title: 'Navigasi ke ' + navigationUrl,
      description: 'Menuju ke halaman untuk mengisi ' + name,
    });
    
    // Pada implementasi sebenarnya, gunakan navigasi
    // navigate(navigationUrl);
  };

  return (
    <div 
      className={cn(
        "flex items-start p-3 rounded-lg border transition-all", 
        completed ? "bg-muted/30 border-muted" : "bg-card border-border hover:border-primary/30",
        className
      )}
    >
      <div className="flex-shrink-0 mr-3">
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            completed ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center mb-1">
          <h4 className="text-sm font-medium mr-auto">{name}</h4>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
            +{pointValue} poin
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <Checkbox 
              id={`completion-item-${id}`}
              checked={completed}
              onCheckedChange={handleChange}
              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
            />
            <label htmlFor={`completion-item-${id}`} className="ml-2 text-xs">
              {completed ? (
                <span className="text-emerald-500 font-medium flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Selesai
                </span>
              ) : (
                <span className="text-amber-500 font-medium flex items-center">
                  <Circle className="h-3.5 w-3.5 mr-1" />
                  Belum Selesai
                </span>
              )}
            </label>
          </div>
          
          {!completed && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={handleNavigate}
            >
              Lengkapi <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}