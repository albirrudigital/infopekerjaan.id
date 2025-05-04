import React, { useState } from 'react';
import { ProfileCompletionItem } from './profile-completion-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definisikan interface untuk item kelengkapan profil
interface ProfileCompletionItemData {
  id: number;
  name: string;
  description: string;
  pointValue: number;
  category: string;
  userType: string;
  iconName?: string;
  isRequired: boolean;
  displayOrder: number;
  completed: boolean;
  completedAt?: Date | null;
}

interface GroupedItems {
  [key: string]: ProfileCompletionItemData[];
}

interface ProfileCompletionListProps {
  items: ProfileCompletionItemData[];
  groupedItems?: GroupedItems;
  onToggle?: (itemId: number, completed: boolean) => void;
  className?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  'basic_info': 'Informasi Dasar',
  'professional_info': 'Informasi Profesional',
  'documents': 'Dokumen',
  'preferences': 'Preferensi',
  'verification': 'Verifikasi'
};

/**
 * Komponen untuk menampilkan daftar item kelengkapan profil
 */
export function ProfileCompletionList({
  items,
  groupedItems,
  onToggle,
  className
}: ProfileCompletionListProps) {
  // Jika tidak ada groupedItems, buat pengelompokan otomatis berdasarkan kategori
  const groups = groupedItems || items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedItems);

  // State untuk melacak kategori yang dibuka/ditutup
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Secara default, semua kategori dibuka
    return Object.keys(groups).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Toggle kategori terbuka/tertutup
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Hitung persentase kelengkapan per kategori
  const calculateCategoryPercentage = (items: ProfileCompletionItemData[]) => {
    if (!items.length) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {Object.keys(groups).map(category => {
        const categoryItems = groups[category];
        const isExpanded = expandedCategories[category] ?? true;
        const categoryPercentage = calculateCategoryPercentage(categoryItems);
        const categoryDisplayName = CATEGORY_NAMES[category] || category;
        
        return (
          <div key={category} className="border rounded-lg overflow-hidden">
            {/* Header kategori */}
            <div 
              className="bg-muted/30 p-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium">{categoryDisplayName}</h3>
                <Badge variant="outline" className={categoryPercentage === 100 ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                  {categoryPercentage}%
                </Badge>
              </div>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Daftar item dalam kategori */}
            {isExpanded && (
              <div className="p-3 space-y-3">
                {categoryItems.map(item => (
                  <ProfileCompletionItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    completed={item.completed}
                    category={item.category}
                    iconName={item.iconName}
                    pointValue={item.pointValue}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}