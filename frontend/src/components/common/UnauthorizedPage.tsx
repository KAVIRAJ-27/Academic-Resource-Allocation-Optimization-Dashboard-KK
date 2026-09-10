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
    <div className="min-h-screen bg-[#080A0F] text-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#11141C] border border-rose-500/30 shadow-card text-rose-400 mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border border-rose-500/30 text-rose-400 bg-rose-500/10 uppercase tracking-wider">
            403 — Unauthorized Role
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Permission Restricted
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
            Your current account ({user ? `${user.name} [${ROLE_LABELS[user.role]}]` : 'Guest'}) does not hold the cryptographic role permissions required to access this portal.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-[#1E2330] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <Lock className="w-4 h-4" />
            <span>Developer Role Testing (Phase 1)</span>
          </div>
          <p className="text-gray-400">
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
                className="py-1 px-2 text-[11px] rounded bg-[#171A23] hover:bg-teal-500/20 hover:text-teal-300 text-gray-300 border border-white/5 transition-colors font-mono text-center"
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
