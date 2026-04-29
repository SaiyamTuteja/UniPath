import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useMap } from "../../context/MapContext";
import { useAuth } from "../../context/AuthContext";

import FloorSelector from "./FloorSelector";
import NavigationPanel from "./NavigationPanel";
import RoomLayer from "./RoomLayer";
import RouteDrawer from "./RouteDrawer";
import LoadingScreen from "../ui/LoadingScreen";
import ProfilePanel from "../ui/ProfilePanel";

// ── Real GEHU coordinates (from original Navit source) ─────────────────
const CAMPUS_CENTER = [30.2734504, 77.9997427]; // Navit original campus center
const DEFAULT_ZOOM = 19;

// ── Header icon button component ─────────────────────────────────────────
const IconBtn = ({ title, href, onClick, children }) => {
  const base = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(20,184,166,0.12)",
    border: "1px solid rgba(20,184,166,0.25)",
    color: "#5eead4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 13,
    textDecoration: "none",
    flexShrink: 0,
    transition: "all 0.2s",
  };
  if (href)
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={base}
        title={title}
      >
        {children}
      </a>
    );
  return (
    <button style={base} onClick={onClick} title={title}>
      {children}
    </button>
  );
};

// ── QR Scanner using html5-qrcode ────────────────────────────────────────
function QRScannerView({ onScan }) {
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let scanner;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        scanner = new Html5Qrcode("qr-reader-el");
        scannerInstance.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // Parse room ID from QR text
            let roomId = decodedText;
            try {
              const url = new URL(decodedText);
              roomId =
                url.searchParams.get("source") ||
                url.searchParams.get("room") ||
                decodedText;
            } catch {}
            onScan(roomId);
          },
          () => {},
        );
      } catch (err) {
        setError("Camera access denied or not available");
      }
    };
    startScanner();
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div>
      <div
        id="qr-reader-el"
        ref={scannerRef}
        style={{
          width: "100%",
          borderRadius: 10,
          overflow: "hidden",
          background: "#000",
        }}
      />
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            fontSize: 12,
            color: "#f87171",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      <p
        style={{
          fontSize: 11,
          color: "#475569",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Point at a UniPath room QR code
      </p>
    </div>
  );
}

