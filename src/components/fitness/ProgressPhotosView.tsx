"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { Camera, Image as ImageIcon, Trash2, Calendar, Split } from "lucide-react";

export interface ProgressPhoto {
  id: string;
  type: "front" | "side" | "back";
  data: string; // Base64 data url
  date: string;
}

export default function ProgressPhotosView() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  // Form states
  const [photoType, setPhotoType] = useState<ProgressPhoto["type"]>("front");
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split("T")[0]);

  // Comparison states
  const [compareType, setCompareType] = useState<ProgressPhoto["type"]>("front");
  const [compareIdA, setCompareIdA] = useState("");
  const [compareIdB, setCompareIdB] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("atlas.fitness.photos");
    if (stored) setPhotos(JSON.parse(stored));
  }, []);

  const savePhotos = (data: ProgressPhoto[]) => {
    setPhotos(data);
    localStorage.setItem("atlas.fitness.photos", JSON.stringify(data));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (!base64) return;

      const newPhoto: ProgressPhoto = {
        id: `photo-${Date.now()}`,
        type: photoType,
        data: base64,
        date: photoDate
      };

      const next = [newPhoto, ...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      savePhotos(next);

      // RPG Progression
      addXP(50, `Logged progress photo check-in: ${photoType}`);
      gainStatPoints({ discipline: 2, confidence: 2 });

      alert(`Photo logged! +50 XP, +2 Confidence.`);
      e.target.value = ""; // clear input
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id: string) => {
    savePhotos(photos.filter((p) => p.id !== id));
    if (compareIdA === id) setCompareIdA("");
    if (compareIdB === id) setCompareIdB("");
  };

  const filteredPhotosForCompare = photos.filter((p) => p.type === compareType);
  const photoA = filteredPhotosForCompare.find((p) => p.id === compareIdA);
  const photoB = filteredPhotosForCompare.find((p) => p.id === compareIdB);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Compare mode & Timeline */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Compare Mode Panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-900 pb-4 gap-4">
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <Split className="w-4 h-4 text-violet-400" /> Compare Mode
            </h3>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Pose:</span>
              <select
                value={compareType}
                onChange={(e) => {
                  setCompareType(e.target.value as any);
                  setCompareIdA("");
                  setCompareIdB("");
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none text-zinc-400"
              >
                <option value="front">Front Pose</option>
                <option value="side">Side Pose</option>
                <option value="back">Back Pose</option>
              </select>
            </div>
          </div>

          {/* Selectors dropdowns */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Check-In Date A</label>
              <select
                value={compareIdA}
                onChange={(e) => setCompareIdA(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
              >
                <option value="">Select Date</option>
                {filteredPhotosForCompare.map((p) => (
                  <option key={p.id} value={p.id}>{p.date}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Check-In Date B</label>
              <select
                value={compareIdB}
                onChange={(e) => setCompareIdB(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
              >
                <option value="">Select Date</option>
                {filteredPhotosForCompare.map((p) => (
                  <option key={p.id} value={p.id}>{p.date}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compare images layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="aspect-[3/4] bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative">
              {photoA ? (
                <img src={photoA.data} alt={`Check-in ${photoA.date}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-mono text-zinc-600">Select baseline check-in</span>
              )}
              {photoA && <span className="absolute bottom-2.5 left-2.5 text-[9px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded">{photoA.date}</span>}
            </div>

            <div className="aspect-[3/4] bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative">
              {photoB ? (
                <img src={photoB.data} alt={`Check-in ${photoB.date}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-mono text-zinc-600">Select target check-in</span>
              )}
              {photoB && <span className="absolute bottom-2.5 left-2.5 text-[9px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded">{photoB.date}</span>}
            </div>
          </div>
        </div>

        {/* Timeline Gallery List */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
            Chronological Photo Timeline
          </span>

          {photos.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-600">
              No progress photos registered. Use the panel on the right to upload.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {photos.map((p) => (
                <div key={p.id} className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden group relative flex flex-col justify-between">
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute top-2 right-2 p-1 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <img src={p.data} alt={`Pose ${p.type}`} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-900 flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-400 capitalize">{p.type}</span>
                    <span className="text-zinc-500">{p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Col: Add progress photo check-in form */}
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
        <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4 font-mono">
          Upload Progress Photo
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Pose View</label>
            <select
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value as any)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
            >
              <option value="front">Front View</option>
              <option value="side">Side View</option>
              <option value="back">Back View</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Check-in Date</label>
            <input
              type="date"
              value={photoDate}
              onChange={(e) => setPhotoDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
            />
          </div>

          <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <Camera className="w-6 h-6 text-zinc-500 mx-auto group-hover:text-zinc-300 transition-colors" />
              <span className="text-[10px] font-mono text-zinc-400 block">Select image from file system</span>
              <span className="text-[8px] text-zinc-600 block">Converts to local Base64 URL data</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
