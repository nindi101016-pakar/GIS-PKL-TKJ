export interface Dudi {
  id: string;
  no: number;
  nama_dudi: string;
  maksimal_siswa: number;
  pimpinan: string;
  jenis_dudi: string; // e.g. Mandiri, CV/PT, Industri, BUMN
  bidang_pekerjaan: string; // e.g. Teknisi / Mekanik, Jasa, Penjualan, Jaringan
  alamat: string;
  kabupaten: string; // e.g. Kab. Brebes, Kab. Tegal, Kota Tegal, Kab. Banyumas
  latitude: number;
  longitude: number;
  no_hp: string;
  jaminan: string;
  nominal: number;
  jarakKm?: number; // Calculated distance dynamically
  created_at?: string;
  updated_at?: string;
}

export interface SchoolLocation {
  name: string;
  tagline: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  headmaster?: string;
  departmentName: string;
  accreditation?: string;
}

export interface CMSContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    statsText?: string;
    primaryCta?: string;
    secondaryCta?: string;
  };
  tkj: {
    title: string;
    description: string;
    subtitle?: string;
    skills?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    competencies: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    careerOpportunities: string[];
  };
  manfaat: {
    title: string;
    subtitle: string;
    categories?: Array<{
      target: string;
      points: string[];
      icon: string;
    }>;
    benefits: Array<{
      target: string;
      points: string[];
      icon: string;
    }>;
  };
  kontak: {
    address: string;
    email: string;
    phone: string;
    website: string;
    operatingHours: string;
    googleMapsEmbed?: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Kegiatan PKL' | 'Monitoring Guru' | 'Instalasi Jaringan' | 'Perakitan & Servis' | 'Pengujian Alat' | string;
  imageUrl: string;
  description: string;
  date: string;
}

export interface MeasureOrigin {
  type: 'school' | 'user' | 'custom';
  name: string;
  latitude: number;
  longitude: number;
}

export interface DudiFilters {
  searchQuery: string;
  kabupaten: string;
  bidangPekerjaan: string;
  jenisDudi: string;
  maxDistance: number; // 0 means any
  sortBy: 'terdekat' | 'nama_asc' | 'kuota_desc';
}
