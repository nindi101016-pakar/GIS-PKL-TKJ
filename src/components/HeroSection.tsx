import React from 'react';
import {
  MapPin,
  Building2,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { CMSContent, SchoolLocation, Dudi } from '../types';

interface HeroSectionProps {
  cms: CMSContent;
  school: SchoolLocation;
  dudiList: Dudi[];
  onNavigate: (sectionId: string) => void;
  onSelectDudiForMap: (dudi: Dudi) => void;
  onOpenAdmin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  cms,
  school,
  dudiList,
  onNavigate,
  onSelectDudiForMap,
  onOpenAdmin,
}) => {
  const [quickSearch, setQuickSearch] = React.useState('');

  const totalKuota = dudiList.reduce((acc, curr) => acc + (curr.maksimal_siswa || 0), 0);
  const totalBrebes = dudiList.filter((d) => d.kabupaten === 'Kab. Brebes').length;
  const totalTegal = dudiList.filter((d) => d.kabupaten?.includes('Tegal')).length;

  const filteredQuickDudi = quickSearch.trim()
    ? dudiList
        .filter(
          (d) =>
            d.nama_dudi.toLowerCase().includes(quickSearch.toLowerCase()) ||
            d.bidang_pekerjaan.toLowerCase().includes(quickSearch.toLowerCase()) ||
            d.alamat.toLowerCase().includes(quickSearch.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <section id="beranda" className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-200">
      {/* Background Decorative Mesh & Red Accents */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-red-100/60 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-red-50/80 rounded-full blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* School Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>{school.name} • {school.departmentName}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
              {cms.hero.headline.split(' ').map((word, i) => {
                const isHighlight = ['PKL', 'Teknik', 'Komputer', '&', 'Jaringan'].includes(word);
                return (
                  <span
                    key={i}
                    className={isHighlight ? 'text-red-600 inline-block font-extrabold' : ''}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </h1>

            {/* Subheadline / Tagline */}
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {cms.hero.subheadline}
            </p>

            {/* Quick Search Bar */}
            <div className="relative max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center rounded-xl border-2 border-red-100 hover:border-red-300 focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-100 bg-white shadow-sm transition-all p-1.5">
                <Search className="w-5 h-5 text-neutral-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari cepat DUDI, pimpinan, atau bidang..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                {quickSearch && (
                  <button
                    onClick={() => setQuickSearch('')}
                    className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1"
                  >
                    Hapus
                  </button>
                )}
                <button
                  onClick={() => onNavigate('dudi-catalog')}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                >
                  Cari
                </button>
              </div>

              {/* Quick Dropdown Results */}
              {filteredQuickDudi.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 divide-y divide-neutral-100 z-30 max-h-60 overflow-y-auto text-left">
                  {filteredQuickDudi.map((dudi) => (
                    <div
                      key={dudi.id}
                      onClick={() => {
                        onSelectDudiForMap(dudi);
                        setQuickSearch('');
                        onNavigate('gis-map');
                      }}
                      className="p-3 hover:bg-red-50/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{dudi.nama_dudi}</div>
                        <div className="text-xs text-neutral-500 truncate max-w-sm">
                          {dudi.bidang_pekerjaan} • {dudi.kabupaten}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-red-600 shrink-0 flex items-center gap-1">
                        Peta <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="btn-hero-open-map"
                onClick={() => onNavigate('gis-map')}
                className="flex items-center gap-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/30 transition-all group"
              >
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                <span>Buka Peta GIS & Ukur Jarak</span>
              </button>

              <button
                id="btn-hero-open-catalog"
                onClick={() => onNavigate('dudi-catalog')}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-bold px-5 py-3.5 rounded-xl border border-neutral-200 transition-colors"
              >
                <Building2 className="w-5 h-5 text-neutral-600" />
                <span>Katalog DUDI ({dudiList.length})</span>
              </button>

              <button
                id="btn-hero-open-admin"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 border border-neutral-200/80 transition-colors"
                title="Kelola Data lewat CMS"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Admin CMS</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Interactive Quick Stats & Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 sm:p-7 shadow-2xl border-4 border-white ring-1 ring-neutral-200">
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-black">
                    GIS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Pusat Data Geospasial PKL</h3>
                    <p className="text-xs text-neutral-400">SMK Negeri 1 Songgom</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3.5 my-6">
                <div className="bg-neutral-800/80 rounded-xl p-3.5 border border-neutral-700/70 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Tempat DUDI</span>
                    <Building2 className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{dudiList.length}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Mitra Resmi Vokasi</div>
                </div>

                <div className="bg-neutral-800/80 rounded-xl p-3.5 border border-neutral-700/70 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Total Kuota</span>
                    <Navigation className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{totalKuota}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Siswa TKJ Ditampung</div>
                </div>

                <div className="bg-neutral-800/80 rounded-xl p-3.5 border border-neutral-700/70 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Zona Brebes</span>
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{totalBrebes}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Wilayah Domisili</div>
                </div>

                <div className="bg-neutral-800/80 rounded-xl p-3.5 border border-neutral-700/70 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Zona Tegal & Sekitar</span>
                    <Compass className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{totalTegal}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">DUDI Ekspansi</div>
                </div>
              </div>

              {/* School Coordinate Anchor */}
              <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-red-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="font-medium truncate">
                    Titik Pusat: SMKN 1 Songgom (-7.0264, 108.9982)
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('gis-map')}
                  className="text-red-400 hover:text-white font-bold underline shrink-0 cursor-pointer"
                >
                  Pusatkan Peta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
