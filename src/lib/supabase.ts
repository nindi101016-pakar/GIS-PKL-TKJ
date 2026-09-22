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
const LS_DUDI_KEY = 'smkn1songgom_dudi_list_v1';
const LS_CMS_KEY = 'smkn1songgom_cms_content_v1';
const LS_GALLERY_KEY = 'smkn1songgom_gallery_v1';
const LS_ADMIN_KEY = 'smkn1songgom_admin_auth_v1';

// Initialize localStorage with initial data if empty or outdated
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(LS_DUDI_KEY)) {
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(INITIAL_DUDI_LIST));
  }
  const storedCms = localStorage.getItem(LS_CMS_KEY);
  if (!storedCms) {
    localStorage.setItem(LS_CMS_KEY, JSON.stringify(DEFAULT_CMS_CONTENT));
  } else {
    try {
      const parsed = JSON.parse(storedCms);
      if (parsed.hero && parsed.hero.headline && parsed.hero.headline.includes('Pemetaan Cerdas')) {
        parsed.hero.headline = DEFAULT_CMS_CONTENT.hero.headline;
        localStorage.setItem(LS_CMS_KEY, JSON.stringify(parsed));
      }
    } catch {
      localStorage.setItem(LS_CMS_KEY, JSON.stringify(DEFAULT_CMS_CONTENT));
    }
  }

  // Always refresh gallery with non-face, technical product photos
  localStorage.setItem(LS_GALLERY_KEY, JSON.stringify(INITIAL_GALLERY));
}

initLocalStorage();

export const dataService = {
  // ===================== DUDI / TEMPAT PKL =====================
  async getDudiList(): Promise<Dudi[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .select('*')
          .order('no', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Dudi[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LS_DUDI_KEY);
      if (stored) {
        return JSON.parse(stored) as Dudi[];
      }
    } catch {
      // fallback
    }
    return INITIAL_DUDI_LIST;
  },

  async addDudi(item: Omit<Dudi, 'id'>): Promise<Dudi> {
    const newId = `dudi-${Date.now()}`;
    const newItem: Dudi = {
      ...item,
      id: newId,
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
          // also sync to local storage
          this.syncLocalDudi(data as Dudi, 'add');
          return data as Dudi;
        }
      } catch (err) {
        console.warn('Supabase insert failed, storing locally:', err);
      }
    }

    const currentList = await this.getDudiList();
    const updatedList = [newItem, ...currentList];
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(updatedList));
    return newItem;
  },

  async updateDudi(id: string, updates: Partial<Dudi>): Promise<Dudi> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          this.syncLocalDudi(data as Dudi, 'update');
          return data as Dudi;
        }
      } catch (err) {
        console.warn('Supabase update failed, updating locally:', err);
      }
    }

    const currentList = await this.getDudiList();
    const idx = currentList.findIndex((item) => item.id === id);
    if (idx !== -1) {
      const updatedItem = {
        ...currentList[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      currentList[idx] = updatedItem;
      localStorage.setItem(LS_DUDI_KEY, JSON.stringify(currentList));
      return updatedItem;
    }
    throw new Error('DUDI tidak ditemukan');
  },

  async deleteDudi(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('dudi').delete().eq('id', id);
        if (!error) {
          this.syncLocalDudi({ id } as Dudi, 'delete');
          return true;
        }
      } catch (err) {
        console.warn('Supabase delete failed, deleting locally:', err);
      }
    }

    const currentList = await this.getDudiList();
    const filtered = currentList.filter((item) => item.id !== id);
    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(filtered));
    return true;
  },

  async bulkSaveDudi(items: Dudi[]): Promise<Dudi[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dudi')
          .upsert(items, { onConflict: 'id' })
          .select();

        if (!error && data) {
          localStorage.setItem(LS_DUDI_KEY, JSON.stringify(data));
          return data as Dudi[];
        }
      } catch (err) {
        console.warn('Supabase bulk upsert failed, saving locally:', err);
      }
    }

    localStorage.setItem(LS_DUDI_KEY, JSON.stringify(items));
    return items;
  },

  syncLocalDudi(item: Dudi, action: 'add' | 'update' | 'delete') {
    try {
      const stored = localStorage.getItem(LS_DUDI_KEY);
      const list: Dudi[] = stored ? JSON.parse(stored) : INITIAL_DUDI_LIST;
      let nextList: Dudi[];
      if (action === 'add') {
        nextList = [item, ...list];
      } else if (action === 'update') {
        nextList = list.map((d) => (d.id === item.id ? item : d));
      } else {
        nextList = list.filter((d) => d.id !== item.id);
      }
      localStorage.setItem(LS_DUDI_KEY, JSON.stringify(nextList));
    } catch {
      // ignore
    }
  },

  // ===================== CMS CONTENT =====================
  async getCMSContent(): Promise<CMSContent> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cms_content').select('*');
        if (!error && data && data.length > 0) {
          const cmsMap: any = { ...DEFAULT_CMS_CONTENT };
          data.forEach((row) => {
            if (row.key && row.value) {
              cmsMap[row.key] = row.value;
            }
          });
          return cmsMap as CMSContent;
        }
      } catch (err) {
        console.warn('Supabase CMS fetch error, using local:', err);
      }
    }

    try {
      const stored = localStorage.getItem(LS_CMS_KEY);
      if (stored) {
        return JSON.parse(stored) as CMSContent;
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
    if (supabase) {
      try {
        await supabase.from('cms_content').upsert(
          {
            key: section,
            value: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn('Supabase CMS update error:', err);
      }
    }

    const current = await this.getCMSContent();
    current[section] = value;
    localStorage.setItem(LS_CMS_KEY, JSON.stringify(current));
    return current;
  },

  // ===================== GALLERY =====================
  async getGallery(): Promise<GalleryItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as GalleryItem[];
        }
      } catch (err) {
        console.warn('Supabase gallery fetch error, using local:', err);
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
        const { data, error } = await supabase
          .from('gallery')
          .insert([newItem])
          .select()
          .single();
        if (!error && data) {
          return data as GalleryItem;
        }
      } catch (err) {
        console.warn('Supabase gallery insert error:', err);
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
        await supabase.from('gallery').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase gallery delete error:', err);
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

  // ===================== ADMIN AUTH =====================
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

    // 1. Try checking admin_users table in Supabase if client configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .ilike('email', cleanEmail)
          .eq('password', cleanPass)
          .eq('is_active', true)
          .maybeSingle();

        if (data && !error) {
          this.setAdminLoggedIn(true);
          try {
            await supabase
              .from('admin_users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', data.id);
          } catch {
            // non-blocking
          }
          return true;
        }

        // Auto-seed into Supabase if logging in with valid admin credentials but row doesn't exist yet
        if (isPakAryanoe) {
          try {
            await supabase.from('admin_users').upsert({
              email: 'pakaryanoe@gmail.com',
              password: '@PTKsonggom1',
              full_name: 'Pak Aryanoe (Administrator GIS SMKN 1 Songgom)',
              role: 'superadmin',
              is_active: true,
              last_login: new Date().toISOString(),
            }, { onConflict: 'email' });
          } catch (upsertErr) {
            console.warn('Auto-seed admin in Supabase notice:', upsertErr);
          }
          this.setAdminLoggedIn(true);
          return true;
        }
      } catch (err) {
        console.warn('Supabase admin_users check error, trying fallback:', err);
      }
    }

    // 2. Default credentials fallback
    if (isPakAryanoe || isLegacyAdmin) {
      this.setAdminLoggedIn(true);
      return true;
    }

    return false;
  },
};
