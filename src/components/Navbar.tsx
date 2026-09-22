import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  BookOpen,
  CheckCircle,
  Building2,
  Image as ImageIcon,
  Phone,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { SchoolLocation } from '../types';

interface NavbarProps {
  school: SchoolLocation;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  school,
  activeSection,
  onNavigate,
  isAdminLoggedIn,
  onOpenAdmin,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Compass },
    { id: 'gis-map', label: 'Peta GIS', icon: MapPin },
    { id: 'tentang-tkj', label: 'Konsentrasi TKJ', icon: BookOpen },
    { id: 'manfaat', label: 'Tujuan & Manfaat', icon: CheckCircle },
    { id: 'dudi-catalog', label: 'Daftar DUDI', icon: Building2 },
    { id: 'galeri', label: 'Galeri', icon: ImageIcon },
    { id: 'kontak', label: 'Kontak', icon: Phone },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs transition-all">
      {/* Top micro banner */}
      <div className="bg-red-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-medium tracking-wide">
              Sistem Informasi Geografis (GIS) Tempat PKL TKJ - {school.name}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-neutral-100">
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              <span>{school.website.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-red-300">|</span>
            <span>{school.email}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Branding */}
          <div
            id="brand-logo-container"
            onClick={() => handleItemClick('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* School Logo Graphic Placeholder */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform duration-300 border-2 border-white ring-2 ring-red-100">
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="font-extrabold text-xs tracking-tighter">SMK</span>
                <span className="font-black text-sm tracking-tight text-yellow-300">N 1</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-neutral-900 group-hover:text-red-700 transition-colors">
                  SMK NEGERI 1 SONGGOM
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                  TKJ
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium tracking-tight -mt-0.5">
                GIS Mapping Praktik Kerja Lapangan
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-red-700 bg-red-50/80 shadow-xs ring-1 ring-red-200'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Admin / CMS Panel */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-admin-access"
              onClick={onOpenAdmin}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-md hover:shadow-red-600/20 active:scale-95'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'Panel CMS Admin' : 'Admin CMS'}</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
              )}
            </button>

            {isAdminLoggedIn && (
              <button
                id="btn-admin-quick-logout"
                onClick={onLogoutAdmin}
                className="hidden sm:inline-flex text-xs text-neutral-500 hover:text-red-600 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                title="Keluar dari sesi Admin"
              >
                Keluar
              </button>
            )}

            {/* Mobile menu hamburger button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-neutral-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-neutral-100">
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs text-neutral-500 hover:text-red-600"
              >
                <span>Website Resmi SMKN 1 Songgom</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
