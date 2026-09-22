import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Dudi, CMSContent, GalleryItem } from '../types';
import { INITIAL_DUDI_LIST, DEFAULT_CMS_CONTENT, INITIAL_GALLERY } from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('example.com')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for state persistence fallback
const LS_DUDI_KEY = 'smkn1songgom_dudi_list_v2';
const LS_CMS_KEY = 'smkn1songgom_cms_content_v2';
const LS_GALLERY_KEY = 'smkn1songgom_gallery_v2';
const LS_ADMIN_KEY = 'smkn1songgom_admin_auth_v2';

// Fungsi penjamin keunikan data DUDI (menghilangkan duplikasi akibat re-run sql atau import ganda)
export function deduplicateDudiList(list: Dudi[]): Dudi[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const mapByNo = new Map<number, Dudi>();
  const mapByName = new Map<string, Dudi>();
  const unindexed: Dudi[] = [];

  for (const item of list) {
    if (!item) continue;
    const no = typeof item.no === 'number' ? item.no : parseInt(String(item.no || ''));
    const cleanName = item.nama_dudi?.trim().toLowerCase();

    if (!isNaN(no) && no > 0) {
      const existing = mapByNo.get(no);
      if (!existing) {
        mapByNo.set(no, item);
      } else {
        // Ambil data yang paling mutakhir (berdasarkan updated_at atau kelengkapan data)
        const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
        const itemTime = new Date(item.updated_at || item.created_at || 0).getTime();
        if (itemTime >= existingTime) {
          mapByNo.set(no, item);
        }
      }
    } else if (cleanName) {
      const existing = mapByName.get(cleanName);
      if (!existing) {
        mapByName.set(cleanName, item);
      }
    } else {
      unindexed.push(item);
    }
  }

  const combined = [
    ...Array.from(mapByNo.values()),
    ...Array.from(mapByName.values()).filter((d) => !mapByNo.has(Number(d.no))),
    ...unindexed,
  ];

  // Pastikan ID dan No benar-benar unik
  const finalMap = new Map<string, Dudi>();
  for (const item of combined) {
    const key = item.no ? `no-${item.no}` : `id-${item.id}`;
    finalMap.set(key, item);
  }

  return Array.from(finalMap.values()).sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
}

