import React from 'react';
import {
  Network,
  Radio,
  Cpu,
  Server,
  Award,
  CheckCircle2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { CMSContent } from '../types';

interface TentangTkjSectionProps {
  cms: CMSContent;
}

export const TentangTkjSection: React.FC<TentangTkjSectionProps> = ({ cms }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Network':
        return <Network className="w-6 h-6 text-red-600" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-red-600" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-red-600" />;
      case 'Server':
        return <Server className="w-6 h-6 text-red-600" />;
      default:
        return <Network className="w-6 h-6 text-red-600" />;
    }
  };

  return (
    <section id="tentang-tkj" className="py-14 lg:py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>KONSENTRASI KEAHLIAN VOKASI</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            {cms.tkj.title}
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-3 leading-relaxed">
            {cms.tkj.description}
          </p>
        </div>

        {/* 4 Competency Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {cms.tkj.competencies.map((comp, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs hover:shadow-xl hover:border-red-400 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-50 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors mb-5 border border-red-100">
                  <div className="group-hover:text-white transition-colors">
                    {getIcon(comp.icon)}
                  </div>
                </div>
                <h3 className="font-extrabold text-base text-neutral-900 group-hover:text-red-700 transition-colors mb-2">
                  {comp.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                <span>Modul Praktik #{index + 1}</span>
                <span className="text-red-600 group-hover:translate-x-1 transition-transform">
                  Standar Industri →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Career Pathways & Industry Preparation Box */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl border-4 border-white ring-1 ring-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kesiapan Kerja & Sertifikasi</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Mempersiapkan Siswa Menuju Dunia Industri Nyata
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                Program Praktik Kerja Lapangan (PKL) adalah mata rantai krusial antara teori di laboratorium sekolah dengan tantangan nyata operasional lapangan. Lulusan TKJ SMK Negeri 1 Songgom dibekali kecakapan profesional, etika kerja, dan sertifikasi BNSP.
              </p>
            </div>

            <div className="lg:col-span-6 bg-white/5 backdrop-blur-xs rounded-2xl p-6 border border-white/10">
              <h4 className="text-xs font-extrabold tracking-wider uppercase text-red-400 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Prospek Karir & Penempatan PKL Siswa TKJ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-200">
                {cms.tkj.careerOpportunities.map((career, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{career}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
