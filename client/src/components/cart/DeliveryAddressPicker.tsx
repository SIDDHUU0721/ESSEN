import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  CheckCircle2,
  Bookmark,
  Home,
  Briefcase,
  Building2,
  Sparkles,
  Crosshair,
  Layers,
  Map as MapIcon,
  Keyboard,
  ListFilter,
  Check,
} from 'lucide-react';

export interface DeliveryAddressData {
  id?: string;
  title: string;
  street: string;
  area?: string;
  city: string;
  state?: string;
  pincode: string;
  coordinates?: [number, number]; // [lng, lat]
  landmark?: string;
  isDefault?: boolean;
  dropoffPills?: string[];
  riderNotes?: string;
}

interface DeliveryAddressPickerProps {
  initialAddress?: DeliveryAddressData;
  savedAddresses?: DeliveryAddressData[];
  onSelectAddress: (address: DeliveryAddressData) => void;
}

// Curated Popular Indian Localities & Landmarks for fast search autocomplete
const POPULAR_SUGGESTIONS: Array<{
  name: string;
  area: string;
  city: string;
  pincode: string;
  coordinates: [number, number];
  tag: string;
}> = [
  {
    name: '42 Marina Bay View, Beach Road',
    area: 'Mylapore / Marina Beach',
    city: 'Chennai',
    pincode: '600004',
    coordinates: [80.2824, 13.0499],
    tag: 'Coastal View',
  },
  {
    name: 'Tower B, Global Infocity, OMR IT Expressway',
    area: 'Kandanchavadi / Perungudi',
    city: 'Chennai',
    pincode: '600096',
    coordinates: [80.2452, 12.9698],
    tag: 'Tech Hub',
  },
  {
    name: '14 Khader Nawaz Khan Road',
    area: 'Nungambakkam',
    city: 'Chennai',
    pincode: '600034',
    coordinates: [80.2435, 13.0604],
    tag: 'Fine Dining Row',
  },
  {
    name: '55 TTK Road, Near Music Academy',
    area: 'Alwarpet',
    city: 'Chennai',
    pincode: '600018',
    coordinates: [80.2514, 13.0338],
    tag: 'Heritage Center',
  },
  {
    name: '18 2nd Main Road, Gandhi Nagar',
    area: 'Adyar',
    city: 'Chennai',
    pincode: '600020',
    coordinates: [80.2554, 13.0067],
    tag: 'Residential Hub',
  },
  {
    name: '42 Phoenix Market City, Velachery Main Rd',
    area: 'Velachery',
    city: 'Chennai',
    pincode: '600042',
    coordinates: [80.2176, 12.9915],
    tag: 'Mall District',
  },
  {
    name: '82 2nd Avenue, Roundtana',
    area: 'Anna Nagar West',
    city: 'Chennai',
    pincode: '600040',
    coordinates: [80.2114, 13.085],
    tag: 'Prime Commercial',
  },
  {
    name: '24 Usman Road, Panagal Park',
    area: 'T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    coordinates: [80.2341, 13.0418],
    tag: 'Bustling Bazaar',
  },
  {
    name: '100 Feet Road, 12th Main Junction',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    coordinates: [77.6412, 12.9719],
    tag: 'Café District',
  },
  {
    name: '80 Feet Road, 5th Block',
    area: 'Koramangala',
    city: 'Bengaluru',
    pincode: '560095',
    coordinates: [77.6245, 12.9352],
    tag: 'Startup Hub',
  },
  {
    name: 'Hill Road & Linking Road Crossing',
    area: 'Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    coordinates: [72.8295, 19.0596],
    tag: 'Fashion & Food',
  },
];

