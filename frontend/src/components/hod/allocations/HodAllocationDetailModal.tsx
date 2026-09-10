import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { HodResourceAllocationDetail } from '../../../types/hod';
import {
  Layers,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CalendarCheck,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface HodAllocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: HodResourceAllocationDetail | null;
  loading: boolean;
}

export const HodAllocationDetailModal: React.FC<HodAllocationDetailModalProps> = ({
  isOpen,
  onClose,
  allocation,
  loading,
}) => {
  if (!allocation && !loading) return null;

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">CANCELLED</Badge>;
      default:
        return <Badge variant="info">{status || 'UNKNOWN'}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={allocation ? `Resource Allocation #${allocation.id}` : 'Allocation Inspection'}
      description="Department academic resource allocation and schedule details"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {allocation && (
              <>
                <span className="text-xs text-gray-400">Status:</span>
                {getStatusBadge(allocation.status)}
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-700 hover:bg-gray-800 rounded-xl"
          >
            Close
          </Button>
        </div>
      }
    >
      {loading || !allocation ? (
        <div className="py-12 flex items-center justify-center space-x-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading allocation details...</span>
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Resource & Beneficiary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Card */}
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <Layers className="w-4 h-4" />
                <span>Allocated Resource</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">{allocation.resourceName}</p>
                <p className="text-xs font-mono text-gray-400">{allocation.resourceCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800/60 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">Category:</span> {allocation.categoryName || 'N/A'}
                </div>
                {allocation.resourceCapacity && (
                  <div>
                    <span className="text-gray-500">Capacity:</span> {allocation.resourceCapacity} seats
                  </div>
                )}
                {allocation.resourceLocation && (
                  <div className="col-span-2 flex items-center space-x-1 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{allocation.resourceLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Beneficiary Card */}
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <User className="w-4 h-4" />
                <span>Beneficiary Information</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">{allocation.allocatedToName}</p>
                <p className="text-xs text-gray-400">{allocation.allocatedToEmail}</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-800/60">
                <span className="text-xs text-gray-400">Role:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-800 text-gray-200 border border-gray-700">
                  {allocation.allocatedToRole || 'User'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">Dept:</span>
                <span className="text-xs font-semibold text-gray-300">{allocation.departmentName}</span>
              </div>
            </div>
          </div>

          {/* Timing & Academic Window */}
          <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Calendar className="w-4 h-4" />
              <span>Time Slot & Academic Context</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Start Time</p>
                <p className="font-semibold text-white mt-0.5">
                  {new Date(allocation.startDatetime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Time</p>
                <p className="font-semibold text-white mt-0.5">
                  {new Date(allocation.endDatetime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Academic Term</p>
                <p className="font-semibold text-white mt-0.5">
                  {allocation.academicYearName || 'Standard'} {allocation.semesterName ? `(${allocation.semesterName})` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time Slot</p>
                <p className="font-semibold text-blue-300 mt-0.5">
                  {allocation.timeSlotName || 'Custom / Flexible'}
                </p>
              </div>
            </div>
          </div>

          {/* Purpose & Assignment Details */}
          <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <FileText className="w-4 h-4" />
              <span>Usage Purpose & Assignment Context</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Stated Purpose:</p>
              <p className="text-sm text-gray-200 bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                {allocation.purpose || 'General departmental educational use'}
              </p>
            </div>
            {allocation.requestId && (
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs">
                <span className="text-gray-400">Generated from Request: </span>
                <strong className="text-blue-300 font-mono">#{allocation.requestId}</strong>
                {allocation.requestPurpose && (
                  <p className="text-gray-300 mt-1 italic">
                    Original Request Purpose: "{allocation.requestPurpose}"
                  </p>
                )}
              </div>
            )}
            {allocation.allocatedByName && (
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                Allocated By Administrator / System: <strong className="text-gray-300">{allocation.allocatedByName}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
