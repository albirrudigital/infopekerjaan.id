import React from 'react';
import { Link } from 'wouter';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/">
              <img 
                src="/assets/logo.png" 
                alt="InfoPekerjaan.id" 
                className="h-8 object-contain cursor-pointer"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Platform rekrutmen kerja terpercaya di Indonesia.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Perusahaan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Tentang Kami
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Hubungi Kami
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Karir
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Kandidat</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Cari Lowongan
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/bekasi-companies">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Perusahaan Bekasi
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/regulations">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Regulasi Ketenagakerjaan
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Employer</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/post-job">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Pasang Lowongan
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/employer/dashboard">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Dashboard Employer
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    Harga
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} InfoPekerjaan.id. Hak Cipta Dilindungi.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Syarat & Ketentuan
              </span>
            </Link>
            <Link href="/privacy">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Kebijakan Privasi
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}