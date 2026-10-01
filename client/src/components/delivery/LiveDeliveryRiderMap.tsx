import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Gauge,
  Compass,
  CheckCircle2,
  Sparkles,
  Store,
  Home,
  MessageSquare,
} from 'lucide-react';

interface LiveDeliveryRiderMapProps {
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryAddress?: {
    title?: string;
    street?: string;
    area?: string;
    city?: string;
    pincode?: string;
    coordinates?: [number, number];
    dropoffPills?: string[];
    riderNotes?: string;
  };
  orderStatus?: string;
  deliveryOtp?: string;
}

// 4-Point Waypoint Road Curve Coordinates for the SVG Map
const WAYPOINTS = [
  { x: 70, y: 240, label: 'Restaurant Hub' },
  { x: 210, y: 90, label: 'Anna Flyover Jct' },
  { x: 370, y: 250, label: 'Cathedral Rd Crossing' },
  { x: 530, y: 100, label: 'Customer Doorstep' },
];

/**
 * Computes coordinates and rotation angle along the piecewise cubic/quadratic path.
 */
function getPositionOnRoute(t: number): { x: number; y: number; angle: number } {
  // t is 0.0 to 1.0
  const clampedT = Math.max(0, Math.min(1, t));

  // 3 segments
  const numSegments = 3;
  const segIndex = Math.min(Math.floor(clampedT * numSegments), numSegments - 1);
  const localT = (clampedT - segIndex / numSegments) * numSegments;

  const p0 = WAYPOINTS[segIndex];
  const p1 = WAYPOINTS[segIndex + 1];

  // Control point for a natural street curve
  const midX = (p0.x + p1.x) / 2;
  const midY = (p0.y + p1.y) / 2 + (segIndex % 2 === 0 ? -35 : 35);

  // Quadratic Bezier Formula
  const oneMinusT = 1 - localT;
  const x =
    oneMinusT * oneMinusT * p0.x +
    2 * oneMinusT * localT * midX +
    localT * localT * p1.x;
  const y =
    oneMinusT * oneMinusT * p0.y +
    2 * oneMinusT * localT * midY +
    localT * localT * p1.y;

  // Tangent derivative for angle of bike
  const dx = 2 * oneMinusT * (midX - p0.x) + 2 * localT * (p1.x - midX);
  const dy = 2 * oneMinusT * (midY - p0.y) + 2 * localT * (p1.y - midY);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, angle };
}