// Normalize CMS content to guarantee all required fields and arrays exist
export function normalizeCMSContent(raw: any): CMSContent {
  const base = { ...DEFAULT_CMS_CONTENT };
  if (!raw || typeof raw !== 'object') {
    return base;
  }

  let parsedRaw = raw;
  if (typeof raw === 'string') {
    try {
      parsedRaw = JSON.parse(raw);
    } catch {
      return base;
    }
  }

  const parseSection = (val: any) => {
    if (!val) return {};
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return {};
      }
    }
    return typeof val === 'object' ? val : {};
  };

  const heroRaw = parseSection(parsedRaw.hero);
  const tkjRaw = parseSection(parsedRaw.tkj);
  const manfaatRaw = parseSection(parsedRaw.manfaat);
  const kontakRaw = parseSection(parsedRaw.kontak);

  // Handle competencies vs skills
  const rawCompetencies = tkjRaw.competencies || tkjRaw.skills;
  const competencies = Array.isArray(rawCompetencies) && rawCompetencies.length > 0
    ? rawCompetencies.map((c: any) => ({
        title: c?.title || '',
        description: c?.description || '',
        icon: c?.icon || 'Network',
      }))
    : base.tkj.competencies;

  const rawCareer = tkjRaw.careerOpportunities || tkjRaw.career_opportunities || tkjRaw.careers;
  const careerOpportunities = Array.isArray(rawCareer) && rawCareer.length > 0
    ? rawCareer
    : base.tkj.careerOpportunities;

  // Handle benefits vs categories
  const rawBenefits = manfaatRaw.benefits || manfaatRaw.categories;
  const benefits = Array.isArray(rawBenefits) && rawBenefits.length > 0
    ? rawBenefits.map((b: any) => ({
        target: b?.target || b?.title || '',
        points: Array.isArray(b?.points) ? b.points : [],
        icon: b?.icon || 'UserCheck',
      }))
    : base.manfaat.benefits;

  return {
    hero: {
      badge: heroRaw.badge || base.hero.badge,
      headline: heroRaw.headline || base.hero.headline,
      subheadline: heroRaw.subheadline || base.hero.subheadline,
      statsText: heroRaw.statsText || base.hero.statsText || '',
      primaryCta: heroRaw.primaryCta || 'Jelajahi Peta GIS',
      secondaryCta: heroRaw.secondaryCta || 'Katalog 32 DUDI',
    },
    tkj: {
      title: tkjRaw.title || base.tkj.title,
      description: tkjRaw.description || tkjRaw.subtitle || base.tkj.description,
      subtitle: tkjRaw.subtitle || tkjRaw.description || base.tkj.description,
      skills: competencies,
      competencies,
      careerOpportunities,
    },
    manfaat: {
      title: manfaatRaw.title || base.manfaat.title,
      subtitle: manfaatRaw.subtitle || base.manfaat.subtitle,
      categories: benefits,
      benefits,
    },
    kontak: {
      address: kontakRaw.address || base.kontak.address,
      email: kontakRaw.email || base.kontak.email,
      phone: kontakRaw.phone || base.kontak.phone,
      website: kontakRaw.website || base.kontak.website,
      operatingHours: kontakRaw.operatingHours || kontakRaw.jam_kerja || base.kontak.operatingHours,
      googleMapsEmbed: kontakRaw.googleMapsEmbed || base.kontak.googleMapsEmbed,
    },
  };
}

// Initialize localStorage with initial data if empty or outdated
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  const storedDudi = localStorage.getItem(LS_DUDI_KEY);
  if (!storedDudi) {
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(deduplicateDudiList(INITIAL_DUDI_LIST)));
  } else {
    try {
      const parsed = JSON.parse(storedDudi);
      // Bersihkan jika terdapat duplikasi tersimpan
      const cleaned = deduplicateDudiList(parsed);
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(LS_DUDI_KEY, JSON.stringify(cleaned));
      }
    } catch {
      localStorage.setItem(LS_DUDI_KEY, JSON.stringify(deduplicateDudiList(INITIAL_DUDI_LIST)));
    }
  }

  const storedCms = localStorage.getItem(LS_CMS_KEY);
  if (!storedCms) {
    localStorage.setItem(LS_CMS_KEY, JSON.stringify(DEFAULT_CMS_CONTENT));
  } else {
    try {
      const parsed = JSON.parse(storedCms);
      const normalized = normalizeCMSContent(parsed);
      localStorage.setItem(LS_CMS_KEY, JSON.stringify(normalized));
    } catch {
      localStorage.setItem(LS_CMS_KEY, JSON.stringify(DEFAULT_CMS_CONTENT));
    }
  }

  const storedGallery = localStorage.getItem(LS_GALLERY_KEY);
  if (!storedGallery) {
    localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(INITIAL_GALLERY));
  } else {
    try {
      const parsed = JSON.parse(storedGallery);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(INITIAL_GALLERY));
      }
    } catch {
      localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(INITIAL_GALLERY));
    }
  }
}

initLocalStorage();

