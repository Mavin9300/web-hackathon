import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Edit2, Trash2, Phone, Mail, Clock, MapPinned } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { API_URL } from '../config';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ExchangeStalls = () => {
  const [stalls, setStalls] = useState([]);
  const [myStalls, setMyStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStall, setEditingStall] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [errors, setErrors] = useState({});
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    contact_phone: '',
    contact_email: '',
    timing: '',
    opening_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchStalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!showCreateModal && !editingStall) return;
    if (!mapContainer.current) return;
    if (map.current) return; // already initialized

    const initialCenter = formData.latitude && formData.longitude
      ? [formData.longitude, formData.latitude]
      : [74.3587, 31.5204]; // Default to Lahore, Pakistan

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: initialCenter,
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate, 'top-right');

    marker.current = new maplibregl.Marker({ draggable: true })
      .setLngLat(initialCenter)
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(lngLat.lat.toFixed(6)),
        longitude: parseFloat(lngLat.lng.toFixed(6))
      }));
    });

    map.current.on('click', (e) => {
      marker.current.setLngLat(e.lngLat);
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(e.lngLat.lat.toFixed(6)),
        longitude: parseFloat(e.lngLat.lng.toFixed(6))
      }));
      map.current.flyTo({
        center: e.lngLat,
        zoom: 16,
        speed: 1.5,
      });
    });

    geolocate.on('geolocate', (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      marker.current.setLngLat([lng, lat]);
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      }));
      map.current.zoomTo(14);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showCreateModal, editingStall]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch all stalls
      const response = await fetch(`${API_URL}/api/exchange-points`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStalls(data.exchangePoints || []);

        // Filter my stalls
        if (user) {
          setMyStalls(data.exchangePoints?.filter(stall => stall.owner_id === user.id) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Stall name must be at least 3 characters';
    }

    if (!formData.location || formData.location.trim().length < 3) {
      newErrors.location = 'Location is required';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.coordinates = 'Please select a location on the map';
    }

    if (formData.contact_phone && !/^[\d\s\+\-\(\)]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number format';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    if (timeRange.start && timeRange.end && timeRange.start >= timeRange.end) {
      newErrors.timing = 'Closing time must be after opening time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStall = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const timing = (timeRange.start && timeRange.end) ? `${timeRange.start} - ${timeRange.end}` : '';

      const response = await fetch(`${API_URL}/api/exchange-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          timing,
          owner_id: user.id
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchStalls();
      }
    } catch (error) {
      console.error('Error creating stall:', error);
    }
  };

  const handleUpdateStall = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const timing = (timeRange.start && timeRange.end) ? `${timeRange.start} - ${timeRange.end}` : '';

      const response = await fetch(`${API_URL}/api/exchange-points/${editingStall.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ ...formData, timing })
      });

      if (response.ok) {
        setEditingStall(null);
        resetForm();
        fetchStalls();
      }
    } catch (error) {
      console.error('Error updating stall:', error);
    }
  };

  const handleDeleteStall = async (stallId) => {
    if (!confirm('Are you sure you want to delete this stall?')) return;

    try {
      const response = await fetch(`${API_URL}/api/exchange-points/${stallId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        fetchStalls();
      }
    } catch (error) {
      console.error('Error deleting stall:', error);
    }
  };

  const openEditModal = (stall) => {
    setEditingStall(stall);
    setFormData({
      name: stall.name,
      description: stall.description || '',
      location: stall.location,
      latitude: stall.latitude,
      longitude: stall.longitude,
      contact_phone: stall.contact_phone || '',
      contact_email: stall.contact_email || '',
      timing: stall.timing || '',
      opening_date: stall.opening_date ? new Date(stall.opening_date).toISOString().split('T')[0] : '',
      is_active: stall.is_active
    });

    // Try to parse existing timing "09:00 - 17:00"
    // If it doesn't match, we might just lose the detailed text but that's expected with the UI change
    const [start, end] = stall.timing ? stall.timing.split(' - ') : ['', ''];
    // Basic check if they look like times, otherwise default empty
    const isValidTime = (t) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t);
    setTimeRange({
      start: isValidTime(start) ? start : '',
      end: isValidTime(end) ? end : ''
    });
  };

  const resetForm = () => {
    setTimeRange({ start: '', end: '' });
    setErrors({});
    setFormData({
      name: '',
      description: '',
      location: '',
      latitude: null,
      longitude: null,
      contact_phone: '',
      contact_email: '',
      timing: '',
      opening_date: '',
      is_active: true
    });
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6))
          }));
          if (marker.current && map.current) {
            marker.current.setLngLat([lng, lat]);
            map.current.flyTo({
              center: [lng, lat],
              zoom: 14,
              speed: 1.5,
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please click on the map to select a location.');
        }
      );
    }
  };

  const displayStalls = activeTab === 'all' ? stalls : myStalls;

  return (
    <div className="min-h-screen bg-[#1a0f0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FDFBF7] mb-2">Exchange Stalls</h1>
          <p className="text-[#D2B48C]/70">Discover nearby book exchange points or create your own</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'all'
                ? 'bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-[#2C1A11] shadow-lg font-bold'
                : 'bg-[#2C1A11] text-[#D2B48C]/70 hover:bg-[#3E2723] hover:text-[#D2B48C]'
                }`}
            >
              All Stalls ({stalls.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'mine'
                ? 'bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-[#2C1A11] shadow-lg font-bold'
                : 'bg-[#2C1A11] text-[#D2B48C]/70 hover:bg-[#3E2723] hover:text-[#D2B48C]'
                }`}
            >
              My Stalls ({myStalls.length})
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto md:ml-auto px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-emerald-500/30"
          >
            <Plus size={20} />
            Create Stall
          </button>
        </div>

        {/* Stalls Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B48C] mx-auto"></div>
          </div>
        ) : displayStalls.length === 0 ? (
          <div className="text-center py-12 bg-[#2C1A11] rounded-xl shadow-sm border border-[#8B4513]/30">
            <MapPinned size={48} className="mx-auto text-[#8B4513] mb-4" />
            <p className="text-[#D2B48C]/70 text-lg">
              {activeTab === 'mine' ? 'You haven\'t created any stalls yet' : 'No stalls available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStalls.map((stall) => (
              <div
                key={stall.id}
                className="bg-[#2C1A11] rounded-xl shadow-lg overflow-hidden hover:shadow-[#D2B48C]/10 transition-all border border-[#8B4513]/30 group"
              >
                <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#FDFBF7] mb-1">{stall.name}</h3>
                      <div className="flex items-center gap-1 text-[#D2B48C]">
                        <MapPin size={14} />
                        <span className="text-sm text-[#FDFBF7]/90">{stall.location}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${stall.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                      {stall.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {stall.description && (
                    <p className="text-[#D2B48C]/80 text-sm mb-4 line-clamp-2">{stall.description}</p>
                  )}

                  {stall.timing && (
                    <div className="flex items-center gap-2 text-sm text-[#D2B48C]/60 mb-3">
                      <Clock size={16} />
                      <span>{stall.timing}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {stall.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-[#D2B48C]" />
                        <a href={`tel:${stall.contact_phone}`} className="text-[#FDFBF7] hover:text-[#D2B48C]">
                          {stall.contact_phone}
                        </a>
                      </div>
                    )}
                    {stall.contact_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-[#D2B48C]" />
                        <a href={`mailto:${stall.contact_email}`} className="text-[#FDFBF7] hover:text-[#D2B48C]">
                          {stall.contact_email}
                        </a>
                      </div>
                    )}
                  </div>

                  {activeTab === 'mine' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#8B4513]/30">
                      <button
                        onClick={() => openEditModal(stall)}
                        className="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStall(stall.id)}
                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingStall) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[#2C1A11] rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-[#8B4513]/50 shadow-2xl scrollbar-thin my-4">
              <div className="sticky top-0 bg-gradient-to-r from-[#8B4513] to-[#A0522D] p-6 text-[#FDFBF7] z-10">
                <h2 className="text-2xl font-bold">
                  {editingStall ? 'Edit Stall' : 'Create New Stall'}
                </h2>
              </div>

              <form onSubmit={editingStall ? handleUpdateStall : handleCreateStall} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Stall Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        placeholder="e.g., Downtown Book Exchange"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        rows="3"
                        placeholder="Tell others about your stall..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Address/Location Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        placeholder="12 Gulberg, Lahore"
                      />
                      {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                      {errors.contact_phone && <p className="text-red-400 text-sm mt-1">{errors.contact_phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        placeholder="stall@example.com"
                      />
                      {errors.contact_email && <p className="text-red-400 text-sm mt-1">{errors.contact_email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Opening Date
                      </label>
                      <input
                        type="date"
                        value={formData.opening_date}
                        onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={timeRange.start}
                          onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                          className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={timeRange.end}
                          onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                          className="w-full px-4 py-2 bg-[#1a0f0a] border border-[#8B4513]/50 rounded-lg text-[#FDFBF7] focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
                        />
                      </div>
                    </div>
                    {errors.timing && <p className="text-red-400 text-sm mt-1">{errors.timing}</p>}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-[#D2B48C] bg-[#1a0f0a] border-gray-600 rounded focus:ring-[#D2B48C]"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-[#D2B48C]">
                        Mark as Active
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#D2B48C] mb-2">
                        Select Location on Map *
                      </label>
                      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border border-[#8B4513]/50 overflow-hidden" />
                      {errors.coordinates && <p className="text-red-400 text-sm mt-1">{errors.coordinates}</p>}
                      <p className="text-xs text-[#D2B48C]/50 mt-2">
                        Click on the map or drag the marker to set the location
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="w-full px-4 py-2 bg-[#3E2723] text-[#D2B48C] border border-[#8B4513]/50 rounded-lg hover:bg-[#2C1A11] transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={16} />
                      Use My Current Location
                    </button>

                    {formData.latitude && formData.longitude && (
                      <div className="bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg p-3">
                        <p className="text-sm text-[#D2B48C]/70">Selected Coordinates:</p>
                        <p className="text-xs text-[#FDFBF7] font-mono mt-1">
                          Lat: {formData.latitude}, Lng: {formData.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t border-[#8B4513]/30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingStall(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-[#3E2723] text-[#D2B48C] border border-[#8B4513]/50 rounded-lg hover:bg-[#2C1A11] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-[#2C1A11] rounded-lg hover:shadow-lg transition-all font-bold"
                  >
                    {editingStall ? 'Update Stall' : 'Create Stall'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeStalls;