export const LiveDeliveryRiderMap: React.FC<LiveDeliveryRiderMapProps> = ({
  restaurantName = 'The Royal Nawabi Kitchen',
  restaurantAddress = '14 Khader Nawaz Khan Rd, Nungambakkam',
  deliveryAddress,
  orderStatus = 'OUT_FOR_DELIVERY',
  deliveryOtp = '4829',
}) => {
  // Simulation Progress (0 to 100)
  const [progress, setProgress] = useState(48);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(31);
  const [callingDriver, setCallingDriver] = useState(false);

  // Resolve address details
  const fallbackAddress = {
    title: 'Home',
    street: '42 Marina Bay View',
    area: 'Mylapore',
    city: 'Chennai',
    pincode: '600004',
    dropoffPills: ['Leave at door', 'Do not ring bell'],
    riderNotes: 'Leave on shoe rack outside front door.',
  };

  const activeAddress = {
    title: deliveryAddress?.title || fallbackAddress.title,
    street: deliveryAddress?.street || fallbackAddress.street,
    area: deliveryAddress?.area || fallbackAddress.area,
    city: deliveryAddress?.city || fallbackAddress.city,
    pincode: deliveryAddress?.pincode || fallbackAddress.pincode,
    dropoffPills:
      deliveryAddress?.dropoffPills && deliveryAddress.dropoffPills.length > 0
        ? deliveryAddress.dropoffPills
        : fallbackAddress.dropoffPills,
    riderNotes: deliveryAddress?.riderNotes || fallbackAddress.riderNotes,
  };

  // Simulation timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99.5) {
          return 99.5; // Arrived
        }
        const delta = 0.45 * simSpeed;
        return Math.min(99.5, prev + delta);
      });

      // Realistic speed fluctuation
      setCurrentSpeedKmh((prev) => {
        const jitter = (Math.random() - 0.5) * 4;
        return Math.max(18, Math.min(42, Math.round(prev + jitter)));
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  const normT = progress / 100;
  const riderPos = getPositionOnRoute(normT);

  // Telemetry Calculations
  const totalDistanceKm = 3.6;
  const distanceRemainingKm = Math.max(
    0.1,
    Number((totalDistanceKm * (1 - normT)).toFixed(1))
  );
  const totalEstMinutes = 14;
  const minutesRemaining = Math.max(
    1,
    Math.round(totalEstMinutes * (1 - normT))
  );

  return (
    <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden space-y-0">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-brand-400" />
                <span>Live GPS Delivery Tracking</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Satellite Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Rider is en route to your location with temperature-controlled insulated container.
            </p>
          </div>
        </div>

        {/* Playback Simulation Controls */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 2.5 : 1)}
            className={`px-2 py-1 rounded-lg font-mono font-bold transition text-[11px] ${
              simSpeed > 1
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Fast-Forward"
          >
            {simSpeed > 1 ? '2.5x ⚡' : '1x'}
          </button>

          <button
            onClick={() => {
              setProgress(10);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stylized Dark GPS Map Canvas View */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-950 overflow-hidden select-none border-b border-slate-800/80">
        {/* Map Grid Matrix Lines Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>

        {/* Ambient Map City Landmarks */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-10 left-1/4 w-28 h-16 rounded-xl border border-slate-700/60 bg-slate-900/40" />
          <div className="absolute top-28 right-1/4 w-32 h-20 rounded-xl border border-slate-700/60 bg-slate-900/40" />
          <div className="absolute bottom-8 left-1/3 w-36 h-14 rounded-xl border border-slate-700/60 bg-slate-900/40" />
          <span className="absolute top-6 left-1/3 text-[9px] font-mono tracking-widest text-slate-600 uppercase">
            Anna Salai Expressway
          </span>
          <span className="absolute bottom-10 right-1/3 text-[9px] font-mono tracking-widest text-slate-600 uppercase">
            Cathedral Cross Road
          </span>
        </div>

        {/* SVG Route Paths and Markers */}
        <svg
          viewBox="0 0 600 340"
          className="w-full h-full object-contain filter drop-shadow-lg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pulsing glow gradient */}
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Underlying Road Base (Dark Charcoal Asphalt) */}
          <path
            d="M 70 240 Q 140 165 210 90 Q 290 170 370 250 Q 450 175 530 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Road Outline Borders */}
          <path
            d="M 70 240 Q 140 165 210 90 Q 290 170 370 250 Q 450 175 530 100"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Neon Active Route Track with Glowing Pulse */}
          <path
            d="M 70 240 Q 140 165 210 90 Q 290 170 370 250 Q 450 175 530 100"
            fill="none"
            stroke="url(#routeGlow)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-pulse"
            filter="url(#neonBlur)"
          />

          {/* Waypoint 1: Restaurant Origin Pin */}
          <g transform="translate(70, 240)">
            <circle r="18" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
            <circle r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
            <circle r="6" fill="#f59e0b" />
          </g>

          {/* Waypoint 4: Customer Destination Pin */}
          <g transform="translate(530, 100)">
            <circle r="20" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
            <circle r="15" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
            <circle r="6" fill="#10b981" />
          </g>

          {/* Moving Rider Motorbike Position on Canvas */}
          <g
            transform={`translate(${riderPos.x}, ${riderPos.y})`}
            className="transition-transform duration-200"
          >
            {/* Radar expansion rings */}
            <circle r="22" fill="#f97316" fillOpacity="0.2" className="animate-ping" />
            <circle r="16" fill="#f97316" fillOpacity="0.4" />
            <circle r="13" fill="#0f172a" stroke="#f97316" strokeWidth="2.5" />

            {/* Rotated Bike Icon */}
            <g transform={`rotate(${riderPos.angle})`}>
              <circle r="5" fill="#ea580c" />
              <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </g>
        </svg>

        {/* Overlay Badges on Map Canvas */}
        {/* Origin Label (Restaurant) */}
        <div className="absolute bottom-4 left-4 p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md text-[11px] shadow-lg max-w-[200px]">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Store className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{restaurantName}</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">{restaurantAddress}</span>
        </div>

        {/* Destination Label (Customer Home) */}
        <div className="absolute top-4 right-4 p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 backdrop-blur-md text-[11px] shadow-lg max-w-[220px]">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Home className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Delivering To: {activeAddress.title}</span>
          </div>
          <p className="text-[10px] text-slate-300 truncate mt-0.5">
            {activeAddress.street}, {activeAddress.city}
          </p>
        </div>

        {/* Moving Telemetry HUD floating pill */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-xl text-xs">
          <div className="flex items-center gap-1 text-slate-300 font-mono">
            <Gauge className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-bold text-white">{currentSpeedKmh}</span>
            <span className="text-[10px] text-slate-400">km/h</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300 font-mono">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{distanceRemainingKm}</span>
            <span className="text-[10px] text-slate-400">km left</span>
          </div>
        </div>
      </div>

      {/* Live Progress Bar & Telemetry Details */}
      <div className="p-5 sm:p-6 bg-slate-900/60 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Estimated Arrival:</span>
              <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 font-mono font-extrabold text-sm border border-brand-500/30">
                ~{minutesRemaining} mins
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {progress.toFixed(0)}% Distance Covered
            </span>
          </div>

          {/* Progress Bar with neon gradient */}
          <div className="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-brand-500 to-emerald-400 transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Assigned Rider & Drop-off Instructions Double Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Driver Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-white text-base">
                    RK
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm">Ramesh Kumar</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    ★ 4.9 (1,240)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Electric Bike • TN-09-BK-4829</p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Insulated Thermal Bag Verified
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setCallingDriver(true);
                  setTimeout(() => setCallingDriver(false), 3500);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition border border-slate-700 active:scale-95"
              >
                <Phone className="w-3 h-3 text-brand-400" />
                <span>Call</span>
              </button>
            </div>
          </div>

          {/* Active Drop-off Instructions & Security OTP */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Doorstep Drop-off Instructions:
              </span>
              {deliveryOtp && (
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  OTP: {deliveryOtp}
                </span>
              )}
            </div>

            {/* Display Selected Pills */}
            <div className="flex flex-wrap gap-1.5">
              {activeAddress.dropoffPills.map((pill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>✓</span>
                  <span>{pill}</span>
                </span>
              ))}
            </div>

            {/* Display Custom Rider Notes */}
            {activeAddress.riderNotes && (
              <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 mt-1 leading-relaxed">
                "{activeAddress.riderNotes}"
              </p>
            )}
          </div>
        </div>

        {/* Calling Modal Simulation Toast */}
        {callingDriver && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 animate-bounce text-emerald-400" />
              <span>Connecting encrypted rider call to <strong>Ramesh Kumar (+91 98402 11234)</strong>...</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ringing</span>
          </div>
        )}
      </div>
    </div>
  );
};
