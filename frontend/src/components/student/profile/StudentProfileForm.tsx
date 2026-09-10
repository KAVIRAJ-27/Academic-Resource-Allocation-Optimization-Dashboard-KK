import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '../../ui';
import { StudentProfile, StudentProfileUpdateRequest } from '../../../types/student';
import { User, Phone, Mail, Hash, Save, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';

interface StudentProfileFormProps {
  profile: StudentProfile;
  onUpdate: (data: StudentProfileUpdateRequest) => Promise<boolean>;
  updating: boolean;
  error: string | null;
}

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  profile,
  onUpdate,
  updating,
  error,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCancel = () => {
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setPhone(profile.phone || '');
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!firstName.trim()) {
      setValidationError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setValidationError('Last name is required');
      return;
    }

    if (phone.trim() && !/^[+]?[0-9\s()-]{7,20}$/.test(phone.trim())) {
      setValidationError('Phone number must contain between 7 and 20 valid numeric characters');
      return;
    }

    const ok = await onUpdate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });

    if (ok) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <Card className="bg-[#11141C] border-[#1E2330]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Personal & Contact Details
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Self-editable contact information with verified database persistence
              </CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditing(true)}
            >
              Edit Contact
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="w-3.5 h-3.5" />}
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {(validationError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing || updating}
                className="w-full px-3 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                placeholder="First name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing || updating}
                className="w-full px-3 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Phone */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing || updating}
                  className="w-full pl-9 pr-3 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Official University Email (Read-only) */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Official Institutional Email</span>
                <span className="text-[10px] text-gray-400 lowercase font-normal">(locked)</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-[#141822] border border-[#1E2330] rounded-xl text-xs text-gray-400 cursor-not-allowed opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Registration Number Context (Read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Register Number</span>
                <span className="text-[10px] text-gray-400 lowercase font-normal">(locked)</span>
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile.registerNumber}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-[#141822] border border-[#1E2330] rounded-xl text-xs font-mono text-teal-400 cursor-not-allowed opacity-75"
                />
              </div>
            </div>

            {profile.rollNumber && (
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Class Roll Number</span>
                  <span className="text-[10px] text-gray-400 lowercase font-normal">(locked)</span>
                </label>
                <input
                  type="text"
                  value={profile.rollNumber}
                  disabled
                  className="w-full px-3 py-2 bg-[#141822] border border-[#1E2330] rounded-xl text-xs font-mono text-gray-400 cursor-not-allowed opacity-75"
                />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="pt-3 border-t border-[#1E2330] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                isLoading={updating}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