export default function CampusMap() {
  const {
    activeFloor,
    setActiveFloor,
    currentPath,
    source,
    setSource,
    destination,
    setDestination,
    loading,
    globalLoading,
    timeslotLabel,
    fetchGeoJSON,
    floorMap,
    roomStatusMap,
  } = useMap();
  const { user } = useAuth();

  const [coordinates, setCoordinates] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setCoordinates([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // URL param support (QR codes)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const src = url.searchParams.get("source");
      const des = url.searchParams.get("destination");
      if (src) setSource(src);
      if (des) setDestination(des);
    } catch {}
  }, []);

  if (globalLoading) return <LoadingScreen />;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }}
      />

      {/* ── MAP ────────────────────────────────────────────────────── */}
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={2}
        maxZoom={22}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100vh", width: "100%", background: "#e8f0ec" }}
        id="campus-map"
      >
        {/* OpenStreetMap — light tile as specified */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          maxZoom={22}
          maxNativeZoom={19}
        />

        {/* Per-floor room polygons — from live Navit API */}
        <RoomLayer
          activeFloor={activeFloor}
          floorMap={floorMap}
          onRoomClick={(props) => setSelectedRoom(props)}
        />

        {/* Animated route */}
        {currentPath && currentPath.segments?.length > 0 && (
          <RouteDrawer routeData={currentPath} activeFloor={activeFloor} />
        )}

        {/* GPS dot */}
        {coordinates && (
          <Circle
            center={coordinates}
            radius={5}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        )}

        {/* ── ROOM INFO CARD (Popup) ──────────────────────────────────── */}
        {selectedRoom && selectedRoom.center && (
          <Popup
            position={selectedRoom.center}
            onClose={() => setSelectedRoom(null)}
            className="room-popup"
          >
            <div
              style={{
                minWidth: "200px",
                background:
                  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                borderRadius: "10px",
                padding: "14px",
                color: "white",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {/* Room name */}
              <div
                style={{
                  fontWeight: "800",
                  fontSize: "15px",
                  color: "#ffffff",
                  marginBottom: "6px",
                  lineHeight: 1.3,
                }}
              >
                {selectedRoom.name}
              </div>

              {/* Type + Floor badge */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#e2e8f0",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {selectedRoom.inferredType?.replace(/_/g, " ") || "Room"}
                </span>
                <span
                  style={{
                    background: "rgba(20,184,166,0.3)",
                    color: "#5eead4",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Floor {selectedRoom.floor ?? activeFloor}
                </span>
              </div>

              {/* Occupancy status */}
              {(() => {
                const statusData = roomStatusMap?.[selectedRoom.name];
                if (!statusData) return null;
                const isAvailable = statusData.status === "available";
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "10px",
                      fontSize: "12px",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isAvailable ? "#10B981" : "#EF4444",
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${isAvailable ? "#10B981" : "#EF4444"}`,
                      }}
                    />
                    <span
                      style={{
                        color: isAvailable ? "#6ee7b7" : "#fca5a5",
                        fontWeight: 600,
                      }}
                    >
                      {isAvailable ? "Available" : "In Session"}
                    </span>
                    {statusData.occupancy !== undefined && (
                      <span style={{ color: "#94a3b8" }}>
                        • {statusData.occupancy}% Full
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Capacity */}
              {selectedRoom.capacity > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "10px",
                  }}
                >
                  Capacity: {selectedRoom.capacity} seats
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setSource(selectedRoom.room_id);
                    setSelectedRoom(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                  }
                >
                  📍 Set Start
                </button>
                <button
                  onClick={() => {
                    setDestination(selectedRoom.room_id);
                    setSelectedRoom(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    background: "linear-gradient(135deg, #1a6b6b, #5bbfbf)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  🏁 Set Dest
                </button>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* ══ PREMIUM DARK HEADER ══════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          zIndex: 1000,
          background:
            "linear-gradient(135deg, rgba(5,15,30,0.97), rgba(8,22,42,0.97))",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(20,184,166,0.15)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Animated Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0d9488, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(13,148,136,0.4)",
              animation: "logoGlow 3s ease-in-out infinite",
            }}
          >
            <img src="/logo.png" alt="UniPath Logo" className="w-20 h-18" />
            {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg> */}
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 17,
              background: "linear-gradient(90deg, #5eead4, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            UniPath
          </span>
        </motion.div>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { to: "/map", label: "🗺️ Map" },
            { to: "/events", label: "📅 Events" },
            { to: "/lost-found", label: "🔍 L&F" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                color: window.location.pathname === to ? "#5eead4" : "#64748b",
                background:
                  window.location.pathname === to
                    ? "rgba(20,184,166,0.1)"
                    : "transparent",
                border:
                  window.location.pathname === to
                    ? "1px solid rgba(20,184,166,0.3)"
                    : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Status badge */}
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 20,
            background:
              timeslotLabel === "Closed"
                ? "rgba(100,116,139,0.15)"
                : "rgba(16,185,129,0.15)",
            color: timeslotLabel === "Closed" ? "#94a3b8" : "#34d399",
            border: `1px solid ${timeslotLabel === "Closed" ? "rgba(100,116,139,0.3)" : "rgba(16,185,129,0.4)"}`,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: timeslotLabel === "Closed" ? "#94a3b8" : "#34d399",
              display: "inline-block",
            }}
          />
          {timeslotLabel}
        </motion.span>

        {/* Icon buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconBtn
            href="https://github.com/SaiyamTuteja/uni_path_"
            title="GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#5eead4">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </IconBtn>
          <IconBtn
            onClick={() => {
              fetchGeoJSON();
            }}
            title="Refresh Map"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5eead4"
              strokeWidth="2.5"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconBtn>
          <IconBtn
            onClick={() =>
              toast(
                "UniPath — Campus Navigator\nSelect floor ▸ Choose Start & Destination ▸ Tap Go!",
                { icon: "🗺️", duration: 4000 },
              )
            }
            title="Help"
          >
            <span style={{ fontWeight: 900, fontSize: 13, color: "#5eead4" }}>
              ?
            </span>
          </IconBtn>

          {/* Profile button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfile((p) => !p)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: user?.isGuest
                ? "rgba(100,116,139,0.2)"
                : "linear-gradient(135deg, #0d9488, #2563eb)",
              border: "2px solid rgba(20,184,166,0.4)",
              color: "white",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: showProfile ? "0 0 12px rgba(13,148,136,0.5)" : "none",
            }}
          >
            {user?.isGuest ? "👤" : user?.firstName?.[0] || "?"}
          </motion.button>
        </div>
      </div>

      {/* ── FLOOR SELECTOR ─────────────────────────────────────────── */}
      <FloorSelector />

      {/* ── BOTTOM NAV BAR ─────────────────────────────────────────── */}
      <NavigationPanel setShowScanner={setShowScanner} />

      {/* ── PROFILE PANEL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
      </AnimatePresence>

      {/* ══ QR SCANNER OVERLAY (html5-qrcode) ═══════════════════════ */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowScanner(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              style={{
                background: "linear-gradient(135deg, #0a1628, #0d2137)",
                borderRadius: 20,
                padding: 24,
                width: 320,
                border: "1px solid rgba(20,184,166,0.3)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "#f1f5f9",
                      fontWeight: 800,
                      fontSize: 16,
                      margin: 0,
                    }}
                  >
                    📱 QR Scanner
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      margin: "2px 0 0",
                    }}
                  >
                    Scan a room's QR code to set source
                  </p>
                </div>
                <button
                  onClick={() => setShowScanner(false)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#64748b",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
              <QRScannerView
                onScan={(roomId) => {
                  setSource(roomId);
                  setShowScanner(false);
                  toast.success(`📍 Source set: ${roomId}`);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && !globalLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed",
            top: 60,
            right: 12,
            zIndex: 2000,
            background: "rgba(10,22,40,0.95)",
            border: "1px solid rgba(20,184,166,0.3)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#5eead4",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid rgba(20,184,166,0.2)",
              borderTop: "2px solid #14b8a6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Calculating route…
        </motion.div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes logoGlow { 0%,100%{box-shadow:0 0 12px rgba(13,148,136,0.4)} 50%{box-shadow:0 0 22px rgba(13,148,136,0.7)} }
        .rl { font-size:10px; font-family:sans-serif; color:#111; white-space:nowrap; pointer-events:none; }
        select optgroup { background:#0d1f33; color:#5eead4; font-weight:700; }
        select option { background:#0a1628; color:#e2e8f0; }
      `}</style>
    </div>
  );
}