export const dataService = {
  // ===================== DUDI / TEMPAT PKL (Tabel: public.dudi) =====================
  async getDudiList(): Promise<Dudi[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .select('*')
          .order('no', { ascending: true });

        if (!error && data && data.length > 0) {
          const rawList = data as Dudi[];
          const cleanList = deduplicateDudiList(rawList);
          
          // Jika di database ada baris duplikat (misal 128 baris padahal aslinya 32),
          // jalankan pembersihan di background agar database rapi kembali
          if (cleanList.length < rawList.length) {
            this.cleanupDatabaseDuplicates(rawList, cleanList).catch((e) =>
              console.warn('Background cleanup duplicate notice:', e)
            );
          }

          localStorage.setItem(LS_DUDI_KEY, JSON.stringify(cleanList));
          return cleanList;
        }
      } catch (err) {
        console.warn('Supabase dudi fetch error, using local fallback:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LS_DUDI_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Dudi[];
        const cleaned = deduplicateDudiList(parsed);
        return cleaned;
      }
    } catch {
      // fallback
    }
    return deduplicateDudiList(INITIAL_DUDI_LIST);
  },

  // Bersihkan record duplikat yang ada di tabel Supabase
  async cleanupDatabaseDuplicates(allRows: Dudi[], keptRows: Dudi[]): Promise<number> {
    if (!supabase) return 0;
    try {
      const keptIds = new Set(keptRows.map((k) => k.id));
      const duplicateIds = allRows.filter((r) => !keptIds.has(r.id)).map((r) => r.id);
      
      if (duplicateIds.length > 0) {
        await supabase.from('dudi').delete().in('id', duplicateIds);
        console.log(`Berhasil membersihkan ${duplicateIds.length} baris duplikat di Supabase dudi.`);
      }
      return duplicateIds.length;
    } catch (err) {
      console.warn('Gagal membersihkan duplikat Supabase:', err);
      return 0;
    }
  },

  async addDudi(item: Omit<Dudi, 'id'>): Promise<Dudi> {
    const determinedId = item.no
      ? `b0000000-0000-0000-0000-${String(item.no).padStart(12, '0')}`
      : `b0000000-0000-0000-0000-${String(Date.now()).slice(-12)}`;
    const newItem: Dudi = {
      ...item,
      id: determinedId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .insert([newItem])
          .select()
          .single();

        if (!error && data) {
          this.syncLocalDudi(data as Dudi, 'add');
          return data as Dudi;
        }
      } catch (err) {
        console.warn('Supabase insert failed, storing locally:', err);
      }
    }

    this.syncLocalDudi(newItem, 'add');
    return newItem;
  },

  async updateDudi(id: string, updates: Partial<Dudi>): Promise<Dudi> {
    let updatedDbItem: Dudi | null = null;
    const nowStr = new Date().toISOString();
    const currentList = await this.getDudiList();
    const existingItem = currentList.find(
      (item) => item.id === id || (updates.no !== undefined && item.no === updates.no)
    );
    const targetNo = updates.no !== undefined ? updates.no : existingItem?.no;

    if (supabase) {
      try {
        const updatePayload = { ...updates, updated_at: nowStr };
        
        // 1. Update berdasarkan ID
        const { data, error } = await supabase
          .from('dudi')
          .update(updatePayload)
          .eq('id', id)
          .select();

        if (!error && data && data.length > 0) {
          updatedDbItem = data[0] as Dudi;
        }

        // 2. Jika ada nomor urut, pastikan SELURUH baris dengan nomor urut ini diupdate
        // sehingga jika ada baris duplikat lama, nama lama tidak akan pernah muncul lagi
        if (targetNo !== undefined) {
          await supabase
            .from('dudi')
            .update(updatePayload)
            .eq('no', targetNo);
        }
      } catch (err) {
        console.warn('Supabase dudi update error:', err);
      }
    }

    // Update Local Storage secara ketat agar nama lama tidak pernah tertinggal
    const mergedItem: Dudi = {
      ...(existingItem || ({} as Dudi)),
      ...updates,
      id: updatedDbItem?.id || id,
      updated_at: nowStr,
    };

    const nextList = currentList.map((item) => {
      if (item.id === id || (targetNo !== undefined && item.no === targetNo)) {
        return mergedItem;
      }
      return item;
    });

    const cleanList = deduplicateDudiList(nextList);
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(cleanList));
    return mergedItem;
  },

  async deleteDudi(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('dudi').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    this.syncLocalDudi({ id } as Dudi, 'delete');
    return true;
  },

  async bulkSaveDudi(items: Dudi[]): Promise<Dudi[]> {
    const cleanItems = deduplicateDudiList(items);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .upsert(cleanItems, { onConflict: 'id' })
          .select();

        if (!error && data && data.length > 0) {
          const cleanSaved = deduplicateDudiList(data as Dudi[]);
          localStorage.setItem(LS_DUDI_KEY, JSON.stringify(cleanSaved));
          return cleanSaved;
        }
      } catch (err) {
        console.warn('Supabase bulk upsert error:', err);
      }
    }

    // Local merge by ID & No to prevent duplicates
    const currentList = await this.getDudiList();
    const itemMap = new Map<string, Dudi>();
    currentList.forEach((it) => itemMap.set(it.id, it));
    cleanItems.forEach((it) => {
      itemMap.set(it.id, it);
    });
    const merged = deduplicateDudiList(Array.from(itemMap.values()));
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(merged));
    return merged;
  },

  syncLocalDudi(item: Dudi, action: 'add' | 'update' | 'delete') {
    try {
      const stored = localStorage.getItem(LS_DUDI_KEY);
      const list: Dudi[] = stored ? JSON.parse(stored) : INITIAL_DUDI_LIST;
      let nextList: Dudi[];
      if (action === 'add') {
        const exists = list.some((d) => d.id === item.id || (item.no && d.no === item.no));
        if (exists) {
          nextList = list.map((d) => (d.id === item.id || (item.no && d.no === item.no) ? item : d));
        } else {
          nextList = [...list, item];
        }
      } else if (action === 'update') {
        nextList = list.map((d) => (d.id === item.id || (item.no && d.no === item.no) ? item : d));
      } else {
        nextList = list.filter((d) => d.id !== item.id && (!item.no || d.no !== item.no));
      }
      const cleaned = deduplicateDudiList(nextList);
      localStorage.setItem(LS_DUDI_KEY, JSON.stringify(cleaned));
    } catch {
      // ignore
    }
  },

  // ===================== PENGATURAN CMS (Tabel: public.pengaturan) =====================
  async getCMSContent(): Promise<CMSContent> {
    if (supabase) {
      try {
        // Coba tabel pengaturan
        const { data, error } = await supabase.from('pengaturan').select('*');
        if (!error && data && data.length > 0) {
          const cmsMap: any = { ...DEFAULT_CMS_CONTENT };
          data.forEach((row) => {
            const key = row.kunci || row.key;
            let val = row.nilai ?? row.value;
            if (key && val !== undefined) {
              if (typeof val === 'string') {
                try {
                  val = JSON.parse(val);
                } catch {
                  // ignore
                }
              }
              cmsMap[key] = val;
            }
          });
          const normalized = normalizeCMSContent(cmsMap);
          localStorage.setItem(LS_CMS_KEY, JSON.stringify(normalized));
          return normalized;
        }

        // Fallback coba tabel cms_content jika tabel pengaturan belum dibuat
        const { data: legacyData, error: legacyErr } = await supabase.from('cms_content').select('*');
        if (!legacyErr && legacyData && legacyData.length > 0) {
          const cmsMap: any = { ...DEFAULT_CMS_CONTENT };
          legacyData.forEach((row) => {
            const key = row.key || row.kunci;
            let val = row.value ?? row.nilai;
            if (key && val !== undefined) {
              if (typeof val === 'string') {
                try {
                  val = JSON.parse(val);
                } catch {
                  // ignore
                }
              }
              cmsMap[key] = val;
            }
          });
          const normalized = normalizeCMSContent(cmsMap);
          localStorage.setItem(LS_CMS_KEY, JSON.stringify(normalized));
          return normalized;
        }
      } catch (err) {
        console.warn('Supabase pengaturan fetch error, using local fallback:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LS_CMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = normalizeCMSContent(parsed);
        return normalized;
      }
    } catch {
      // fallback
    }
    return DEFAULT_CMS_CONTENT;
  },

  async updateCMSSection<K extends keyof CMSContent>(
    section: K,
    value: CMSContent[K]
  ): Promise<CMSContent> {
    const nowStr = new Date().toISOString();
    if (supabase) {
      try {
        // 1. Simpan ke tabel pengaturan
        const { error } = await supabase.from('pengaturan').upsert(
          {
            kunci: section,
            nilai: value,
            updated_at: nowStr,
          },
          { onConflict: 'kunci' }
        );

        if (error) {
          // Fallback coba ke cms_content jika tabel pengaturan belum dibuat
          await supabase.from('cms_content').upsert(
            {
              key: section,
              value: value,
              updated_at: nowStr,
            },
            { onConflict: 'key' }
          );
        }
      } catch (err) {
        console.warn('Supabase update pengaturan error:', err);
      }
    }

    const current = await this.getCMSContent();
    current[section] = value;
    localStorage.setItem(LS_CMS_KEY, JSON.stringify(current));
    return current;
  },

  // ===================== GALERI (Tabel: public.galeri) =====================
  async getGallery(): Promise<GalleryItem[]> {
    if (supabase) {
      try {
        // Coba tabel galeri
        const { data, error } = await supabase
          .from('galeri')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list: GalleryItem[] = data.map((row) => ({
            id: row.id,
            title: row.judul || row.title || '',
            category: row.kategori || row.category || 'Instalasi Jaringan',
            imageUrl: row.url_gambar || row.image_url || '',
            description: row.deskripsi || row.description || '',
            date: row.tanggal || row.date || '',
          }));
          localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(list));
          return list;
        }

        // Fallback coba tabel gallery jika tabel galeri belum dibuat
        const { data: legacyData, error: legacyErr } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });

        if (!legacyErr && legacyData && legacyData.length > 0) {
          const list: GalleryItem[] = legacyData.map((row) => ({
            id: row.id,
            title: row.title || row.judul || '',
            category: row.category || row.kategori || 'Instalasi Jaringan',
            imageUrl: row.image_url || row.url_gambar || '',
            description: row.description || row.deskripsi || '',
            date: row.date || row.tanggal || '',
          }));
          localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Supabase galeri fetch error, using local fallback:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LS_GALLERY_KEY);
      if (stored) {
        return JSON.parse(stored) as GalleryItem[];
      }
    } catch {
      // fallback
    }
    return INITIAL_GALLERY;
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };

    if (supabase) {
      try {
        // 1. Simpan ke tabel galeri
        const { error } = await supabase.from('galeri').insert([
          {
            id: newItem.id,
            judul: newItem.title,
            kategori: newItem.category,
            url_gambar: newItem.imageUrl,
            deskripsi: newItem.description,
            tanggal: newItem.date,
          },
        ]);

        if (error) {
          // Fallback coba ke tabel gallery jika galeri belum dibuat
          await supabase.from('gallery').insert([
            {
              id: newItem.id,
              title: newItem.title,
              category: newItem.category,
              image_url: newItem.imageUrl,
              description: newItem.description,
              date: newItem.date,
            },
          ]);
        }
      } catch (err) {
        console.warn('Supabase galeri insert error:', err);
      }
    }

    const list = await this.getGallery();
    const updated = [newItem, ...list];
    localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(updated));
    return newItem;
  },

  async deleteGalleryItem(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('galeri').delete().eq('id', id);
        await supabase.from('gallery').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase galeri delete error:', err);
      }
    }

    const list = await this.getGallery();
    const filtered = list.filter((i) => i.id !== id);
    localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(filtered));
    return true;
  },

  // Aliases for convenience
  async createDudi(newItem: Omit<Dudi, 'id'>): Promise<Dudi> {
    return this.addDudi(newItem);
  },

  async bulkImportDudi(items: Dudi[]): Promise<Dudi[]> {
    return this.bulkSaveDudi(items);
  },

  async updateCMSContent<K extends keyof CMSContent>(
    section: K,
    value: CMSContent[K]
  ): Promise<CMSContent> {
    return this.updateCMSSection(section, value);
  },

  // ===================== ADMIN AUTHENTICATION (Tabel: public.admin & Supabase Auth) =====================
  isAdminLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LS_ADMIN_KEY) === 'true';
  },

  setAdminLoggedIn(state: boolean): void {
    if (typeof window === 'undefined') return;
    if (state) {
      localStorage.setItem(LS_ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(LS_ADMIN_KEY);
    }
  },

  async verifyAdminLogin(email: string, pass: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    const isPakAryanoe = cleanEmail === 'pakaryanoe@gmail.com' && cleanPass === '@PTKsonggom1';
    const isLegacyAdmin = (cleanEmail === 'admin@smkn1songgom.sch.id' || cleanEmail === 'admin') && cleanPass === 'admin123';

    if (supabase) {
      try {
        // 1. Coba verifikasi langsung lewat Supabase Authentication Resmi (auth.users)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!authError && authData.user) {
          this.setAdminLoggedIn(true);
          // Update waktu login di tabel public.admin
          try {
            await supabase
              .from('admin')
              .update({ last_login: new Date().toISOString() })
              .ilike('email', cleanEmail);
          } catch {
            // non-blocking
          }
          return true;
        }

        // 2. Jika login Supabase Auth gagal / belum terdaftar di auth.users, periksa tabel public.admin
        const { data: adminRow } = await supabase
          .from('admin')
          .select('*')
          .ilike('email', cleanEmail)
          .eq('password', cleanPass)
          .eq('is_active', true)
          .maybeSingle();

        if (adminRow) {
          this.setAdminLoggedIn(true);
          try {
            await supabase
              .from('admin')
              .update({ last_login: new Date().toISOString() })
              .eq('id', adminRow.id);
          } catch {
            // non-blocking
          }
          return true;
        }

        // 3. Fallback periksa tabel lama public.admin_users jika tabel public.admin belum dibuat
        const { data: legacyAdminRow } = await supabase
          .from('admin_users')
          .select('*')
          .ilike('email', cleanEmail)
          .eq('password', cleanPass)
          .eq('is_active', true)
          .maybeSingle();

        if (legacyAdminRow) {
          this.setAdminLoggedIn(true);
          return true;
        }

        // 4. Jika akun adalah akun resmi Pak Aryanoe, lakukan auto-sinkronisasi ke auth.users dan tabel public.admin
        if (isPakAryanoe) {
          // Auto-register ke Supabase Auth agar tersimpan di menu Authentication > Users
          try {
            await supabase.auth.signUp({
              email: 'pakaryanoe@gmail.com',
              password: '@PTKsonggom1',
              options: {
                data: {
                  full_name: 'Pak Aryanoe (Administrator GIS SMKN 1 Songgom)',
                  role: 'superadmin',
                },
              },
            });
          } catch (signUpErr) {
            console.warn('Supabase auth signUp notice:', signUpErr);
          }

          // Auto-upsert ke tabel public.admin
          try {
            await supabase.from('admin').upsert(
              {
                email: 'pakaryanoe@gmail.com',
                password: '@PTKsonggom1',
                full_name: 'Pak Aryanoe (Administrator GIS SMKN 1 Songgom)',
                role: 'superadmin',
                is_active: true,
                last_login: new Date().toISOString(),
              },
              { onConflict: 'email' }
            );
          } catch (upsertErr) {
            console.warn('Auto-seed public.admin notice:', upsertErr);
          }

          this.setAdminLoggedIn(true);
          return true;
        }
      } catch (err) {
        console.warn('Supabase admin verification check error, falling back:', err);
      }
    }

    // Default local credentials fallback
    if (isPakAryanoe || isLegacyAdmin) {
      this.setAdminLoggedIn(true);
      return true;
    }

    return false;
  },
};
