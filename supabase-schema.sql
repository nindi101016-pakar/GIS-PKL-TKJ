-- ============================================================================
-- SKEMA BASIS DATA SUPABASE RESMI (VERSI TERBARU & TERTATA RAPI)
-- SISTEM INFORMASI GEOGRAFIS (GIS) PEMETAAN TEMPAT PKL TKJ
-- SMK NEGERI 1 SONGGOM - BREBES DAN SEKITARNYA
-- ============================================================================
-- 4 TABEL UTAMA PENGATUR ISIAN APLIKASI:
-- 1. public.admin       : Data pengguna administrator sistem
-- 2. public.dudi        : Data tempat PKL / Mitra Industri Vokasi TKJ
-- 3. public.pengaturan  : Data konfigurasi teks hero, kejuruan TKJ, & kontak
-- 4. public.galeri      : Data dokumentasi foto kegiatan praktik siswa
--
-- DILENGKAPI:
-- Registrasi langsung ke Supabase Authentication (auth.users) agar akun
-- admin resmi Pak Aryanoe (pakaryanoe@gmail.com) langsung terdaftar di menu
-- "Authentication -> Users" dashboard Supabase Anda!
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AKTIFKAN EKSTENSI POSTGRESQL YANG DIBUTUHKAN
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. PENDAFTARAN RESMI KE SUPABASE AUTHENTICATION (auth.users & auth.identities)
-- Kredensial Admin Utama:
-- Email    : pakaryanoe@gmail.com
-- Password : @PTKsonggom1
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    superadmin_uid UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Masukkan ke auth.users jika belum ada atau update passwordnya
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        superadmin_uid,
        'authenticated',
        'authenticated',
        'pakaryanoe@gmail.com',
        crypt('@PTKsonggom1', gen_salt('bf')),
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Pak Aryanoe (Administrator GIS SMKN 1 Songgom)","role":"superadmin"}'::jsonb,
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        '',
        '',
        '',
        ''
    )
    ON CONFLICT (id) DO UPDATE
    SET encrypted_password = crypt('@PTKsonggom1', gen_salt('bf')),
        email = 'pakaryanoe@gmail.com',
        email_confirmed_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now()),
        raw_user_meta_data = '{"full_name":"Pak Aryanoe (Administrator GIS SMKN 1 Songgom)","role":"superadmin"}'::jsonb;

    -- Tambahkan ke auth.identities agar provider email dikenali oleh Supabase GoTrue
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        superadmin_uid,
        jsonb_build_object('sub', superadmin_uid::text, 'email', 'pakaryanoe@gmail.com'),
        'email',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (provider, id) DO UPDATE
    SET identity_data = jsonb_build_object('sub', superadmin_uid::text, 'email', 'pakaryanoe@gmail.com'),
        updated_at = timezone('utc'::text, now());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice on auth.users insert: %', SQLERRM;
END $$;

-- ----------------------------------------------------------------------------
-- 3. TABEL 1: ADMIN (public.admin)
-- Menyimpan informasi hak akses dan profil administrator sistem
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'superadmin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON public.admin(email);

