import React from 'react';
import Header from './header';
import Logo from '@/components/ui/logo';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-primary/5 py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="lg" />
              </div>
              <p className="text-muted-foreground text-sm">
                Platform rekrutmen kerja terpercaya di Indonesia, menghubungkan pencari kerja dengan lowongan dari perusahaan terkemuka sejak 2023.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Untuk Pencari Kerja</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/search" className="hover:text-primary transition-colors">Cari Lowongan</a></li>
                <li><a href="/companies" className="hover:text-primary transition-colors">Perusahaan</a></li>
                <li><a href="/salary" className="hover:text-primary transition-colors">Data Gaji</a></li>
                <li><a href="/career-advice" className="hover:text-primary transition-colors">Tips Karier</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Untuk Perusahaan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/employer" className="hover:text-primary transition-colors">Pasang Lowongan</a></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">Harga Layanan</a></li>
                <li><a href="/solutions" className="hover:text-primary transition-colors">Solusi Rekrutmen</a></li>
                <li><a href="/success-stories" className="hover:text-primary transition-colors">Kisah Sukses</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Informasi</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Hubungi Kami</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;