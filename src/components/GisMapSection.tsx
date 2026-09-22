import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation2,
  Filter,
  Layers,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  Users,
  Search,
} from 'lucide-react';
import { Dudi, SchoolLocation, MeasureOrigin } from '../types';
import {
  calculateHaversineDistance,
  formatDistance,
  estimateTravelTime,
  getCompassBearing,
} from '../utils/geo';

interface GisMapSectionProps {
  school: SchoolLocation;
  dudiList: Dudi[];
  selectedDudi: Dudi | null;
  onSelectDudi: (dudi: Dudi | null) => void;
  onOpenDetailModal: (dudi: Dudi) => void;
}

export const GisMapSection: React.FC<GisMapSectionProps> = ({
  school,
  dudiList,
  selectedDudi,
  onSelectDudi,
  onOpenDetailModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const measurementLayerRef = useRef<L.LayerGroup | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);

  // Origin for distance measurement
  const [origin, setOrigin] = useState<MeasureOrigin>({
    type: 'school',
    name: 'SMK Negeri 1 Songgom',
    latitude: school.latitude,
    longitude: school.longitude,
  });

  const [activeTileLayer, setActiveTileLayer] = useState<'osm' | 'topo' | 'satellite'>('osm');
  const [showRadiusCircles, setShowRadiusCircles] = useState(true);
  const [filterKabupaten, setFilterKabupaten] = useState<string>('Semua');
  const [filterBidang, setFilterBidang] = useState<string>('Semua');
  const [mapSearch, setMapSearch] = useState<string>('');
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [clickToMeasureMode, setClickToMeasureMode] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  // Available unique districts and jobs for filters
  const safeDudiList = useMemo(() => (Array.isArray(dudiList) ? dudiList : []), [dudiList]);

  const kabupatenList = useMemo(() => {
    const set = new Set(safeDudiList.map((d) => d?.kabupaten || 'Lainnya'));
    return ['Semua', ...Array.from(set)];
  }, [safeDudiList]);

  // Calculate distance from current origin to all DUDIs
  const dudiWithDistance = useMemo(() => {
    return safeDudiList.map((dudi) => {
      const dist = calculateHaversineDistance(
        origin.latitude,
        origin.longitude,
        dudi.latitude,
        dudi.longitude
      );
      return {
        ...dudi,
        jarakKm: dist,
      };
    });
  }, [safeDudiList, origin]);

  // Filtered DUDI list
  const filteredDudi = useMemo(() => {
    return dudiWithDistance
      .filter((dudi) => {
        const matchKab =
          filterKabupaten === 'Semua' || dudi.kabupaten === filterKabupaten;
        const matchBidang =
          filterBidang === 'Semua' ||
          (dudi.bidang_pekerjaan &&
            dudi.bidang_pekerjaan.toLowerCase().includes(filterBidang.toLowerCase()));
        const matchSearch =
          !mapSearch.trim() ||
          dudi.nama_dudi.toLowerCase().includes(mapSearch.toLowerCase()) ||
          dudi.alamat.toLowerCase().includes(mapSearch.toLowerCase()) ||
          (dudi.pimpinan && dudi.pimpinan.toLowerCase().includes(mapSearch.toLowerCase())) ||
          (dudi.bidang_pekerjaan && dudi.bidang_pekerjaan.toLowerCase().includes(mapSearch.toLowerCase())) ||
          (dudi.kabupaten && dudi.kabupaten.toLowerCase().includes(mapSearch.toLowerCase()));
        return matchKab && matchBidang && matchSearch;
      })
      .sort((a, b) => (a.jarakKm || 0) - (b.jarakKm || 0));
  }, [dudiWithDistance, filterKabupaten, filterBidang, mapSearch]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map centered on Songgom
    const map = L.map(mapContainerRef.current, {
      center: [school.latitude, school.longitude],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    osmLayer.addTo(map);

    // Layer groups for dynamic markers and measurements
    const markersGroup = L.layerGroup().addTo(map);
    const measureGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;
    measurementLayerRef.current = measureGroup;

    // Map click handler for custom coordinate measuring
    map.on('click', (e: L.LeafletMouseEvent) => {
      // If user enabled custom point measurement or wants to measure from clicked location
      setOrigin({
        type: 'custom',
        name: `Titik Pilihan (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      setClickToMeasureMode(false);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [school]);

  // Tile layer switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newTileLayer: L.TileLayer;
    if (activeTileLayer === 'topo') {
      newTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors',
        maxZoom: 17,
      });
    } else if (activeTileLayer === 'satellite') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
          maxZoom: 18,
        }
      );
    } else {
      newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });
    }

    newTileLayer.addTo(map);
  }, [activeTileLayer]);

  // Draw school marker and radius circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const measureGroup = measurementLayerRef.current;
    if (!map || !measureGroup) return;

    measureGroup.clearLayers();

    // Custom School Icon - Warna Kuning (#FACC15 / Yellow) tulisan hitam dengan teks SKANSAS
    const schoolIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full animate-ping" style="background-color: rgba(234, 179, 8, 0.4);"></div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-black shadow-xl border-2 border-neutral-950 ring-2 ring-yellow-400 select-none" style="background-color: #FACC15; color: #000000; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);">
          <span style="font-size: 8.5px; font-weight: 900; line-height: 1; color: #000000; letter-spacing: -0.3px;">SKANSAS</span>
        </div>
      </div>
    `;

    const schoolIcon = L.divIcon({
      html: schoolIconHtml,
      className: 'school-custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const schoolMarker = L.marker([school.latitude, school.longitude], {
      icon: schoolIcon,
      zIndexOffset: 1000,
    }).bindPopup(`
      <div style="font-family: inherit; min-width: 220px;">
        <div style="font-size: 10px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Pusat Titik Acuan GIS (SKANSAS)</div>
        <h4 style="font-size: 14px; font-weight: 800; margin: 3px 0 6px 0; color: #0f172a;">${school.name}</h4>
        <p style="font-size: 11px; color: #475569; margin-bottom: 8px;">${school.address}</p>
        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 7px 9px; font-size: 11px; color: #854d0e; line-height: 1.4;">
          🏢 <b>Titik Pusat Referensi</b> pengukuran jarak ke seluruh tempat PKL DUDI mitra di Brebes, Tegal, Cirebon, dan sekitarnya.
        </div>
      </div>
    `);

    measureGroup.addLayer(schoolMarker);
    schoolMarkerRef.current = schoolMarker;

    // If custom or user origin, add origin indicator marker
    if (origin.type !== 'school') {
      const originIcon = L.divIcon({
        html: `
          <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-300 font-bold text-xs">
            📍
          </div>
        `,
        className: 'origin-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const originMarker = L.marker([origin.latitude, origin.longitude], {
        icon: originIcon,
        zIndexOffset: 999,
      }).bindPopup(`<b>Titik Pengukuran Aktif:</b><br/>${origin.name}`);

      measureGroup.addLayer(originMarker);
    }

    // Radius circles (5km, 10km, 20km) around current origin
    if (showRadiusCircles) {
      const circle5 = L.circle([origin.latitude, origin.longitude], {
        radius: 5000,
        color: '#dc2626',
        fillColor: '#fee2e2',
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: '5, 5',
      }).bindTooltip('Radius 5 km', { permanent: false, direction: 'right' });

      const circle10 = L.circle([origin.latitude, origin.longitude], {
        radius: 10000,
        color: '#f97316',
        fillColor: '#ffedd5',
        fillOpacity: 0.03,
        weight: 1.5,
        dashArray: '5, 5',
      }).bindTooltip('Radius 10 km', { permanent: false, direction: 'right' });

      const circle20 = L.circle([origin.latitude, origin.longitude], {
        radius: 20000,
        color: '#3b82f6',
        fillColor: '#dbeafe',
        fillOpacity: 0.02,
        weight: 1,
        dashArray: '5, 5',
      }).bindTooltip('Radius 20 km', { permanent: false, direction: 'right' });

      measureGroup.addLayer(circle5);
      measureGroup.addLayer(circle10);
      measureGroup.addLayer(circle20);
    }

    // Polyline connecting origin to selected DUDI
    if (selectedDudi) {
      const latlngs: L.LatLngExpression[] = [
        [origin.latitude, origin.longitude],
        [selectedDudi.latitude, selectedDudi.longitude],
      ];

      const polyline = L.polyline(latlngs, {
        color: '#dc2626',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      });

      measureGroup.addLayer(polyline);

      // Midpoint distance label
      const midLat = (origin.latitude + selectedDudi.latitude) / 2;
      const midLon = (origin.longitude + selectedDudi.longitude) / 2;
      const distKm = calculateHaversineDistance(
        origin.latitude,
        origin.longitude,
        selectedDudi.latitude,
        selectedDudi.longitude
      );

      const distancePopup = L.popup({
        closeButton: false,
        autoClose: false,
        className: 'distance-tooltip',
      })
        .setLatLng([midLat, midLon])
        .setContent(
          `<div style="font-weight: 800; font-size: 11px; color: #991b1b; text-align: center; padding: 2px 4px;">
            📏 ${formatDistance(distKm)} (${estimateTravelTime(distKm)})
          </div>`
        );

      measureGroup.addLayer(distancePopup);
    }
  }, [origin, school, showRadiusCircles, selectedDudi]);

  // Update DUDI markers
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    filteredDudi.forEach((dudi) => {
      const isSelected = selectedDudi?.id === dudi.id;

      // Color based on Kabupaten
      let pinColor = '#dc2626'; // Brebes: Red
      if (dudi.kabupaten?.includes('Kab. Tegal')) {
        pinColor = '#2563eb'; // Kab Tegal: Blue
      } else if (dudi.kabupaten?.includes('Kota Tegal')) {
        pinColor = '#059669'; // Kota Tegal: Emerald
      } else if (dudi.kabupaten?.includes('Banyumas')) {
        pinColor = '#d97706'; // Banyumas: Amber
      }

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div style="background-color: ${pinColor};" class="w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-[11px] leading-none text-center shadow-md border-2 border-white ring-1 ring-black/25 select-none">
            ${dudi.no}
          </div>
          ${
            isSelected
              ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full ring-2 ring-white animate-bounce"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'dudi-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const dist = dudi.jarakKm ?? calculateHaversineDistance(
        origin.latitude,
        origin.longitude,
        dudi.latitude,
        dudi.longitude
      );

      const marker = L.marker([dudi.latitude, dudi.longitude], {
        icon: customIcon,
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family: inherit; min-width: 220px; max-width: 270px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">
              No. ${dudi.no} • Kuota: ${dudi.maksimal_siswa} Siswa
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #2563eb;">
              ${formatDistance(dist)}
            </span>
          </div>

          <h4 style="font-size: 14px; font-weight: 800; color: #111827; margin: 0 0 2px 0;">
            ${dudi.nama_dudi}
          </h4>

          <div style="font-size: 11px; color: #4b5563; margin-bottom: 6px;">
            <b>Pimpinan:</b> ${dudi.pimpinan || '-'}
          </div>

          <div style="font-size: 11px; color: #374151; background: #f9fafb; padding: 6px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #f3f4f6;">
            <div style="margin-bottom: 2px;"><b>Bidang:</b> ${dudi.bidang_pekerjaan || '-'}</div>
            <div style="color: #6b7280; font-size: 10px;">${dudi.alamat}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button id="btn-popup-detail-${dudi.id}" style="background: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Detail Lengkap
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${dudi.latitude},${dudi.longitude}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #f3f4f6; color: #1f2937; text-decoration: none; border-radius: 6px; font-size: 11px; font-weight: 600; text-align: center; padding: 6px;">
              Rute Maps
            </a>
          </div>
        </div>
      `;

      // Attach event listener to detail button inside popup
      popupContent.querySelector(`#btn-popup-detail-${dudi.id}`)?.addEventListener('click', () => {
        onOpenDetailModal(dudi);
      });

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectDudi(dudi);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredDudi, selectedDudi, origin, onOpenDetailModal, onSelectDudi]);

  // Center on selected DUDI if changed
  useEffect(() => {
    if (selectedDudi && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedDudi.latitude, selectedDudi.longitude],
        14,
        { duration: 1.2 }
      );
    }
  }, [selectedDudi]);

  // Trigger GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur deteksi lokasi (Geolocation).');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        setOrigin({
          type: 'user',
          name: 'Lokasi Saya (GPS)',
          latitude,
          longitude,
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 12);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        alert(`Tidak dapat mendeteksi lokasi: ${err.message}. Pastikan izin lokasi diaktifkan.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Reset origin to School
  const handleResetToSchool = () => {
    setOrigin({
      type: 'school',
      name: 'SMK Negeri 1 Songgom',
      latitude: school.latitude,
      longitude: school.longitude,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([school.latitude, school.longitude], 11);
    }
  };

  return (
    <section id="gis-map" className="relative bg-neutral-100 py-10 lg:py-16 border-b border-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded-md mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>SISTEM INFORMASI GEOGRAFIS SPASIAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Pemetaan Geografis Tempat PKL TKJ
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              Eksplorasi sebaran DUDI mitra, ukur jarak otomatis dari sekolah atau rumah Anda, serta analisis rute praktik kerja.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-white p-2 rounded-xl shadow-xs border border-neutral-200">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Brebes
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Tegal
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Kota Tegal
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Banyumas
            </span>
          </div>
        </div>

        {/* Distance Measurement Control Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Origin Status */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-700 flex items-center gap-1">
                <Navigation2 className="w-3.5 h-3.5 text-red-600" /> Titik Ukur Jarak:
              </span>
              <span className="bg-red-50 text-red-800 font-bold px-2.5 py-1 rounded-lg border border-red-200">
                {origin.name}
              </span>
            </div>

            {/* Quick Origin Switch Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-measure-school"
                onClick={handleResetToSchool}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  origin.type === 'school'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Dari SMKN 1 Songgom</span>
              </button>

              <button
                id="btn-measure-gps"
                onClick={handleUseCurrentLocation}
                disabled={isLocatingUser}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  origin.type === 'user'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isLocatingUser ? 'Mencari GPS...' : 'Dari Lokasi Saya (GPS)'}</span>
              </button>

              <button
                id="btn-measure-custom"
                onClick={() => setClickToMeasureMode(!clickToMeasureMode)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  clickToMeasureMode || origin.type === 'custom'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <span>📍 Klik Titik di Peta</span>
              </button>
            </div>
          </div>

          {clickToMeasureMode && (
            <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-2.5 text-xs flex items-center gap-2 animate-pulse">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <b>Mode Ukur Aktif:</b> Silakan klik di area mana saja pada peta (misal desa asal / rumah Anda) untuk mengukur jarak ke semua tempat PKL.
              </span>
            </div>
          )}
        </div>

        {/* GIS Map & Side Explorer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Map Box (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-2 shadow-sm border border-neutral-200 relative flex flex-col h-[520px] sm:h-[600px]">
            {/* Map Legend (Top Left) */}
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-neutral-200 text-[11px] space-y-1.5 pointer-events-auto">
              <div className="font-extrabold text-[10px] text-neutral-500 uppercase tracking-wider">Keterangan Simbol</div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-neutral-900 shadow-xs shrink-0 flex items-center justify-center font-black text-[6.5px] text-black" style={{ backgroundColor: '#FACC15' }}>★</span>
                <span className="font-bold text-neutral-800">SMKN 1 Songgom (SKANSAS - Kuning)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs shrink-0 flex items-center justify-center font-black text-[7px] text-white">1</span>
                <span className="text-neutral-700">DUDI (Nomor di Tengah Titik)</span>
              </div>
            </div>

            {/* Map Controls Overlay (Top Right) */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
              {/* Tile switcher */}
              <div className="bg-white/95 backdrop-blur-xs rounded-xl p-1 shadow-md border border-neutral-200 flex gap-1 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTileLayer('osm')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTileLayer === 'osm'
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Peta
                </button>
                <button
                  onClick={() => setActiveTileLayer('topo')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTileLayer === 'topo'
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Topografi
                </button>
                <button
                  onClick={() => setActiveTileLayer('satellite')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTileLayer === 'satellite'
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Satelit
                </button>
              </div>

              {/* Radius circle toggle */}
              <button
                onClick={() => setShowRadiusCircles(!showRadiusCircles)}
                className={`bg-white/95 backdrop-blur-xs text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md border border-neutral-200 flex items-center justify-between gap-2 transition-colors ${
                  showRadiusCircles ? 'text-red-700 border-red-200 bg-red-50/90' : 'text-neutral-600'
                }`}
                title="Tampilkan / sembunyikan lingkaran radius zona jarak"
              >
                <span>Lingkaran Radius</span>
                <span className={`w-2 h-2 rounded-full ${showRadiusCircles ? 'bg-red-600' : 'bg-neutral-300'}`} />
              </button>

              <button
                onClick={handleResetToSchool}
                className="bg-white/95 backdrop-blur-xs text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md border border-neutral-200 text-neutral-700 hover:text-red-700 flex items-center gap-1.5 transition-colors self-end"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            </div>

            {/* Selected DUDI Quick Card Overlay (Bottom Left on Map) */}
            {selectedDudi && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[400] bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border-2 border-red-600 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        No. {selectedDudi.no} • {selectedDudi.kabupaten}
                      </span>
                      <span className="text-xs font-bold text-red-700">
                        {formatDistance(
                          calculateHaversineDistance(
                            origin.latitude,
                            origin.longitude,
                            selectedDudi.latitude,
                            selectedDudi.longitude
                          )
                        )}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-neutral-900 text-sm mt-1">
                      {selectedDudi.nama_dudi}
                    </h4>
                    <p className="text-xs text-neutral-500 line-clamp-1">{selectedDudi.alamat}</p>
                  </div>
                  <button
                    onClick={() => onSelectDudi(null)}
                    className="text-neutral-400 hover:text-neutral-700 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-neutral-600">
                    Waktu Tempuh: <b>{estimateTravelTime(
                      calculateHaversineDistance(
                        origin.latitude,
                        origin.longitude,
                        selectedDudi.latitude,
                        selectedDudi.longitude
                      )
                    )}</b> ({getCompassBearing(origin.latitude, origin.longitude, selectedDudi.latitude, selectedDudi.longitude)})
                  </div>
                  <button
                    onClick={() => onOpenDetailModal(selectedDudi)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Detail Lengkap
                  </button>
                </div>
              </div>
            )}

            {/* Actual Leaflet Map Canvas */}
            <div
              id="leaflet-gis-map-canvas"
              ref={mapContainerRef}
              className="w-full h-full rounded-xl z-0"
            />
          </div>

          {/* Side Explorer: Filter & Terurut Berdasarkan Jarak (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex flex-col h-[520px] sm:h-[600px]">
            {/* Header & Filter Inputs */}
            <div className="space-y-3 pb-3 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-neutral-900 text-sm flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-red-600" />
                  <span>Daftar DUDI</span>
                </h3>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {filteredDudi.length} Tempat • dari {origin.type === 'school' ? 'SMKN 1' : 'titik acuan'}
                </span>
              </div>

              {/* Search Inside Map List */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari DUDI di peta..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              {/* Kabupaten Dropdown Filter */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 block mb-1">
                    Kabupaten
                  </label>
                  <select
                    value={filterKabupaten}
                    onChange={(e) => setFilterKabupaten(e.target.value)}
                    className="w-full p-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white outline-none"
                  >
                    {kabupatenList.map((kab) => (
                      <option key={kab} value={kab}>
                        {kab}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 block mb-1">
                    Bidang Pekerjaan
                  </label>
                  <select
                    value={filterBidang}
                    onChange={(e) => setFilterBidang(e.target.value)}
                    className="w-full p-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white outline-none"
                  >
                    <option value="Semua">Semua Bidang</option>
                    <option value="Teknisi">Teknisi / Mekanik</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Penjualan">Penjualan</option>
                    <option value="Jaringan">Jaringan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Nearest DUDI List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 pr-1 mt-2 space-y-1">
              {filteredDudi.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  Tidak ada tempat DUDI yang cocok dengan filter yang dipilih.
                </div>
              ) : (
                filteredDudi.map((dudi) => {
                  const isSelected = selectedDudi?.id === dudi.id;
                  return (
                    <div
                      key={dudi.id}
                      onClick={() => onSelectDudi(dudi)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-50 border border-red-300 shadow-xs'
                          : 'hover:bg-neutral-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {dudi.no}
                          </span>
                          <span className="font-extrabold text-xs text-neutral-900 line-clamp-1">
                            {dudi.nama_dudi}
                          </span>
                        </div>
                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                          {formatDistance(dudi.jarakKm)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="line-clamp-1">{dudi.kabupaten}</span>
                        <span className="text-neutral-400">
                          {estimateTravelTime(dudi.jarakKm)}
                        </span>
                      </div>

                      <div className="mt-1 text-[10px] text-neutral-600 bg-neutral-100/60 px-2 py-1 rounded line-clamp-1">
                        {dudi.bidang_pekerjaan || 'Teknisi / Jaringan'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary in Sidebar */}
            <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Klik kartu untuk fokus pada peta</span>
              <span className="font-bold text-neutral-800">{filteredDudi.length} Tempat</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