-- ----------------------------------------------------------------------------
-- 4. TABEL 2: DUDI / TEMPAT PKL (public.dudi)
-- Menggunakan ID TEXT PRIMARY KEY yang sinkron ('dudi-1', 'dudi-2', dst)
-- agar proses update nama DUDI menggantikan data lama secara instan dan rapi.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dudi (
    id TEXT PRIMARY KEY,
    no INT NOT NULL,
    nama_dudi VARCHAR(255) NOT NULL,
    maksimal_siswa INT DEFAULT 4,
    pimpinan VARCHAR(255),
    jenis_dudi VARCHAR(100) DEFAULT 'Mandiri',
    bidang_pekerjaan TEXT,
    alamat TEXT NOT NULL,
    kabupaten VARCHAR(100) DEFAULT 'Kab. Brebes',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    no_hp VARCHAR(50),
    jaminan VARCHAR(100) DEFAULT '-',
    nominal NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dudi_no ON public.dudi(no);
CREATE INDEX IF NOT EXISTS idx_dudi_kabupaten ON public.dudi(kabupaten);
CREATE INDEX IF NOT EXISTS idx_dudi_nama ON public.dudi(nama_dudi);

-- ----------------------------------------------------------------------------
-- 5. TABEL 3: PENGATURAN KONTEN APLIKASI (public.pengaturan)
-- Digunakan untuk mengatur isian teks Hero, Jurusan TKJ, Manfaat, dan Kontak
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pengaturan (
    kunci VARCHAR(100) PRIMARY KEY,
    nilai JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. TABEL 4: GALERI DOKUMENTASI (public.galeri)
-- Menyimpan foto dokumentasi peralatan dan kegiatan praktik siswa
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.galeri (
    id TEXT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) DEFAULT 'Instalasi Jaringan',
    url_gambar TEXT NOT NULL,
    deskripsi TEXT,
    tanggal VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_galeri_kategori ON public.galeri(kategori);

-- ----------------------------------------------------------------------------
-- 7. TRIGGER PEMBARUAN OTOMATIS KOLOM updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dudi_updated_at ON public.dudi;
CREATE TRIGGER trigger_dudi_updated_at
    BEFORE UPDATE ON public.dudi
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_pengaturan_updated_at ON public.pengaturan;
CREATE TRIGGER trigger_pengaturan_updated_at
    BEFORE UPDATE ON public.pengaturan
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES LENGKAP
-- Memberikan hak akses penuh agar sistem web dapat membaca dan mengelola data
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Admin" ON public.admin;
CREATE POLICY "Allow All Admin" ON public.admin FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Dudi" ON public.dudi;
CREATE POLICY "Allow All Dudi" ON public.dudi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Pengaturan" ON public.pengaturan;
CREATE POLICY "Allow All Pengaturan" ON public.pengaturan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Galeri" ON public.galeri;
CREATE POLICY "Allow All Galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. SEED DATA TABEL admin: AKUN SUPERADMIN RESMI
-- ----------------------------------------------------------------------------
INSERT INTO public.admin (email, password, full_name, role, is_active)
VALUES (
    'pakaryanoe@gmail.com',
    '@PTKsonggom1',
    'Pak Aryanoe (Administrator GIS SMKN 1 Songgom)',
    'superadmin',
    true
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 10. SEED DATA TABEL pengaturan: ISIAN KONTEN APLIKASI
-- ----------------------------------------------------------------------------
INSERT INTO public.pengaturan (kunci, nilai)
VALUES
(
    'hero',
    '{
        "badge": "Pusat Keunggulan Vokasi TKJ",
        "headline": "Sistem Informasi Geografis Pemetaan Tempat PKL TKJ SMK Negeri 1 Songgom",
        "subheadline": "Portal resmi pemetaan spasial dan basis data terpadu lokasi Praktik Kerja Lapangan (PKL) kompetensi keahlian Teknik Komputer dan Jaringan di wilayah Brebes, Tegal, dan sekitarnya.",
        "primaryCta": "Jelajahi Peta GIS",
        "secondaryCta": "Katalog 32 DUDI"
    }'::jsonb
),
(
    'tkj',
    '{
        "title": "Profil Kompetensi Keahlian TKJ",
        "subtitle": "SMK Negeri 1 Songgom menyiapkan lulusan teknisi jaringan komputer yang terampil, berdaya saing industri, dan berakhlak mulia.",
        "skills": [
            {
                "title": "Teknologi Jaringan Berbasis Luas (WAN & Fiber Optik)",
                "description": "Penguasaan instalasi, splicing serat optik, penarikan kabel FTTH, dan konfigurasi OLT/ONT bersama mitra industri penyedia jasa internet (ISP).",
                "icon": "Network"
            },
            {
                "title": "Administrasi Infrastruktur Jaringan (MikroTik & Cisco)",
                "description": "Routing dinamis, bandwidth management, firewall filtering, hotspot gateway, VPN server, dan monitoring performa jaringan telekomunikasi.",
                "icon": "Cpu"
            },
            {
                "title": "Perakitan PC & Troubleshooting Hardware",
                "description": "Perakitan komputer desktop, diagnosa kerusakan mainboard, penggantian thermal paste, maintenance power supply, dan pengujian stabilitas hardware.",
                "icon": "Laptop"
            },
            {
                "title": "Layanan Servis & Penjualan Komputer (Retail DUDI)",
                "description": "Instalasi sistem operasi, instalasi software berlisensi, perawatan berkala printer dan periferal, serta etika komunikasi teknisi dengan pelanggan.",
                "icon": "Wrench"
            }
        ]
    }'::jsonb
),
(
    'manfaat',
    '{
        "title": "Manfaat Sistem Pemetaan Bagi Sekolah & Industri",
        "subtitle": "Mewujudkan transparansi informasi penempatan siswa magang serta mempererat sinergi link-and-match antara SMKN 1 Songgom dengan DUDI mitra.",
        "categories": [
            {
                "target": "Bagi Siswa & Wali Murid",
                "points": [
                    "Mengetahui jarak tempuh dan koordinat pasti lokasi PKL dari tempat tinggal.",
                    "Melihat bidang pekerjaan teknis yang diajarkan (Jaringan, Servis Komputer, Retail).",
                    "Memastikan kapasitas kuota penerimaan siswa magang yang tersedia.",
                    "Akses langsung nomor telepon dan kontak penanggung jawab tempat PKL."
                ],
                "icon": "GraduationCap"
            },
            {
                "target": "Bagi DUDI Mitra Industri",
                "points": [
                    "Mendapatkan calon tenaga magang yang memiliki kualifikasi sesuai kebutuhan operasional teknis.",
                    "Promosi profil usaha dan reputasi industri sebagai mitra resmi vokasi SMK Negeri 1 Songgom.",
                    "Kemudahan komunikasi langsung dengan pihak BKK / Hubin sekolah.",
                    "Membantu menyaring talenta terbaik untuk direkrut menjadi karyawan tetap pasca kelulusan."
                ],
                "icon": "Briefcase"
            }
        ]
    }'::jsonb
),
(
    'kontak',
    '{
        "address": "Jl. Raya Songgom, Karangsembung, Kec. Songgom, Kab. Brebes, Jawa Tengah 52266",
        "email": "smkn1songgom@gmail.com",
        "phone": "(0283) 6175001 / 0852-2590-7711",
        "website": "https://www.smkn1songgom.sch.id",
        "operatingHours": "Senin - Jumat: 07.00 - 15.30 WIB",
        "googleMapsEmbed": "https://maps.google.com/maps?q=-7.02640,108.99820&z=15&output=embed"
    }'::jsonb
)
ON CONFLICT (kunci) DO UPDATE
SET nilai = EXCLUDED.nilai, updated_at = timezone('utc'::text, now());

