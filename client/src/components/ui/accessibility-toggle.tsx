import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AccessibilityToggle() {
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);
  const { toast } = useToast();

  // Periksa apakah mode aksesibilitas sudah diaktifkan sebelumnya
  useEffect(() => {
    const savedMode = localStorage.getItem('accessibility-mode');
    if (savedMode === 'true') {
      setAccessibilityMode(true);
      applyAccessibilityStyles(true);
    }
  }, []);

  const toggleAccessibilityMode = () => {
    const newMode = !accessibilityMode;
    setAccessibilityMode(newMode);
    
    // Simpan preferensi ke localStorage
    localStorage.setItem('accessibility-mode', String(newMode));
    
    // Terapkan perubahan style untuk aksesibilitas
    applyAccessibilityStyles(newMode);
    
    // Tampilkan toast untuk konfirmasi
    toast({
      title: newMode 
        ? "Mode Aksesibilitas Diaktifkan" 
        : "Mode Aksesibilitas Dinonaktifkan",
      description: newMode 
        ? "Tampilan telah disesuaikan untuk pembaca layar dan aksesibilitas yang lebih baik." 
        : "Kembali ke tampilan default.",
    });
  };

  // Fungsi untuk menerapkan perubahan style
  const applyAccessibilityStyles = (enable: boolean) => {
    const htmlElement = document.documentElement;
    
    if (enable) {
      // Tingkatkan kontras
      htmlElement.classList.add('accessibility-mode');
      // Tambahkan class untuk ukuran font lebih besar
      htmlElement.classList.add('text-accessibility');
      // Tambahkan fokus yang lebih jelas
      document.body.style.setProperty('--focus-ring', '3px solid #0077FF');
    } else {
      // Hapus kelas aksesibilitas
      htmlElement.classList.remove('accessibility-mode');
      htmlElement.classList.remove('text-accessibility');
      document.body.style.removeProperty('--focus-ring');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleAccessibilityMode}
      className={`flex items-center gap-2 ${accessibilityMode ? 'bg-primary text-primary-foreground' : ''}`}
      aria-pressed={accessibilityMode}
    >
      <Eye className="h-4 w-4" />
      <span className="sr-only md:not-sr-only md:inline-block">
        {accessibilityMode ? 'Mode Aksesibilitas Aktif' : 'Mode Aksesibilitas'}
      </span>
    </Button>
  );
}