import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, UserRole } from '../../constants/roles';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

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
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(ROLES.ADMIN);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
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
      const errorObj = err as { status?: number; message?: string; error?: string };
      let userFriendlyMessage = 'Unable to connect to the server.';
      if (errorObj.status === 401) {
        userFriendlyMessage = 'Invalid email or password.';
      } else if (errorObj.status === 403) {
        userFriendlyMessage = 'You are not authorized to access this application.';
      } else if (errorObj.status === 500) {
        userFriendlyMessage = 'Authentication service is temporarily unavailable.';
      } else if (errorObj.message && !errorObj.message.includes('status code')) {
        userFriendlyMessage = errorObj.message;
      }
      setErrorMessage(userFriendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEFA] text-[#202020] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Classical Gold Ambient Light Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D8C9A8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B8A16A]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF7F0] to-[#F4F0E6] border border-[#D8C9A8]/80 text-[#B8A16A] font-serif font-bold text-2xl shadow-glass mb-3 tracking-wider">
            AH
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#202020]">
            AHRAO Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1 font-normal">
            Academic & Hostel Resource Allocation and Optimization
          </p>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <span className="text-[11px] font-mono font-medium px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[#77736A] border border-[#D8C9A8]/60 shadow-xs">
              Enterprise University Platform &bull; Secure Access
            </span>
          </div>
        </div>

        {/* Premium Glass Login Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-[#D8C9A8]/70 rounded-3xl p-6 sm:p-8 shadow-glass transition-all duration-200">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F0]/90 backdrop-blur-xs border border-[#ECC6C6] flex items-start gap-2.5 text-xs text-[#B44747] shadow-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#B44747]" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Issue</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#555555] uppercase tracking-wider font-mono">
                  Demo Role Fast-Fill
                </label>
                <span className="text-[10px] text-[#77736A] font-mono">6 Institutional Roles</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(Object.keys(ROLES) as UserRole[]).map((r) => {
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`py-2 px-2 text-[11px] rounded-xl font-mono font-semibold transition-all text-center border ${
                        isSelected
                          ? 'bg-[#F4F0E6] text-[#202020] border-[#B8A16A] shadow-xs'
                          : 'bg-white/70 hover:bg-[#F8F6F0] text-[#555555] border-[#D8C9A8]/60'
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

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#77736A] hover:text-[#202020] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full flex items-center justify-center gap-2 font-semibold shadow-xs"
              >
                <span>Sign In with Secure JWT</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* User registration link */}
          <div className="mt-5 pt-3.5 border-t border-[#E8E0D0]/80 flex items-center justify-between text-xs">
            <span className="text-[#77736A] text-[11px]">Production Authentication</span>
            <Link
              to="/register"
              className="text-[#B8A16A] hover:text-[#8C7748] font-semibold text-[11px] hover:underline transition-colors"
            >
              New User? Register →
            </Link>
          </div>
        </div>

        {/* Security Info Footnote */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#77736A]">
          <Shield className="w-3.5 h-3.5 text-[#B8A16A]" />
          <span>Protected by Spring Security 6 Stateless JWT & RBAC Matrix</span>
        </div>
      </div>
    </div>
  );
};
