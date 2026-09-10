import React from 'react';
import { Card } from '../../ui';
import { StudentHostelFacility } from '../../../types/studentHostel';
import {
  Wifi,
  Tv,
  Utensils,
  BookOpen,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Props {
  facilities: StudentHostelFacility[];
}

export const StudentHostelFacilitiesCard: React.FC<Props> = ({ facilities }) => {
  const getFacilityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wi-fi') || lower.includes('internet') || lower.includes('network')) {
      return Wifi;
    }
    if (lower.includes('study') || lower.includes('library') || lower.includes('reading')) {
      return BookOpen;
    }
    if (lower.includes('mess') || lower.includes('dining') || lower.includes('canteen')) {
      return Utensils;
    }
    if (lower.includes('tv') || lower.includes('recreation') || lower.includes('common')) {
      return Tv;
    }
    if (lower.includes('power') || lower.includes('generator') || lower.includes('water')) {
      return Zap;
    }
    return Sparkles;
  };

  return (
    <Card className="p-5 bg-[#11141C] border-[#1E2330] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Hostel Facilities & Common Amenities
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified institutional infrastructure available to residents of this hostel
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#171A23] text-gray-400 border border-[#222838]">
          {facilities.length} Listed
        </span>
      </div>

      {facilities.length === 0 ? (
        <div className="p-8 text-center bg-[#171A23]/50 border border-[#222838] rounded-xl space-y-2">
          <Layers className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400 font-medium">No hostel facilities have been listed.</p>
          <p className="text-[11px] text-gray-500">
            Amenities will be displayed once cataloged by the residential administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {facilities.map((facility) => {
            const Icon = getFacilityIcon(facility.name);

            return (
              <div
                key={facility.id}
                className="p-3.5 bg-[#171A23] border border-[#222838] rounded-xl flex items-start gap-3 hover:border-[#2E364A] transition-colors"
              >
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {facility.name}
                    </h4>
                    {facility.quantity > 1 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#11141C] text-gray-400 border border-white/5 shrink-0">
                        Qty: {facility.quantity}
                      </span>
                    )}
                  </div>
                  {facility.description ? (
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                      {facility.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">Active resident amenity</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
