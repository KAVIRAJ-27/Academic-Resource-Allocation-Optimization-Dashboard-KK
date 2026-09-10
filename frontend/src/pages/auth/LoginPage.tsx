import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, UserRole, ROLE_LABELS } from '../../constants/roles';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Lock, User as UserIcon } from 'lucide-react';

interface SeedCredential {
  role: UserRole;
  identifier: string;
  secret: string;
  label: string;
}

const SEED_CREDENTIALS: Record<UserRole, SeedCredential> = {
  ADMIN: { role: ROLES.ADMIN, identifier: 'admin', secret: 'Admin@123', label: 'System Admin' },
  PRINCIPAL: { role: ROLES.PRINCIPAL, identifier: 'principal', secret: 'Principal@123', label: 'College Principal' },
  HOD: { role: ROLES.HOD, identifier: 'hod_cs', secret: 'Hod@123', label: 'HOD Computer Science' },
  FACULTY: { role: ROLES.FACULTY, identifier: 'faculty_john', secret: 'Faculty@123', label: 'Faculty Elena' },
  STUDENT: { role: ROLES.STUDENT, identifier: 'student_alex', secret: 'Student@123', label: 'Student Aiden' },
  WARDEN: { role: ROLES.WARDEN, identifier: 'warden_smith', secret: 'Warden@123', label: 'Hostel Warden' },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAs, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(ROLES.ADMIN);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const cred = SEED_CREDENTIALS[role];
    setIdentifier(cred.identifier);
    setPassword(cred.secret);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login({
        usernameOrEmail: identifier.trim(),
        password,
      });

      const targetRole = (loggedUser.role || selectedRole).toLowerCase();
      navigate(`/${targetRole}/dashboard`);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; error?: string };
      setErrorMessage(
        errorObj.message ||
        errorObj.error ||
        'Authentication failed. Please verify your credentials or server connectivity.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxBypass = () => {
    loginAs(selectedRole);
    navigate(`/${selectedRole.toLowerCase()}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-xl shadow-card-glow mb-3">
            AH
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AHRAO Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Academic & Hostel Resource Allocation Optimization Dashboard
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Phase 2: JWT Authentication Active
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-md">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Issue</span>
                <span>{errorMessage}</span>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleSandboxBypass}
                    className="text-[11px] underline hover:text-red-300 font-medium cursor-pointer"
                  >
                    Click here to enter Sandbox Mode (Offline Simulation)
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Quick-Fill Test Role
                </label>
                <span className="text-[10px] text-gray-400 font-mono">6 Roles</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(Object.keys(ROLES) as UserRole[]).map((r) => {
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`py-2 px-2 text-[11px] rounded-lg font-mono font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                          : 'bg-[#171A23] hover:bg-[#222838] text-gray-400 border-white/5'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin, student_alex, etc."
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting || isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Sign In with JWT</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Quick Sandbox Bypass button for demo convenience */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSandboxBypass}
              className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Simulated Sandbox Bypass</span>
            </button>
            <Link
              to="/register"
              className="text-teal-400 hover:text-teal-300 font-medium text-[11px] hover:underline"
            >
              New User? Register →
            </Link>
          </div>
        </div>

        {/* Security Info Footnote */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>Protected by Spring Security 6 Stateless JWT & RBAC Matrix</span>
        </div>
      </div>
    </div>
  );
};
