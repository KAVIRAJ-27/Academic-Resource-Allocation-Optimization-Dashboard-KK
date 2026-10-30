import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { Layers, Hotel, DoorOpen, Bed, Users, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

interface BlockFloorData {
  floorNumber: number;
  roomsCount: number;
  totalBeds: number;
  occupiedBeds: number;
  fireSafetyStatus: 'VERIFIED' | 'INSPECTION_DUE';
  activeRooms: string[];
}

interface BlockData {
  id: number;
  hostelName: string;
  blockName: string;
  floorsCount: number;
  totalRooms: number;
  floors: BlockFloorData[];
}

const DEFAULT_BLOCKS: BlockData[] = [
  {
    id: 1,
    hostelName: 'VSB Residence 1',
    blockName: 'North Block (Wing A)',
    floorsCount: 4,
    totalRooms: 20,
    floors: [
      { floorNumber: 1, roomsCount: 5, totalBeds: 15, occupiedBeds: 14, fireSafetyStatus: 'VERIFIED', activeRooms: ['101', '102', '103', '104', '105'] },
      { floorNumber: 2, roomsCount: 5, totalBeds: 15, occupiedBeds: 13, fireSafetyStatus: 'VERIFIED', activeRooms: ['201', '202', '203', '204', '205'] },
      { floorNumber: 3, roomsCount: 5, totalBeds: 15, occupiedBeds: 12, fireSafetyStatus: 'VERIFIED', activeRooms: ['301', '302', '303', '304', '305'] },
      { floorNumber: 4, roomsCount: 5, totalBeds: 15, occupiedBeds: 11, fireSafetyStatus: 'VERIFIED', activeRooms: ['401', '402', '403', '404', '405'] },
    ],
  },
  {
    id: 2,
    hostelName: 'VSB Residence 1',
    blockName: 'North Block (Wing B)',
    floorsCount: 4,
    totalRooms: 20,
    floors: [
      { floorNumber: 1, roomsCount: 5, totalBeds: 15, occupiedBeds: 15, fireSafetyStatus: 'VERIFIED', activeRooms: ['106', '107', '108', '109', '110'] },
      { floorNumber: 2, roomsCount: 5, totalBeds: 15, occupiedBeds: 14, fireSafetyStatus: 'VERIFIED', activeRooms: ['206', '207', '208', '209', '210'] },
      { floorNumber: 3, roomsCount: 5, totalBeds: 15, occupiedBeds: 13, fireSafetyStatus: 'VERIFIED', activeRooms: ['306', '307', '308', '309', '310'] },
      { floorNumber: 4, roomsCount: 5, totalBeds: 15, occupiedBeds: 12, fireSafetyStatus: 'VERIFIED', activeRooms: ['406', '407', '408', '409', '410'] },
    ],
  },
];

export const WardenBlocksPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBlock, setSelectedBlock] = useState<number>(1);

  const currentBlock = DEFAULT_BLOCKS.find((b) => b.id === selectedBlock) || DEFAULT_BLOCKS[0];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Residential Architecture
              </span>
              <span className="text-xs text-gray-400">• Floor & Wing Topology</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Hostel Blocks, Floors & Rooms</h1>
            <p className="text-sm text-gray-400">
              Detailed breakdown of hostel wings, floor elevations, room numbers, and occupancy levels.
            </p>
          </div>
        </div>

        {/* Block Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {DEFAULT_BLOCKS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBlock(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedBlock === b.id
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                    : 'bg-slate-50 text-gray-400 hover:text-white border border-[#262B3A]'
                }`}
              >
                {b.blockName}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-gray-400">
            {currentBlock.hostelName} • {currentBlock.floorsCount} Residential Floors
          </div>
        </div>

        {/* Floor Breakdown Cards */}
        <div className="space-y-4">
          {currentBlock.floors.map((flr) => {
            const occPct = Math.round((flr.occupiedBeds / flr.totalBeds) * 100);
            return (
              <div
                key={flr.floorNumber}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-sm font-mono">
                      F{flr.floorNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Floor Level {flr.floorNumber}</h3>
                      <p className="text-xs text-gray-400">
                        {flr.roomsCount} Rooms • {flr.totalBeds} Total Beds Capacity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Floor Occupancy</span>
                      <span className="font-mono font-bold text-teal-400 text-sm">
                        {flr.occupiedBeds} / {flr.totalBeds} ({occPct}%)
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fire Safety: {flr.fireSafetyStatus}
                    </span>
                  </div>
                </div>

                {/* Rooms Grid */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider block mb-2">
                    Floor Rooms Roster
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {flr.activeRooms.map((rm) => (
                      <div
                        key={rm}
                        onClick={() => navigate('/warden/rooms')}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-sm text-white group-hover:text-teal-300">
                            Room {rm}
                          </span>
                          <DoorOpen className="w-4 h-4 text-gray-500 group-hover:text-teal-400" />
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">3 Beds • Triple</div>
                        <div className="text-[10px] font-mono text-teal-400 mt-1">Available</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};
