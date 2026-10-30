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
      <div className="h-10 w-64 bg-[#F8F6F0] rounded-xl border border-[#E8E0D0] animate-pulse" />
    );
  }

  if (hostels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#E8D8BA] text-[#A87928] text-xs font-medium">
        <AlertCircle className="w-4 h-4 text-[#A87928] shrink-0" />
        <span>No hostel has been assigned to your account.</span>
      </div>
    );
  }

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId) || hostels[0];

  if (hostels.length === 1) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-[#D8C9A8] text-xs shadow-none">
        <div className="p-1.5 rounded-lg bg-[#FAF7F0] text-[#A87928] border border-[#E8D8BA]">
          <Building className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#202020]">{selectedHostel.name}</span>
            <Badge variant="warning" size="sm">
              {selectedHostel.code}
            </Badge>
          </div>
          <p className="text-[11px] text-[#555555] mt-0.5 flex items-center gap-1.5 font-mono">
            <BedDouble className="w-3 h-3 text-[#77736A]" />
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
        className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4F0E6] border border-[#D8C9A8] hover:border-[#B8A16A] text-xs text-left transition-all group shadow-none focus:outline-none focus:ring-1 focus:ring-[#B8A16A]"
      >
        <div className="p-1.5 rounded-lg bg-[#FAF7F0] text-[#A87928] group-hover:bg-[#f6ebd7] transition-colors border border-[#E8D8BA]">
          <Building className="w-4 h-4" />
        </div>
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#202020] truncate max-w-[150px]">
              {selectedHostel.name}
            </span>
            <Badge variant="warning" size="sm">
              {selectedHostel.code}
            </Badge>
          </div>
          <p className="text-[11px] text-[#555555] mt-0.5 flex items-center gap-1.5 font-mono">
            <BedDouble className="w-3 h-3 text-[#77736A]" />
            <span>
              {selectedHostel.occupiedBeds} / {selectedHostel.totalBeds} Beds
            </span>
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#77736A] group-hover:text-[#202020] transition-transform ${
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
          <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-[#D8C9A8] shadow-xl z-50 overflow-hidden py-1 divide-y divide-[#E8E0D0]">
            <div className="px-3 py-2 text-[10px] uppercase font-mono font-semibold text-[#77736A] tracking-wider">
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
                        ? 'bg-[#FAF7F0] text-[#A87928] font-semibold'
                        : 'text-[#202020] hover:bg-[#F4F0E6]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{hostel.name}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 bg-[#F8F6F0] rounded text-[#555555] border border-[#E8E0D0]">
                          {hostel.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#555555] mt-0.5 font-mono">
                        {hostel.occupiedBeds} / {hostel.totalBeds} beds occupied ({hostel.availableBeds} free)
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#A87928] shrink-0" />}
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