-- ----------------------------------------------------------------------------
-- 11. SEED DATA TABEL galeri: DOKUMENTASI TEKNIS & PERALATAN
-- Dokumentasi teknis hardware dan instalasi jaringan tanpa menampilkan wajah
-- ----------------------------------------------------------------------------
INSERT INTO public.galeri (id, judul, kategori, url_gambar, deskripsi, tanggal)
VALUES
(
    'gal-01',
    'Penyambungan Core Fiber Optik Menggunakan Fusion Splicer',
    'Instalasi Jaringan',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    'Penyambungan inti serat optik presisi (splicing) pada proyek FTTH jaringan internet ISP mitra.',
    '15 Agustus 2024'
),
(
    'gal-02',
    'Manajemen Kabel Rack Server & Patch Panel Switch',
    'Instalasi Jaringan',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    'Pengkabelan terstruktur (structured cabling) dan instalasi patch cord Cat6 pada rack server instansi industri.',
    '28 September 2024'
),
(
    'gal-03',
    'Pemeriksaan & Perakitan Hardware Komputer Motherboard',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    'Diagnosa komponen motherboard, instalasi RAM DDR4, dan penggantian pasta termal processor.',
    '10 Oktober 2024'
),
(
    'gal-04',
    'Aktivitas Perakitan Komputer PC Desktop di Workshop',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'Praktek perakitan unit casing, power supply, dan manajemen kabel internal PC siswa di tempat PKL.',
    '02 November 2024'
),
(
    'gal-05',
    'Pengujian & Crimping Konektor RJ45 Kabel UTP LAN',
    'Pengujian Alat',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'Terminasi kabel jaringan UTP Cat6 dengan konektor RJ45 standar TIA/EIA-568B dan pengetesan LAN tester.',
    '18 November 2024'
),
(
    'gal-06',
    'Penyolderan & Perbaikan Sirkuit Elektronika Router',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    'Pemeriksaan jalur daya dan penyolderan komponen resistor/kapasitor pada board perangkat jaringan.',
    '01 Juli 2024'
)
ON CONFLICT (id) DO UPDATE
SET judul = EXCLUDED.judul,
    kategori = EXCLUDED.kategori,
    url_gambar = EXCLUDED.url_gambar,
    deskripsi = EXCLUDED.deskripsi,
    tanggal = EXCLUDED.tanggal;

