import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, UserPlus, Sparkles, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { ROLES, UserRole } from '../../constants/roles';

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
    <div className="min-h-screen bg-[#080A0F] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow lights */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-xl shadow-card-glow mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Create AHRAO Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Register your institutional profile on the AHRAO network.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Phase 2: Self-Service Registration
            </span>
          </div>
        </div>

        {success ? (
          <Card className="p-6 sm:p-8 space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Account Created Successfully!</h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Your profile for <span className="text-teal-300 font-mono">@{formData.username}</span> has been provisioned with the <span className="text-purple-300 font-semibold">{formData.role}</span> role. You can now log in using your credentials.
            </p>
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-2/3"
              >
                Proceed to Login
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
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
                  className="w-full sm:w-2/3 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-white/5 text-center text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium hover:underline">
                Sign in here
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
