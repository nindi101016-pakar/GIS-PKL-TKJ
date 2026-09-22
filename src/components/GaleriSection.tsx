import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Calendar,
  Tag,
  ZoomIn,
  X,
  ExternalLink,
} from 'lucide-react';
import { GalleryItem } from '../types';

interface GaleriSectionProps {
  galleryItems: GalleryItem[];
}

export const GaleriSection: React.FC<GaleriSectionProps> = ({ galleryItems = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const safeList = Array.isArray(galleryItems) ? galleryItems : [];

  const categories = [
    'Semua',
    'Instalasi Jaringan',
    'Perakitan & Servis',
    'Pengujian Alat',
  ];

  const filteredItems =
    selectedCategory === 'Semua'
      ? safeList
      : safeList.filter((item) => item?.category === selectedCategory);

  return (
    <section id="galeri" className="py-14 lg:py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>DOKUMENTASI FOTO AKTIVITAS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Galeri Praktik Kerja Lapangan Siswa TKJ
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Dokumentasi pengalaman belajar nyata siswa jurusan Teknik Komputer dan Jaringan SMK Negeri 1 Songgom di berbagai mitra industri.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
            >
              {/* Photo Box */}
              <div className="relative aspect-video sm:aspect-4/3 overflow-hidden bg-neutral-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-neutral-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 rounded-full bg-white/90 text-neutral-900 shadow-lg">
                    <ZoomIn className="w-5 h-5 text-red-600" />
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Caption & Date */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-2 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                  <span className="text-red-600 font-bold group-hover:underline">Lihat Detail</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                    {activeItem.category}
                  </span>
                  <span className="text-xs text-neutral-400">• {activeItem.date}</span>
                </div>
                <h3 className="font-extrabold text-lg text-neutral-900 mb-2">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {activeItem.description}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
