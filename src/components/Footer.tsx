import React from 'react';
import { SchoolLocation } from '../types';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  ChevronRight,
  Shield,
  Heart,
} from 'lucide-react';

interface FooterProps {
  school: SchoolLocation;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ school, onNavigate }) => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t-4 border-red-600">
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 py-3 px-4 text-white text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>Vokasi Bermutu: SMK Bisa, SMK Hebat, Siap Kerja - Santun - Mandiri - Kreatif</span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            Konsentrasi Keahlian TKJ
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Identity & School Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-red-950/40 border border-red-500">
                <div className="text-center leading-tight">
                  <div>SMK</div>
                  <div className="text-yellow-400 text-xs">N 1</div>
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  SMK NEGERI 1 SONGGOM
                </h3>
                <p className="text-xs text-red-400 font-medium">Kabupaten Brebes, Jawa Tengah</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Sistem Informasi Geografis (GIS) terpadu untuk pemetaan lokasi Praktik Kerja Lapangan
              (PKL) siswa jurusan Teknik Komputer dan Jaringan. Mendukung kemudahan akses informasi
              dan transparansi kemitraan industri.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400">
              <Shield className="w-4 h-4 text-red-500 shrink-0" />
              <span>{school.accreditation} • NPSN Resmi Kemendikbud</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
              Menu Cepat
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { id: 'beranda', label: 'Beranda & Statistik' },
                { id: 'gis-map', label: 'Peta Spasial GIS' },
                { id: 'tentang-tkj', label: 'Profil Jurusan TKJ' },
                { id: 'manfaat', label: 'Tujuan & Manfaat Mapping' },
                { id: 'dudi-catalog', label: 'Daftar Tempat DUDI' },
                { id: 'galeri', label: 'Dokumentasi Galeri PKL' },
                { id: 'kontak', label: 'Hubungi Sekolah & Saran' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Wilayah Cakupan DUDI */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
              Cakupan Wilayah DUDI
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              Persebaran mitra industri praktik kerja siswa TKJ meliputi:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                <span className="font-bold text-white block">Kab. Brebes</span>
                <span className="text-[11px] text-neutral-400">Songgom, Ketanggungan, Larangan, Jatibarang</span>
              </div>
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                <span className="font-bold text-white block">Kab. Tegal</span>
                <span className="text-[11px] text-neutral-400">Slawi, Dukuhturi, Margasari, Lebaksiu</span>
              </div>
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                <span className="font-bold text-white block">Kota Tegal</span>
                <span className="text-[11px] text-neutral-400">Tegalsari & Pusat Perkantoran</span>
              </div>
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700/60">
                <span className="font-bold text-white block">Banyumas</span>
                <span className="text-[11px] text-neutral-400">Purwokerto (BUMN & ISP Nasional)</span>
              </div>
            </div>
          </div>

          {/* Col 4: Kontak Resmi Sekolah */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
              Kontak Resmi
            </h4>

            <div className="flex items-start gap-2.5 text-xs text-neutral-400">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{school.address}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <span>{school.phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <a href={`mailto:${school.email}`} className="hover:text-white transition-colors">
                {school.email}
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-neutral-400">
              <Globe className="w-4 h-4 text-red-500 shrink-0" />
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white text-red-400 hover:underline flex items-center gap-1 font-medium transition-colors"
              >
                <span>https://www.smkn1songgom.sch.id</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} SMK Negeri 1 Songgom. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Dikembangkan untuk Konsentrasi Keahlian TKJ SMKN 1 Songgom</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
