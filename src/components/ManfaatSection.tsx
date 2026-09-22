import React from 'react';
import {
  CheckCircle,
  UserCheck,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Compass,
} from 'lucide-react';
import { CMSContent } from '../types';

interface ManfaatSectionProps {
  cms: CMSContent;
}

export const ManfaatSection: React.FC<ManfaatSectionProps> = ({ cms }) => {
  const getIcon = (target: string) => {
    if (target.includes('Siswa')) {
      return <UserCheck className="w-6 h-6 text-red-600" />;
    }
    if (target.includes('Sekolah') || target.includes('Guru')) {
      return <GraduationCap className="w-6 h-6 text-red-600" />;
    }
    return <Briefcase className="w-6 h-6 text-red-600" />;
  };

  return (
    <section id="manfaat" className="py-14 lg:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>DAMPAK & EFISIENSI SPASIAL</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            {cms.manfaat.title}
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-3 leading-relaxed">
            {cms.manfaat.subtitle}
          </p>
        </div>

        {/* 3 Pillars Benefit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cms.manfaat.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-7 border-2 border-neutral-200/90 hover:border-red-500 hover:bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {getIcon(benefit.target)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-red-600 tracking-wider block">
                      Pilar #{index + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-neutral-900">
                      {benefit.target}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {benefit.points.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-neutral-600 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-200/70 text-[11px] font-bold text-red-700 flex items-center justify-between">
                <span>Efisiensi Berbasis GIS</span>
                <span>✓ Terintegrasi</span>
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition Callout Banner */}
        <div className="mt-14 bg-red-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-600/20">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              Ingin Mengetahui Estimasi Jarak Tempat PKL dari Rumah Anda?
            </h4>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Gunakan fitur Pengukuran Jarak GIS Interaktif untuk memilih DUDI terdekat dengan biaya transportasi paling efisien.
            </p>
          </div>
          <a
            href="#gis-map"
            className="bg-white text-red-700 hover:bg-neutral-100 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
          >
            Buka Alat Ukur Jarak Peta
          </a>
        </div>

      </div>
    </section>
  );
};
