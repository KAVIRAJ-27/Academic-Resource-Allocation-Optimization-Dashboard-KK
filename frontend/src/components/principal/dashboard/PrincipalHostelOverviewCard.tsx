import React from 'react';
import { PrincipalHostelOverviewDto } from '../../../types/principal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { Building, Bed, BedDouble, AlertCircle } from 'lucide-react';

interface PrincipalHostelOverviewCardProps {
  hostel: PrincipalHostelOverviewDto;
}

export const PrincipalHostelOverviewCard: React.FC<PrincipalHostelOverviewCardProps> = ({ hostel }) => {
  const hasBeds = hostel.totalBeds > 0;
  const occupancyPercentage = hostel.occupancyRate !== null && hostel.occupancyRate !== undefined ? hostel.occupancyRate : 0;

  return (
    <Card className="mb-6 border-[#D8C9A8] bg-white shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#B8A16A]" />
            <CardTitle className="text-base font-serif font-bold text-[#202020]">Hostel & Residential Operations</CardTitle>
          </div>
          {hostel.occupancyRate !== null && (
            <Badge variant="neutral" size="md">
              Occupancy: {hostel.occupancyRate}%
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-[#77736A]">
          Campus residential capacity, block occupancy, and bed lifecycle state.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasBeds ? (
          <div className="text-center py-8 text-[#77736A] text-sm">
            No hostel occupancy data available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-[#FBF9F3] rounded border border-[#E8E0D0]">
                <div className="text-xs text-[#77736A]">Total Hostels</div>
                <div className="text-xl font-serif font-bold text-[#202020] mt-0.5">{hostel.totalHostels}</div>
              </div>

              <div className="p-3 bg-[#FBF9F3] rounded border border-[#E8E0D0]">
                <div className="text-xs text-[#77736A]">Total Rooms</div>
                <div className="text-xl font-serif font-bold text-[#202020] mt-0.5">{hostel.totalRooms}</div>
              </div>

              <div className="p-3 bg-[#FBF9F3] rounded border border-[#E8E0D0]">
                <div className="text-xs text-[#77736A]">Bed Capacity</div>
                <div className="text-xl font-serif font-bold text-[#202020] mt-0.5">{hostel.totalBeds}</div>
              </div>

              <div className="p-3 bg-[#FBF9F3] rounded border border-[#E8E0D0]">
                <div className="text-xs text-[#77736A]">Occupancy Rate</div>
                <div className="text-xl font-serif font-bold text-[#B8A16A] mt-0.5">
                  {hostel.occupancyRate !== null ? `${hostel.occupancyRate}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            {hostel.occupancyRate !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#555555]">
                  <span>Occupancy Progress</span>
                  <span className="font-semibold text-[#202020]">
                    {hostel.occupiedBeds} occupied / {hostel.occupiedBeds + hostel.availableBeds} usable beds
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#E8E0D0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#B8A16A] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, occupancyPercentage))}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#77736A] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#77736A] inline" />
                  <span>Formula: <em>(occupiedBeds / (occupiedBeds + availableBeds)) * 100</em></span>
                </div>
              </div>
            )}

            {/* Detailed Bed Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded bg-[#F0F5F2] border border-[#B6D1C1]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3F7655]">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Available</span>
                </div>
                <div className="text-lg font-serif font-bold text-[#3F7655] mt-1">
                  {hostel.availableBeds}
                </div>
              </div>

              <div className="p-3 rounded bg-[#F4F0E6] border border-[#D8C9A8]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B8A16A]">
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Occupied</span>
                </div>
                <div className="text-lg font-serif font-bold text-[#B8A16A] mt-1">
                  {hostel.occupiedBeds}
                </div>
              </div>

              <div className="p-3 rounded bg-[#FAF7F0] border border-[#E8DEC8]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A87928]">
                  <Building className="w-3.5 h-3.5" />
                  <span>Maintenance</span>
                </div>
                <div className="text-lg font-serif font-bold text-[#A87928] mt-1">
                  {hostel.maintenanceBeds}
                </div>
              </div>

              <div className="p-3 rounded bg-[#EFF3F6] border border-[#C2D1DD]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#657C91]">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Reserved</span>
                </div>
                <div className="text-lg font-serif font-bold text-[#657C91] mt-1">
                  {hostel.reservedBeds}
                </div>
              </div>

              <div className="p-3 rounded bg-[#FBF9F3] border border-[#E8E0D0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#77736A]">
                  <Bed className="w-3.5 h-3.5" />
                  <span>Inactive</span>
                </div>
                <div className="text-lg font-serif font-bold text-[#77736A] mt-1">
                  {hostel.inactiveBeds}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
