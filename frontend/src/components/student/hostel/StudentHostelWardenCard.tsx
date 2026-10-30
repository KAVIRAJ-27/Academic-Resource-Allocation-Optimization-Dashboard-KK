import React from 'react';
import { Card } from '../../ui';
import { StudentHostelWarden } from '../../../types/studentHostel';
import { ShieldCheck, Phone, Mail, UserCheck, AlertCircle } from 'lucide-react';

interface Props {
  wardens: StudentHostelWarden[];
}

export const StudentHostelWardenCard: React.FC<Props> = ({ wardens }) => {
  return (
    <Card className="p-5 bg-white border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Residential Warden & Contact Information
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Official supervisory officers designated for resident security and building administration
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-50 text-gray-400 border border-slate-200">
          {wardens.length} Assigned
        </span>
      </div>

      {wardens.length === 0 ? (
        <div className="p-6 text-center bg-slate-50/50 border border-slate-200 rounded-xl space-y-2">
          <ShieldCheck className="w-7 h-7 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400 font-medium">Warden information is not available.</p>
          <p className="text-[11px] text-gray-500">
            Designated warden contacts will be updated once assigned by campus operations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wardens.map((warden) => (
            <div
              key={warden.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 hover:border-[#2E364A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold text-xs font-mono">
                    {warden.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{warden.name}</h4>
                    <p className="text-[10px] text-teal-400 font-mono">Resident Warden</p>
                  </div>
                </div>
                {warden.employeeId && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-gray-400 border border-white/5">
                    {warden.employeeId}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 gap-1.5 text-xs text-gray-300 font-mono">
                {warden.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-300">{warden.contactNumber}</span>
                  </div>
                )}
                {warden.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-300 truncate">{warden.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
