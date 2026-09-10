import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
  GridCol,
} from '../../components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  Alert,
  Skeleton,
} from '../../components/ui';
import { useFacultyProfile } from '../../hooks/useFacultyProfile';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  ShieldCheck,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  Briefcase,
  Key,
} from 'lucide-react';

export const FacultyProfilePage: React.FC = () => {
  const { profile, loading, error, updating, updateError, updateProfile, fetchProfile } =
    useFacultyProfile();

  // Local form state for safe editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [formValidationErr, setFormValidationErr] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync profile data to form fields when loaded
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setQualification(profile.qualification || '');
    }
  }, [profile]);

  const handleReset = () => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setQualification(profile.qualification || '');
    }
    setFormValidationErr(null);
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErr(null);
    setSuccessMessage(null);

    // Validation
    if (!firstName.trim()) {
      setFormValidationErr('First name cannot be empty.');
      return;
    }
    if (!lastName.trim()) {
      setFormValidationErr('Last name cannot be empty.');
      return;
    }
    if (phone.trim() && !/^[+0-9\-\s()]{7,20}$/.test(phone.trim())) {
      setFormValidationErr('Phone number must be between 7 and 20 valid characters (+, -, digits).');
      return;
    }

    const ok = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      qualification: qualification.trim(),
    });

    if (ok) {
      setSuccessMessage('Faculty profile information updated successfully.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  if (loading && !profile) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse" aria-busy="true">
          <div className="p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-3">
            <Skeleton className="h-6 w-32 bg-[#171A23]" />
            <Skeleton className="h-9 w-64 bg-[#171A23]" />
            <Skeleton className="h-4 w-96 bg-[#171A23]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
              <Skeleton className="h-5 w-48 bg-[#171A23]" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-xl bg-[#171A23]" />
                <Skeleton className="h-10 rounded-xl bg-[#171A23]" />
              </div>
              <Skeleton className="h-10 rounded-xl bg-[#171A23]" />
            </div>
            <div className="p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
              <Skeleton className="h-5 w-36 bg-[#171A23]" />
              <Skeleton className="h-20 rounded-xl bg-[#171A23]" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FC';

  return (
    <PageContainer>
      {/* Notifications */}
      {error && (
        <Alert variant="error" title="Error Loading Profile" className="mb-6">
          {error}
        </Alert>
      )}

      {updateError && (
        <Alert variant="error" title="Update Failed" className="mb-6">
          {updateError}
        </Alert>
      )}

      {formValidationErr && (
        <Alert variant="warning" title="Validation Error" className="mb-6">
          {formValidationErr}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Success" className="mb-6">
          {successMessage}
        </Alert>
      )}

      {/* Header Banner */}
      <PageHeader
        title="Faculty Academic Profile"
        description="Review personal credentials, manage permitted contact details, and inspect departmental assignments."
        badge={
          <Badge variant="purple" dot>
            {profile?.designation || 'FACULTY PROFILE'}
          </Badge>
        }
      />

      {/* Profile Overview Card */}
      <div className="mb-6 p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-extrabold text-xl shadow-card-glow tracking-wider shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{profile?.fullName}</h2>
              <Badge variant="teal" size="sm">
                {profile?.accountStatus || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-xs text-teal-300 font-medium mt-0.5">
              {profile?.designation} &bull; {profile?.departmentName}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Employee ID: <span className="text-gray-200 font-semibold">{profile?.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Badge variant="neutral" size="sm">
            {profile?.departmentCode || 'DEPT'}
          </Badge>
          <Badge variant="purple" size="sm">
            ROLE_FACULTY
          </Badge>
        </div>
      </div>

      <DashboardGrid cols={3} className="gap-6">
        {/* Left 2 Cols: Editable Personal Information Form */}
        <GridCol span={2}>
          <Card className="bg-[#11141C] border-[#1E2330] shadow-card">
            <CardHeader className="border-b border-[#1E2330] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    Personal & Contact Information
                  </CardTitle>
                  <CardDescription>
                    Permitted personal fields may be updated directly
                  </CardDescription>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">Self-Service</span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      First Name <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      disabled={updating}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Last Name <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      disabled={updating}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Contact Phone
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={updating}
                      leftIcon={<Phone className="w-3.5 h-3.5 text-gray-500" />}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Direct contact or office extension
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Academic Qualification
                    </label>
                    <Input
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. Ph.D. in Computer Science"
                      disabled={updating}
                      leftIcon={<GraduationCap className="w-3.5 h-3.5 text-gray-500" />}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Highest academic or doctoral degree
                    </p>
                  </div>
                </div>

                {/* Read-Only Official Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Official Institutional Email <span className="text-[10px] text-gray-500">(Read-Only)</span>
                  </label>
                  <Input
                    value={profile?.email || ''}
                    disabled
                    readOnly
                    leftIcon={<Mail className="w-3.5 h-3.5 text-gray-500" />}
                    className="opacity-70 cursor-not-allowed bg-[#0E1017]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Institutional SSO identity managed by University IT administration
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2330]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={handleReset}
                    disabled={updating}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </GridCol>

        {/* Right 1 Col: Institutional & Account Lineage (Read-Only) */}
        <GridCol span={1}>
          <div className="space-y-6">
            {/* Employment Lineage */}
            <Card className="bg-[#11141C] border-[#1E2330] shadow-card">
              <CardHeader className="border-b border-[#1E2330] pb-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Employment Lineage
                </CardTitle>
                <CardDescription>Administrative assignment records</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Employee ID</span>
                  <span className="font-mono font-semibold text-white">{profile?.employeeId}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Designation</span>
                  <span className="font-medium text-teal-300">{profile?.designation}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Department</span>
                  <span className="font-medium text-gray-200 text-right truncate max-w-[160px]" title={profile?.departmentName}>
                    {profile?.departmentName || 'Not available'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Department Code</span>
                  <span className="font-mono text-gray-300">{profile?.departmentCode || '--'}</span>
                </div>
                {profile?.institutionName && (
                  <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                    <span className="text-gray-400">Institution</span>
                    <span className="font-medium text-gray-300 text-right truncate max-w-[160px]" title={profile.institutionName}>
                      {profile.institutionName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-400">Joining Date</span>
                  <span className="font-mono text-gray-300">
                    {profile?.joiningDate || 'Recorded'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Account & Security */}
            <Card className="bg-[#11141C] border-[#1E2330] shadow-card">
              <CardHeader className="border-b border-[#1E2330] pb-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Account & Security
                </CardTitle>
                <CardDescription>Authentication credentials state</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Username</span>
                  <span className="font-mono font-medium text-gray-200">{profile?.username}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Security Roles</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {profile?.roles?.map((r) => (
                      <Badge key={r} variant="purple" size="sm">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1A1E29]">
                  <span className="text-gray-400">Account Status</span>
                  <Badge variant="teal" size="sm">
                    {profile?.accountStatus || 'ACTIVE'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-400">Last Session Login</span>
                  <span className="font-mono text-[11px] text-gray-400">
                    {profile?.lastLoginAt
                      ? new Date(profile.lastLoginAt).toLocaleString()
                      : 'Current Session'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </GridCol>
      </DashboardGrid>
    </PageContainer>
  );
};
