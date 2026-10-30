import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'STUDENT',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        password: formData.password,
      });

      setSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; error?: string };
      setError(
        errorObj.message ||
        errorObj.error ||
        'Registration failed. Username or email may already be registered.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEFA] text-[#202020] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Classical Gold Ambient Light Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D8C9A8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B8A16A]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF7F0] to-[#F4F0E6] border border-[#D8C9A8]/80 text-[#B8A16A] font-serif font-bold text-xl shadow-glass mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#202020]">
            Create AHRAO Account
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1 font-normal">
            Register your institutional profile on the AHRAO network.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[#77736A] border border-[#D8C9A8]/60 shadow-xs">
              Self-Service Institutional Registration
            </span>
          </div>
        </div>

        {success ? (
          <Card className="p-6 sm:p-8 space-y-6 text-center bg-white/80 backdrop-blur-2xl border border-[#D8C9A8]/70 shadow-glass rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EEF6F1] text-[#3F7655] border border-[#C1DFCD] mb-2 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#202020]">Account Created Successfully!</h2>
            <p className="text-xs sm:text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
              Your profile for <span className="text-[#202020] font-mono font-semibold">@{formData.username}</span> has been provisioned with the <span className="text-[#A87928] font-semibold">{formData.role}</span> role. You can now log in using your credentials.
            </p>
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-2/3 shadow-xs"
              >
                Proceed to Login
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-5 bg-white/80 backdrop-blur-2xl border border-[#D8C9A8]/70 shadow-glass rounded-3xl">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FDF0F0]/90 backdrop-blur-xs border border-[#ECC6C6] flex items-start gap-2.5 text-xs text-[#B44747] shadow-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="Elena"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Rostova"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Desired Username"
                  placeholder="elena_r"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                />
                <Input
                  label="Institutional Email"
                  type="email"
                  placeholder="elena@ahrao.edu"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              {/* Phone & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                <Select
                  label="Institutional Role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  options={[
                    { value: 'STUDENT', label: 'Student (Undergrad / Postgrad)' },
                    { value: 'FACULTY', label: 'Academic Faculty' },
                    { value: 'WARDEN', label: 'Hostel Warden' },
                    { value: 'HOD', label: 'Head of Department (HOD)' },
                    { value: 'PRINCIPAL', label: 'College Principal' },
                  ]}
                  required
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-1/3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || isLoading}
                  className="w-full sm:w-2/3 flex items-center justify-center gap-2 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-[#E8E0D0]/80 text-center text-xs text-[#555555]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#B8A16A] hover:text-[#8C7748] font-semibold hover:underline transition-colors">
                Sign in here
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
