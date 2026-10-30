import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS } from '../../constants/roles';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFFEFA] text-[#202020] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-[#D8C9A8] shadow-card text-[#A87928] mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border border-[#EED9B2] text-[#A87928] bg-[#FAF4E8] uppercase tracking-wider">
            403 — Unauthorized Role
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#202020]">
            Permission Restricted
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed max-w-sm mx-auto">
            Your current account ({user ? `${user.name} [${ROLE_LABELS[user.role]}]` : 'Guest'}) does not hold the required permissions to access this portal.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FBF9F3] border border-[#D8C9A8] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#B8A16A] font-semibold">
            <Lock className="w-4 h-4" />
            <span>Developer Role Testing (Phase 1)</span>
          </div>
          <p className="text-[#555555]">
            Switch your simulated role below to test authorized route access:
          </p>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {(['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'WARDEN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  navigate(`/${r.toLowerCase()}/dashboard`);
                }}
                className="py-1 px-2 text-[11px] rounded bg-white hover:bg-[#F4F0E6] text-[#202020] border border-[#D9D2C3] transition-colors font-mono text-center font-medium shadow-xs"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" size="md" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/')} className="w-full sm:w-auto">
            <Home className="w-4 h-4 mr-1.5" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};
