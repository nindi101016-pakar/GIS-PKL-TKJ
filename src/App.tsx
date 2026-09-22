/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GisMapSection } from './components/GisMapSection';
import { DudiCatalogSection } from './components/DudiCatalogSection';
import { TentangTkjSection } from './components/TentangTkjSection';
import { ManfaatSection } from './components/ManfaatSection';
import { GaleriSection } from './components/GaleriSection';
import { KontakSection } from './components/KontakSection';
import { Footer } from './components/Footer';
import { DudiDetailModal } from './components/DudiDetailModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DudiFormModal } from './components/admin/DudiFormModal';

import { Dudi, CMSContent, GalleryItem, SchoolLocation } from './types';
import { dataService } from './lib/supabase';

export default function App() {
  // Application Data States
  const [dudiList, setDudiList] = useState<Dudi[]>([]);
  const [cmsContent, setCmsContent] = useState<CMSContent | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeSection, setActiveSection] = useState('beranda');

  const [school, setSchool] = useState<SchoolLocation>({
    name: 'SMK Negeri 1 Songgom',
    tagline: 'Mencetak Teknisi Jaringan Handal, Berkarakter, & Siap Kerja',
    address: 'Jl. Raya Songgom, Kec. Songgom, Kab. Brebes, Jawa Tengah 52266',
    latitude: -7.0264,
    longitude: 108.9982,
    website: 'https://www.smkn1songgom.sch.id',
    email: 'info@smkn1songgom.sch.id',
    phone: '(0283) 6175001',
    headmaster: 'Drs. H. Ahmad Sobari, M.Pd.',
    departmentName: 'Teknik Komputer dan Jaringan (TKJ)',
    accreditation: 'Akreditasi A',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Active / Selected States
  const [selectedDudi, setSelectedDudi] = useState<Dudi | null>(null);
  const [detailModalDudi, setDetailModalDudi] = useState<Dudi | null>(null);

  // Admin and CMS View States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showDudiForm, setShowDudiForm] = useState(false);
  const [editingDudi, setEditingDudi] = useState<Dudi | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dudiData, cmsData, galleryData] = await Promise.all([
          dataService.getDudiList(),
          dataService.getCMSContent(),
          dataService.getGallery(),
        ]);
        setDudiList(dudiData);
        setCmsContent(cmsData);
        setGallery(galleryData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Check saved login state
    const savedAdmin = localStorage.getItem('smkn1songgom_admin_auth');
    if (savedAdmin === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handlers for Map Focus
  const handleFocusDudiOnMap = (dudi: Dudi) => {
    setSelectedDudi(dudi);
    handleNavigate('gis-map');
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('smkn1songgom_admin_auth', 'true');
    setShowAdminDashboard(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('smkn1songgom_admin_auth');
    setShowAdminDashboard(false);
  };

  // DUDI CRUD Handlers
  const handleSaveDudi = async (data: Omit<Dudi, 'id'>, id?: string) => {
    if (id) {
      const updated = await dataService.updateDudi(id, data);
      setDudiList((prev) =>
        prev.map((item) =>
          item.id === id || item.id === updated.id || (item.no === updated.no && item.no !== undefined)
            ? updated
            : item
        )
      );
    } else {
      const created = await dataService.createDudi(data);
      setDudiList((prev) => [...prev, created]);
    }
    setShowDudiForm(false);
    setEditingDudi(null);
  };

  const handleDeleteDudi = async (id: string) => {
    await dataService.deleteDudi(id);
    setDudiList((prev) => prev.filter((item) => item.id !== id));
    if (selectedDudi?.id === id) {
      setSelectedDudi(null);
    }
    if (detailModalDudi?.id === id) {
      setDetailModalDudi(null);
    }
  };

  const handleBulkImportDudi = async (items: Dudi[]) => {
    const imported = await dataService.bulkImportDudi(items);
    setDudiList(imported);
  };

  // CMS Update Handler
  const handleUpdateCMS = async (section: keyof CMSContent, value: any) => {
    if (!cmsContent) return;
    const updated = await dataService.updateCMSContent(section, value);
    setCmsContent(updated);
  };

  // Gallery Handlers
  const handleAddGallery = async (item: Omit<GalleryItem, 'id'>) => {
    const created = await dataService.addGalleryItem(item);
    setGallery((prev) => [created, ...prev]);
  };

  const handleDeleteGallery = async (id: string) => {
    await dataService.deleteGalleryItem(id);
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  if (isLoading || !cmsContent) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Memuat Sistem GIS Tempat PKL...</h2>
        <p className="text-xs text-neutral-400 mt-1">SMK Negeri 1 Songgom • Teknik Komputer & Jaringan</p>
      </div>
    );
  }

  // If Admin Dashboard is active, render it full screen
  if (showAdminDashboard && isAdminLoggedIn) {
    return (
      <>
        <AdminDashboard
          dudiList={dudiList}
          cms={cmsContent}
          gallery={gallery}
          school={school}
          onClose={() => setShowAdminDashboard(false)}
          onLogout={handleAdminLogout}
          onAddDudi={() => {
            setEditingDudi(null);
            setShowDudiForm(true);
          }}
          onEditDudi={(dudi) => {
            setEditingDudi(dudi);
            setShowDudiForm(true);
          }}
          onDeleteDudi={handleDeleteDudi}
          onBulkImportDudi={handleBulkImportDudi}
          onUpdateCMS={handleUpdateCMS}
          onAddGallery={handleAddGallery}
          onDeleteGallery={handleDeleteGallery}
        />

        {/* DUDI Add/Edit Modal */}
        <DudiFormModal
          isOpen={showDudiForm}
          dudiToEdit={editingDudi}
          nextNumber={dudiList.length + 1}
          onClose={() => {
            setShowDudiForm(false);
            setEditingDudi(null);
          }}
          onSave={handleSaveDudi}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        school={school}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setShowAdminDashboard(true);
          } else {
            setShowAdminLogin(true);
          }
        }}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          cms={cmsContent}
          school={school}
          dudiList={dudiList}
          onNavigate={handleNavigate}
          onSelectDudiForMap={handleFocusDudiOnMap}
          onOpenAdmin={() => {
            if (isAdminLoggedIn) {
              setShowAdminDashboard(true);
            } else {
              setShowAdminLogin(true);
            }
          }}
        />

        {/* GIS Map & Distance Measurement Section */}
        <GisMapSection
          school={school}
          dudiList={dudiList}
          selectedDudi={selectedDudi}
          onSelectDudi={(dudi: Dudi | null) => setSelectedDudi(dudi)}
          onOpenDetailModal={(dudi: Dudi) => setDetailModalDudi(dudi)}
        />

        {/* Daftar DUDI Catalog with Filters & Search */}
        <DudiCatalogSection
          dudiList={dudiList}
          school={school}
          onFocusMap={handleFocusDudiOnMap}
          selectedDudi={selectedDudi}
          onOpenDetailModal={(dudi: Dudi) => setDetailModalDudi(dudi)}
        />

        {/* Tentang Konsentrasi Keahlian TKJ */}
        <TentangTkjSection cms={cmsContent} />

        {/* Tujuan dan Manfaat Mapping */}
        <ManfaatSection cms={cmsContent} />

        {/* Galeri Foto PKL */}
        <GaleriSection galleryItems={gallery} />

        {/* Kontak & Informasi Sekolah */}
        <KontakSection school={school} cms={cmsContent} />
      </main>

      {/* Footer */}
      <Footer school={school} onNavigate={handleNavigate} />

      {/* DUDI Detail Modal */}
      <DudiDetailModal
        dudi={detailModalDudi}
        school={school}
        onClose={() => setDetailModalDudi(null)}
        onFocusOnMap={handleFocusDudiOnMap}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