export const DeliveryAddressPicker: React.FC<DeliveryAddressPickerProps> = ({
  initialAddress,
  savedAddresses = [],
  onSelectAddress,
}) => {
  // Tabs: 'TYPE' | 'MAP' | 'SAVED'
  const [activeTab, setActiveTab] = useState<'TYPE' | 'MAP' | 'SAVED'>('TYPE');

  // Default initial saved addresses
  const defaultSaved: DeliveryAddressData[] =
    savedAddresses.length > 0
      ? savedAddresses
      : [
          {
            id: 'addr_1',
            title: 'Home',
            street: '42 Marina Bay View',
            area: 'Mylapore',
            city: 'Chennai',
            pincode: '600004',
            coordinates: [80.2824, 13.0499],
            isDefault: true,
          },
          {
            id: 'addr_2',
            title: 'Office',
            street: 'Tech Park Tower B, OMR',
            area: 'Perungudi',
            city: 'Chennai',
            pincode: '600096',
            coordinates: [80.2452, 12.9698],
            isDefault: false,
          },
        ];

  // Active address state
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddressData>(
    initialAddress || defaultSaved[0]
  );

  // Search & autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState(POPULAR_SUGGESTIONS);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form field states for typing tab
  const [houseNo, setHouseNo] = useState('');
  const [streetArea, setStreetArea] = useState(currentAddress.street || '');
  const [city, setCity] = useState(currentAddress.city || 'Chennai');
  const [pincode, setPincode] = useState(currentAddress.pincode || '600004');
  const [addressTitle, setAddressTitle] = useState(currentAddress.title || 'Home');
  const [saveAsSaved, setSaveAsSaved] = useState(false);

  // Interactive map state
  const [pinCoordinates, setPinCoordinates] = useState<[number, number]>(
    currentAddress.coordinates || [80.2824, 13.0499]
  ); // [lng, lat]
  const [pinLocationName, setPinLocationName] = useState(
    currentAddress.street || 'Marina Beach, Chennai'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [mapZoom, setMapZoom] = useState(1);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Delivery drop-off instructions & rider notes
  const [dropoffPills, setDropoffPills] = useState<string[]>(
    initialAddress?.dropoffPills || ['Leave at door']
  );
  const [riderNotes, setRiderNotes] = useState<string>(
    initialAddress?.riderNotes || ''
  );

  const toggleDropoffPill = (label: string) => {
    setDropoffPills((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  // Sync to parent on address and instruction changes
  useEffect(() => {
    onSelectAddress({
      ...currentAddress,
      dropoffPills,
      riderNotes,
    });
  }, [currentAddress, dropoffPills, riderNotes]);

  // Filter autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions(POPULAR_SUGGESTIONS);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = POPULAR_SUGGESTIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.pincode.includes(q) ||
          s.tag.toLowerCase().includes(q)
      );
      setFilteredSuggestions(filtered);
    }
  }, [searchQuery]);

  // Click outside listener for suggestions popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (s: (typeof POPULAR_SUGGESTIONS)[0]) => {
    setStreetArea(s.name);
    setCity(s.city);
    setPincode(s.pincode);
    setPinCoordinates(s.coordinates);
    setPinLocationName(`${s.name}, ${s.area}`);
    setSearchQuery(`${s.name}, ${s.city}`);
    setShowSuggestions(false);

    const updated: DeliveryAddressData = {
      title: addressTitle || 'Selected Location',
      street: s.name,
      area: s.area,
      city: s.city,
      pincode: s.pincode,
      coordinates: s.coordinates,
    };
    setCurrentAddress(updated);
  };

  // Handle applying typed address
  const handleApplyTypedAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullStreet = houseNo ? `${houseNo}, ${streetArea}` : streetArea;
    const updated: DeliveryAddressData = {
      id: `addr_custom_${Date.now()}`,
      title: addressTitle,
      street: fullStreet || 'Custom Delivery Address',
      city: city || 'Chennai',
      pincode: pincode || '600004',
      coordinates: pinCoordinates,
    };
    setCurrentAddress(updated);
    setPinLocationName(fullStreet);
  };

  // Geolocation trigger ("Use Current Location")
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocateError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));
        setPinCoordinates([lng, lat]);
        setIsLocating(false);

        // Approximate friendly local address name
        const resolvedName = `Current Location (${lat}°N, ${lng}°E)`;
        setPinLocationName(resolvedName);
        setStreetArea(`Near GPS Location [${lat}, ${lng}]`);
        setHouseNo('Device Pin');

        const updated: DeliveryAddressData = {
          title: 'Current Location',
          street: `Near GPS Location [${lat}°N, ${lng}°E]`,
          city: city || 'Chennai',
          pincode: pincode || '600001',
          coordinates: [lng, lat],
        };
        setCurrentAddress(updated);
      },
      (err) => {
        setIsLocating(false);
        setLocateError('Could not fetch GPS. Please click on the map or type address.');
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Click on interactive map canvas to place pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    // Map ratios to bounding box around Chennai / Metro coordinates
    // Lat range ~12.90 to 13.15, Lng range ~80.15 to 80.30
    const lat = Number((13.15 - yRatio * 0.25).toFixed(4));
    const lng = Number((80.15 + xRatio * 0.15).toFixed(4));

    setPinCoordinates([lng, lat]);

    // Match nearest locality or create dynamic label
    let nearestArea = 'Pinpoint Delivery Spot';
    let matchedCity = 'Chennai';
    let matchedPincode = '600028';

    if (lat > 13.06) {
      nearestArea = 'Central Chennai / Nungambakkam';
      matchedPincode = '600034';
    } else if (lat > 13.02) {
      nearestArea = 'Mylapore / Alwarpet / R.A. Puram';
      matchedPincode = '600004';
    } else if (lat > 12.98) {
      nearestArea = 'Adyar / Besant Nagar Beach';
      matchedPincode = '600020';
    } else {
      nearestArea = 'OMR IT Corridor / Thoraipakkam';
      matchedPincode = '600096';
    }

    const placeLabel = `Pinned at ${nearestArea}`;
    setPinLocationName(placeLabel);
    setStreetArea(placeLabel);

    const updated: DeliveryAddressData = {
      title: 'Pinned on Map',
      street: placeLabel,
      area: nearestArea,
      city: matchedCity,
      pincode: matchedPincode,
      coordinates: [lng, lat],
    };
    setCurrentAddress(updated);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('TYPE')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'TYPE'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Type & Search</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MAP')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'MAP'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Select on Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SAVED')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'SAVED'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({defaultSaved.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: TYPE & SEARCH ================= */}
      {activeTab === 'TYPE' && (
        <div className="space-y-3">
          {/* Live Search Bar with Autocomplete Suggestions */}
          <div ref={searchBoxRef} className="relative">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Search Street, Area, Landmark or Pincode:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Type e.g. Marina Beach, OMR, Nungambakkam, T. Nagar..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-56 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Suggested Locations ({filteredSuggestions.length})</span>
                  <span>Click to Autofill</span>
                </div>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-2.5 text-xs group"
                    >
                      <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white group-hover:text-brand-300 truncate">
                            {s.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-brand-400 font-semibold flex-shrink-0">
                            {s.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {s.area}, {s.city} - {s.pincode}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching location. You can fill the fields below manually.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Structured Address Form Fields */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Complete Delivery Details</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Flat / House No / Floor
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => {
                    setHouseNo(e.target.value);
                    const fullStreet = e.target.value ? `${e.target.value}, ${streetArea}` : streetArea;
                    setCurrentAddress((prev) => ({ ...prev, street: fullStreet }));
                  }}
                  placeholder="e.g. Flat 402, 4th Floor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Street / Area / Landmark
                </label>
                <input
                  type="text"
                  value={streetArea}
                  onChange={(e) => {
                    setStreetArea(e.target.value);
                    const fullStreet = houseNo ? `${houseNo}, ${e.target.value}` : e.target.value;
                    setCurrentAddress((prev) => ({ ...prev, street: fullStreet }));
                  }}
                  placeholder="e.g. 42 Marina Bay View, Near Light House"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCurrentAddress((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setCurrentAddress((prev) => ({ ...prev, pincode: e.target.value }));
                  }}
                  placeholder="Pincode"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Address Tag Selector */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Save As:</span>
                {[
                  { tag: 'Home', icon: Home },
                  { tag: 'Office', icon: Briefcase },
                  { tag: 'Other', icon: Building2 },
                ].map(({ tag, icon: Icon }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setAddressTitle(tag);
                      setCurrentAddress((prev) => ({ ...prev, title: tag }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                      addressTitle === tag
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleApplyTypedAddress()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Address</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SELECT ON MAP ================= */}
      {activeTab === 'MAP' && (
        <div className="space-y-3">
          {/* Top Bar: Geolocation & Info */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Crosshair className="w-3.5 h-3.5 text-brand-400" />
              <span>Click anywhere on the map grid to position your delivery pin</span>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Navigation className={`w-3.5 h-3.5 text-brand-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
            </button>
          </div>

          {locateError && (
            <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
              {locateError}
            </p>
          )}

          {/* Interactive Stylized Cartographic Map Canvas */}
          <div
            onClick={handleMapClick}
            className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-700 bg-[#0c1322] cursor-crosshair select-none shadow-inner group"
          >
            {/* SVG Background Grid & Stylized Urban Features */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
                <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* Bay of Bengal / Coastline representation */}
              <path
                d="M 280,0 Q 260,100 290,200 T 270,400 L 400,400 L 400,0 Z"
                fill="url(#ocean-gradient)"
                opacity="0.6"
              />

              {/* Major Roads / Arterial Highways */}
              <path d="M 0,90 Q 150,80 300,120" stroke="#334155" strokeWidth="6" fill="none" />
              <path d="M 0,90 Q 150,80 300,120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />

              <path d="M 120,0 Q 140,150 160,350" stroke="#334155" strokeWidth="5" fill="none" />
              <path d="M 120,0 Q 140,150 160,350" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="8 4" fill="none" />

              <path d="M 0,220 L 300,200" stroke="#334155" strokeWidth="4" fill="none" />

              {/* Park green zone */}
              <circle cx="80" cy="160" r="35" fill="#065f46" opacity="0.3" />
              <text x="65" y="165" fill="#34d399" fontSize="9" opacity="0.8">Park</text>

              {/* Landmark text indicators */}
              <text x="210" y="45" fill="#94a3b8" fontSize="10" fontWeight="bold">Central</text>
              <text x="230" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold">Marina</text>
              <text x="40" y="240" fill="#94a3b8" fontSize="10" fontWeight="bold">OMR Hub</text>
              <text x="320" y="180" fill="#60a5fa" fontSize="9" fontWeight="bold">Bay</text>
            </svg>

            {/* Dynamic Map Pin (Positioned relative to coordinates or click) */}
            <div
              className="absolute pointer-events-none transition-all duration-300 -translate-x-1/2 -translate-y-full"
              style={{
                left: `${Math.min(90, Math.max(10, ((pinCoordinates[0] - 80.15) / 0.15) * 100))}%`,
                top: `${Math.min(85, Math.max(15, ((13.15 - pinCoordinates[1]) / 0.25) * 100))}%`,
              }}
            >
              {/* Pulsing Ripple Effect */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500/30 animate-ping" />
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-500/60 shadow-lg shadow-brand-500/50" />

              {/* Pin Icon Bubble */}
              <div className="relative flex flex-col items-center">
                <div className="px-2.5 py-1 rounded-full bg-brand-500 text-white font-extrabold text-[10px] shadow-2xl flex items-center gap-1 whitespace-nowrap border border-white/20 animate-bounce">
                  <MapPin className="w-3 h-3" />
                  <span>Deliver Here</span>
                </div>
                <div className="w-2 h-2 bg-brand-500 rotate-45 -mt-1" />
              </div>
            </div>

            {/* Map Controls Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
              <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 font-mono">
                {pinCoordinates[1]}° N, {pinCoordinates[0]}° E
              </span>
            </div>

            {/* Click to move banner */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span className="font-bold text-white truncate">{pinLocationName}</span>
                </div>
                <span className="text-[10px] text-brand-400 font-semibold uppercase flex-shrink-0 pl-2">
                  Pin Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons for Top Localities */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Landmark Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🏖️ Marina Beach', coords: [80.2824, 13.0499], name: 'Marina Beach Road, Chennai' },
                { label: '🏢 OMR Tech Corridor', coords: [80.2452, 12.9698], name: 'OMR IT Park, Perungudi' },
                { label: '🍽️ Nungambakkam', coords: [80.2435, 13.0604], name: 'Khader Nawaz Khan Rd, Nungambakkam' },
                { label: '🛍️ T. Nagar', coords: [80.2341, 13.0418], name: 'Panagal Park, T. Nagar' },
                { label: '🌊 Besant Nagar', coords: [80.2668, 13.0002], name: 'Elliot Beach Road, Besant Nagar' },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPinCoordinates(p.coords as [number, number]);
                    setPinLocationName(p.name);
                    setStreetArea(p.name);
                    setCurrentAddress({
                      title: 'Preset Landmark',
                      street: p.name,
                      city: 'Chennai',
                      pincode: '600004',
                      coordinates: p.coords as [number, number],
                    });
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SAVED ADDRESSES ================= */}
      {activeTab === 'SAVED' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {defaultSaved.map((addr, idx) => {
            const isSelected =
              currentAddress.street === addr.street && currentAddress.pincode === addr.pincode;
            return (
              <button
                key={addr.id || idx}
                type="button"
                onClick={() => {
                  setCurrentAddress(addr);
                  if (addr.coordinates) setPinCoordinates(addr.coordinates);
                  setPinLocationName(addr.street);
                  setStreetArea(addr.street);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    {addr.title === 'Home' ? (
                      <Home className="w-3.5 h-3.5 text-brand-400" />
                    ) : addr.title === 'Office' ? (
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{addr.title}</span>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-medium">{addr.street}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {addr.area ? `${addr.area}, ` : ''}
                  {addr.city} - {addr.pincode}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Drop-Off Instructions & Driver Preferences */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛵</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Drop-Off Instructions & Preferences
            </span>
          </div>
          <span className="text-[10px] text-brand-400 font-semibold bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
            {dropoffPills.length} selected
          </span>
        </div>

        {/* Preset Instruction Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { id: 'door', label: 'Leave at Door', icon: '🚪' },
            { id: 'nobell', label: 'Do Not Ring Bell', icon: '🔕' },
            { id: 'pet', label: 'Beware of Pet', icon: '🐾' },
            { id: 'call', label: 'Call Upon Arrival', icon: '📞' },
            { id: 'security', label: 'Leave with Security', icon: '🏢' },
            { id: 'elevator', label: 'Elevator Available', icon: '🛗' },
          ].map((pill) => {
            const isSelected = dropoffPills.includes(pill.label);
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => toggleDropoffPill(pill.label)}
                className={`px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/40 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-sm">{pill.icon}</span>
                <span className="text-[11px] truncate">{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Driver Notes Input */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Special instructions for delivery partner:</span>
            <span>{riderNotes.length}/140</span>
          </div>
          <input
            type="text"
            maxLength={140}
            placeholder="e.g. Leave package on shoe rack, call once outside gate #2"
            value={riderNotes}
            onChange={(e) => setRiderNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Selected Address Confirmation Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-brand-500/40 shadow-lg text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Delivering To: {currentAddress.title}</span>
          </div>
          <span className="text-[10px] font-mono text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
            Pincode: {currentAddress.pincode || '600004'}
          </span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed pl-5 font-medium">
          {currentAddress.street}, {currentAddress.city} - {currentAddress.pincode}
        </p>

        {/* Active Instruction Badges */}
        {(dropoffPills.length > 0 || riderNotes) && (
          <div className="pl-5 pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
            {dropoffPills.map((pill) => (
              <span
                key={pill}
                className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold"
              >
                ✓ {pill}
              </span>
            ))}
            {riderNotes && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 italic truncate max-w-[220px]">
                Note: "{riderNotes}"
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