-- ----------------------------------------------------------------------------
-- 12. SEED DATA TABEL dudi: 32 TEMPAT PKL RESMI SMK NEGERI 1 SONGGOM
-- Menggunakan ID eksplisit dudi-1 sampai dudi-32 yang sinkron dengan aplikasi
-- ----------------------------------------------------------------------------
INSERT INTO public.dudi (id, no, nama_dudi, maksimal_siswa, pimpinan, jenis_dudi, bidang_pekerjaan, alamat, kabupaten, latitude, longitude, no_hp, jaminan, nominal)
VALUES
('dudi-1', 1, 'ABS Komputer', 4, 'Arief Bayu S.', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Projosumarto 01 Gg. Balok Desa Sutapranan, Kec. Dukuhturi, Kab. Tegal', 'Kab. Tegal', -6.903560, 109.136150, '0857-1234-5001', '-', 0),
('dudi-2', 2, 'Era Network Center (ENC)', 4, 'Nasruloh', 'CV/PT', 'Jaringan, Jasa', 'Jl. Kertaharja, Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.995650, 109.030180, '0819-0234-5002', '-', 0),
('dudi-3', 3, 'Fito Komputer', 4, 'Fiqri silando Amd.T', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Gajah Mada, RT.05/RW.07, Desa Kalisapu, Kec. Slawi, Kab. Tegal, Kode Pos : 52416', 'Kab. Tegal', -6.984030, 109.126890, '0878-3012-5003', '-', 0),
('dudi-4', 4, 'Gibran Net (PT Media Cepat Indonesia)', 4, 'SUNARYO', 'CV/PT', 'Teknisi / Mekanik, Jasa', 'Jl. Kalipasir 2 Desa Margaayu, Kec. Margasari, Kab. Tegal, Kode Pos 52463', 'Kab. Tegal', -7.092810, 108.983380, '0852-2590-5004', '-', 0),
('dudi-5', 5, 'Griya Komputer dan Network', 4, 'Imam Khaedar', 'Mandiri', 'Teknisi / Mekanik, Jasa', 'Jl. Raya Pejagan - Ketanggungan Desa sutamaja, Kec. Ketanggungan, Kab. Brebes, Kode Pos 52263', 'Kab. Brebes', -6.925150, 108.893480, '0813-9123-5005', '-', 0),
('dudi-6', 6, 'Jet Computer', 4, 'M. Faiquttamam', 'Industri', 'Penjualan', 'Jl. Gajah Mada, Karang Moncol, Desa Kalisapu, Kec. Slawi, Kab. Tegal, 52416', 'Kab. Tegal', -6.987800, 109.127480, '0856-4231-5006', '-', 0),
('dudi-7', 7, 'JNT.NET', 4, 'M.MUHLISIN', 'Mandiri', 'Jasa', 'Desa Dukuhdamu RT 7/RW 4, Kec. Lebaksiu, Kab. Tegal', 'Kab. Tegal', -6.990910, 109.101380, '0877-2831-5007', '-', 0),
('dudi-8', 8, 'Kim Komputer', 4, 'Diki Zahrudin', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Sutamaja No.4, Ketanggungan, Kec. Ketanggungan, Kabupaten Brebes', 'Kab. Brebes', -6.930470, 108.892980, '0819-1122-5008', '-', 0),
('dudi-9', 9, 'MAMAS.COM', 4, 'Ade Susiyanto. S.Pd', 'Mandiri', 'Jasa, Penjualan', 'Jl. Raya Barat Larangan, Kec. Larangan, Kab. Brebes, Kode Pos 52268', 'Kab. Brebes', -7.001110, 108.945840, '0858-6921-5009', '-', 0),
('dudi-10', 10, 'Mulia Hati Studio', 4, 'Nanang Budi Santoso', 'Mandiri', 'Jasa', 'Jembayat Rt.04/Rw.06, Kec. Margasari, Kab. Tegal, Kode Pos : 52463', 'Kab. Tegal', -7.088850, 109.052650, '0812-2900-5010', '-', 0),
('dudi-11', 11, 'Nada Komputer (NC)', 4, 'Hilman Maghfur', 'Mandiri', 'Teknisi / Mekanik', 'Jl. AMD Gg. Posyandu RT.002 RW.006 Dusun Sikancil Desa Slatri, Kec. Larangan, Kab. Brebes', 'Kab. Brebes', -6.970370, 108.947230, '0878-2911-5011', '-', 0),
('dudi-12', 12, 'Naza Komputer', 4, 'BAGJA BUDIONO', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Taman Siswa No.1, Saditan Brebes', 'Kab. Brebes', -6.879160, 109.045840, '0857-4200-5012', '-', 0),
('dudi-13', 13, 'Percetakan 99', 2, 'Tobroni', 'Mandiri', 'Jasa', 'Jln. Raya Tangglog, Desa Karangsembung, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -6.967850, 109.027820, '0813-2890-5013', '-', 0),
('dudi-14', 14, 'PLN Icon Plus Purwokerto', 4, 'KRESHNA ADITAMA', 'Industri', 'Jaringan, Jasa', 'Jl. Jend Sudirman No 805 Sokabaru Berkoh, Desa Sokabaru, Kec. Purwokerto, Kab. Banyumas, Kode Pos 53146', 'Kab. Banyumas', -7.436130, 109.261170, '0281-638001', 'Perjanjian Kerjasama', 0),
('dudi-15', 15, 'PT Admin Juara Network', 4, 'Abdul Anwar', 'CV/PT', 'Jasa', 'Jl. Suta Merta No.20, Blubuk, Kec. Dukuhturi, Kab. Tegal, Jawa Tengah, Kode Pos : 52451', 'Kab. Tegal', -6.974340, 109.091850, '0856-9120-5015', '-', 0),
('dudi-16', 16, 'PT Chandra Sarana Lintas Media', 4, 'Dwi Candra', 'CV/PT', 'Teknisi / Mekanik, Jasa', 'Jl. Raya Luwunggede - Bulakelor, Desa: Bulakelor, Kec. Ketanggungan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.941950, 108.911180, '0819-0290-5016', '-', 0),
('dudi-17', 17, 'PT Jayahana Munuara Mekanika Selaras', 4, 'Cahyadi', 'CV/PT', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Dukuh II, Desa Songgom Lor RT.02/RW.03, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.028020, 108.994560, '0852-9011-5017', '-', 0),
('dudi-18', 18, 'PT Saka Media Komunika (Cabang 1)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Jatimakmur Wetan, Desa Kemakmuran, Kab. Brebes, Kec. Songgom, Kode Pos : 52266', 'Kab. Brebes', -7.028880, 109.001210, '0877-3022-5018', '-', 0),
('dudi-19', 19, 'PT Saka Media Komunika (Cabang 2)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Pancasakti Blok Kampung baru No. 11 Desa Songgom Lor, Kec. Songgom, Kab. Brebes 52266', 'Kab. Brebes', -7.028880, 109.001210, '0877-3022-5019', '-', 0),
('dudi-20', 20, 'PT Saka Media Komunika (Cabang 3)', 2, 'Dadi Yugiyono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Jatimakmur Kulon, Desa Jatimakmur, Kec. Songgom, Kab. Brebes, Kode Pos:52266', 'Kab. Brebes', -7.015060, 109.011540, '0877-3022-5020', '-', 0),
('dudi-21', 21, 'PT Serayu Multi Connection (Jatirokeh)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik', 'Jl. Faisol Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.994930, 109.022780, '0812-2599-5021', '-', 0),
('dudi-22', 22, 'PT Serayu Multi Connection (Songgom)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik', 'Jl. Pancasakti No. 14 Desa Songgom Lor, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.032320, 108.996110, '0812-2599-5022', '-', 0),
('dudi-23', 23, 'Raja Komputer (RK)', 4, 'Ahmad Anis Faizal S.Kom', 'Mandiri', 'Penjualan', 'Jl. Imam Bonjol, Penjalin Banyu, Desa Siandong, Kec. Larangan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.964090, 108.971050, '0858-7011-5023', '-', 0),
('dudi-24', 24, 'Republik Computer', 4, 'Adi Winarto. S.Kom', 'Mandiri', 'Teknisi / Mekanik, Jasa', 'Jl. Flores Baru No.1 Desa Griya Trayeman, Procot Kec. Slawi, Kab. Tegal, Kode Pos : 52414', 'Kab. Tegal', -6.963220, 109.133990, '0856-4022-5024', '-', 0),
('dudi-25', 25, 'Rizky Computer (RC)', 4, 'Nofan', 'Mandiri', 'Teknisi / Mekanik', 'Perumahan Griya Satria Pesona Alamanda No.7 Desa Klampis Barat, Kec. Jatibarang, Kab. Brebes, Kode Pos : 52261', 'Kab. Brebes', -6.967290, 109.034940, '0819-0211-5025', '-', 0),
('dudi-26', 26, 'Rizky Net', 4, 'Akhmad Sumidin', 'Mandiri', 'Jasa, Jaringan', 'Jl. Tirto Gang Pasar Larangan RT 09 RW 06 No. 28, Kec. Larangan, Kab. Brebes', 'Kab. Brebes', -7.002950, 108.946510, '0878-3099-5026', '-', 0),
('dudi-27', 27, 'RIZSKI COMPUTER', 4, 'Veri Riz''Qiyanto A.Md.Kom', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Pecakran, Pasangan - Kec. Talang, Kab. Tegal', 'Kab. Tegal', -6.930080, 109.149100, '0857-8622-5027', '-', 0),
('dudi-28', 28, 'Sahabat Komputer', 4, 'Uki Prasetyo, S.Kom', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Dewi Sartika, Sigambir, Kec. Brebes, Kab. Brebes', 'Kab. Brebes', -6.857970, 109.041450, '0813-9033-5028', '-', 0),
('dudi-29', 29, 'SH Net', 4, 'Bravo Drajat Niti Toto Wibowo', 'Mandiri', 'Jasa, Jaringan', 'Gg. Gudang Balung, Siandong, Kec. Larangan, Kab. Brebes, Jawa Tengah 52262', 'Kab. Brebes', -6.957380, 108.972920, '0852-2611-5029', '-', 0),
('dudi-30', 30, 'Sigy Toner & Komputer', 4, 'Totu Siswo Raharjo', 'Mandiri', 'Jasa, Penjualan', 'Jl. Rengaspendawa, Desa Rengaspendawa, Kec. Larangan, Kab. Brebes, 52262', 'Kab. Brebes', -6.955980, 108.999130, '0877-1900-5030', '-', 0),
('dudi-31', 31, 'SKI Computer', 4, 'Teguh Bintoro', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Sepat No 16 Tegalsari Kota Tegal', 'Kota Tegal', -6.858410, 109.127910, '0856-4299-5031', '-', 0),
('dudi-32', 32, 'Smart Komputer', 4, 'Doni Aulia', 'Mandiri', 'Jasa, Penjualan', 'Jl. Professor M.Yamin, Desa Kudaile, Kec. Slawi, Kab. Tegal', 'Kab. Tegal', -6.974450, 109.134640, '0812-2711-5032', '-', 0)
ON CONFLICT (id) DO UPDATE
SET no = EXCLUDED.no,
    nama_dudi = EXCLUDED.nama_dudi,
    maksimal_siswa = EXCLUDED.maksimal_siswa,
    pimpinan = EXCLUDED.pimpinan,
    jenis_dudi = EXCLUDED.jenis_dudi,
    bidang_pekerjaan = EXCLUDED.bidang_pekerjaan,
    alamat = EXCLUDED.alamat,
    kabupaten = EXCLUDED.kabupaten,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    no_hp = EXCLUDED.no_hp,
    jaminan = EXCLUDED.jaminan,
    nominal = EXCLUDED.nominal,
    updated_at = timezone('utc'::text, now());

-- ============================================================================
-- AKHIR SKEMA SUPABASE RESMI
-- ============================================================================
