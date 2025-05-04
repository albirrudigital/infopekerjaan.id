import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Logo from '@/components/ui/logo';
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  Search, 
  Bell, 
  LogOut,
  Sun,
  Moon 
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/search">
              <Button variant="ghost" className="font-medium">
                Lowongan
              </Button>
            </Link>
            <Link href="/companies">
              <Button variant="ghost" className="font-medium">
                Perusahaan
              </Button>
            </Link>
            <Link href="/regulations">
              <Button variant="ghost" className="font-medium">
                Regulasi
              </Button>
            </Link>
            {user?.type === 'admin' && (
              <Link href="/admin">
                <Button variant="ghost" className="font-medium text-accent">
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Desktop CTA/User Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <>
                <Link href="/search">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Search className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="relative group">
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-background rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-xs">{user.email}</div>
                    </div>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Button>
                    </Link>
                    {user.type === 'jobseeker' && (
                      <>
                        <Link href="/applications">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <Search className="mr-2 h-4 w-4" />
                            Lamaran Saya
                          </Button>
                        </Link>
                        <Link href="/achievements">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <span className="mr-2">🏆</span>
                            Pencapaian Saya
                          </Button>
                        </Link>
                        <Link href="/leaderboard">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <span className="mr-2">🏅</span>
                            Papan Peringkat
                          </Button>
                        </Link>
                        <Link href="/mood-tracker">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <span className="mr-2">😊</span>
                            Mood Tracker
                          </Button>
                        </Link>
                        <Link href="/career-simulator">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <span className="mr-2">🔄</span>
                            Simulator Karir
                          </Button>
                        </Link>
                      </>
                    )}
                    {user.type === 'employer' && (
                      <>
                        <Link href="/company">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <Building2 className="mr-2 h-4 w-4" />
                            Profil Perusahaan
                          </Button>
                        </Link>
                        <Link href="/jobs/manage">
                          <Button variant="ghost" className="w-full justify-start px-4 rounded-none">
                            <Search className="mr-2 h-4 w-4" />
                            Kelola Lowongan
                          </Button>
                        </Link>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-4 rounded-none text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Masuk</Button>
                </Link>
                <Link href="/auth">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2 rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" onClick={toggleMobileMenu} size="icon">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden absolute z-50 w-full bg-background border-b border-border transition-transform duration-300 ease-in-out transform",
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="px-4 py-4 space-y-1">
          <Link href="/search" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Lowongan
            </Button>
          </Link>
          <Link href="/companies" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Perusahaan
            </Button>
          </Link>
          <Link href="/regulations" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Regulasi
            </Button>
          </Link>
          {user?.type === 'admin' && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-accent">
                Admin
              </Button>
            </Link>
          )}
          
          {user ? (
            <>
              <div className="py-2 border-t border-border">
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs">{user.email}</div>
                </div>
              </div>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
              </Link>
              {user.type === 'jobseeker' && (
                <>
                  <Link href="/applications" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Search className="mr-2 h-4 w-4" />
                      Lamaran Saya
                    </Button>
                  </Link>
                  <Link href="/achievements" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <span className="mr-2">🏆</span>
                      Pencapaian Saya
                    </Button>
                  </Link>
                  <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <span className="mr-2">🏅</span>
                      Papan Peringkat
                    </Button>
                  </Link>
                  <Link href="/mood-tracker" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <span className="mr-2">😊</span>
                      Mood Tracker
                    </Button>
                  </Link>
                  <Link href="/career-simulator" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <span className="mr-2">🔄</span>
                      Simulator Karir
                    </Button>
                  </Link>
                </>
              )}
              {user.type === 'employer' && (
                <>
                  <Link href="/company" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Building2 className="mr-2 h-4 w-4" />
                      Profil Perusahaan
                    </Button>
                  </Link>
                  <Link href="/jobs/manage" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Search className="mr-2 h-4 w-4" />
                      Kelola Lowongan
                    </Button>
                  </Link>
                </>
              )}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2 border-t border-border">
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Masuk</Button>
              </Link>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;