import React from 'react';
import { Building, Check, ChevronDown, BedDouble, AlertCircle } from 'lucide-react';
import { WardenHostelOption } from '../../types/wardenAllocation';
import { Badge } from '../ui';

interface HostelScopeSelectorProps {
  hostels: WardenHostelOption[];
  selectedHostelId: number | undefined;
  onSelectHostel: (hostelId: number) => void;
  loading?: boolean;
}

export const HostelScopeSelector: React.FC<HostelScopeSelectorProps> = ({
  hostels,
  selectedHostelId,
  onSelectHostel,
  loading = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="h-10 w-64 bg-[#171A23] rounded-xl border border-[#1E2330] animate-pulse" />
    );
  }

  if (hostels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-800/40 text-orange-300 text-xs font-medium">
        <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
        <span>No hostel has been assigned to your account.</span>
      </div>
    );
  }

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId) || hostels[0];

  if (hostels.length === 1) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#11141C] border border-[#1E2330] text-xs shadow-sm">
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
          <Building className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200">{selectedHostel.name}</span>
            <Badge variant="orange" size="sm">
              {selectedHostel.code}
            </Badge>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
            <BedDouble className="w-3 h-3 text-gray-400" />
            <span>
              {selectedHostel.occupiedBeds} / {selectedHostel.totalBeds} Beds Occupied
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#11141C] hover:bg-[#171A23] border border-[#1E2330] hover:border-orange-500/40 text-xs text-left transition-all group shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
          <Building className="w-4 h-4" />
        </div>
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200 truncate max-w-[150px]">
              {selectedHostel.name}
            </span>
            <Badge variant="orange" size="sm">
              {selectedHostel.code}
            </Badge>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
            <BedDouble className="w-3 h-3 text-gray-400" />
            <span>
              {selectedHostel.occupiedBeds} / {selectedHostel.totalBeds} Beds
            </span>
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-transform ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#11141C] border border-[#1E2330] shadow-xl z-50 overflow-hidden py-1 divide-y divide-[#1E2330]">
            <div className="px-3 py-2 text-[10px] uppercase font-mono font-semibold text-gray-400 tracking-wider">
              Assigned Hostels ({hostels.length})
            </div>
            <div className="max-h-60 overflow-y-auto">
              {hostels.map((hostel) => {
                const isSelected = hostel.id === selectedHostel.id;
                return (
                  <button
                    key={hostel.id}
                    type="button"
                    onClick={() => {
                      onSelectHostel(hostel.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-orange-500/10 text-orange-300 font-semibold'
                        : 'text-gray-300 hover:bg-[#171A23]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{hostel.name}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 bg-[#171A23] rounded text-gray-400">
                          {hostel.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        {hostel.occupiedBeds} / {hostel.totalBeds} beds occupied ({hostel.availableBeds} free)
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
