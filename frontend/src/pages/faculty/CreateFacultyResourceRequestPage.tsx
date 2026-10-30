import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../components/layout';
import { Alert, Button, Badge } from '../../components/ui';
import { useCreateFacultyResourceRequest } from '../../hooks/useCreateFacultyResourceRequest';
import {
  Building2,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const CreateFacultyResourceRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    resources,
    subjects,
    loadingResources,
    submitting,
    error: submitError,
    submitRequest,
  } = useCreateFacultyResourceRequest();

  // Form State
  const [resourceId, setResourceId] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('11:00');
  const [quantity, setQuantity] = useState<number>(1);
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [subjectId, setSubjectId] = useState<string>('');
  const [sectionName, setSectionName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!resourceId) {
      errors.resourceId = 'Please select a facility or equipment resource.';
    }

    if (!purpose.trim()) {
      errors.purpose = 'Purpose is required.';
    } else if (purpose.trim().length > 255) {
      errors.purpose = 'Purpose cannot exceed 255 characters.';
    }

    if (!requestedDate) {
      errors.requestedDate = 'Requested date is required.';
    } else {
      const selected = new Date(requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.requestedDate = 'Requested date cannot be in the past.';
      }
    }

    if (!startTime) {
      errors.startTime = 'Start time is required.';
    }

    if (!endTime) {
      errors.endTime = 'End time is required.';
    }

    if (startTime && endTime && startTime >= endTime) {
      errors.timeWindow = 'Start time must be earlier than end time.';
    }

    if (quantity < 1) {
      errors.quantity = 'Quantity must be at least 1.';
    }

    if (description && description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      resourceId: Number(resourceId),
      purpose: purpose.trim(),
      requestedDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      quantity,
      priority,
      description: description.trim() || undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
    };

    const created = await submitRequest(payload);
    if (created) {
      navigate(`/faculty/resource-requests/${created.id}`);
    }
  };

  const selectedResource = resources.find((r) => r.id === Number(resourceId));

  return (
    <PageContainer>
      <PageHeader
        title="Submit Resource Request"
        description="Request allocation for lecture halls, laboratories, or instructional equipment for academic activities"
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/resource-requests')}
            className="border-slate-200 text-gray-300 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {submitError && (
          <Alert variant="error" title="Request Submission Failed">
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Resource Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-semibold text-slate-900">1. Facility or Equipment Resource</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Select Resource <span className="text-rose-400">*</span>
                </label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  disabled={loadingResources || submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="">-- Choose an active resource --</option>
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.code}) {res.categoryName ? `• ${res.categoryName}` : ''} {res.capacity ? `• Capacity: ${res.capacity}` : ''}
                    </option>
                  ))}
                </select>
                {validationErrors.resourceId && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.resourceId}</p>
                )}
              </div>

              {selectedResource && (
                <div className="bg-[#161B26] border border-slate-200 rounded-lg p-3.5 text-xs text-gray-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{selectedResource.name}</span>
                    <span className="text-gray-400 ml-2 font-mono">({selectedResource.code})</span>
                    {selectedResource.location && (
                      <span className="text-gray-400 ml-2">• {selectedResource.location}</span>
                    )}
                  </div>
                  <Badge variant="teal" size="sm">
                    {selectedResource.categoryName || 'Resource'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Academic Context (Optional) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-slate-900">2. Academic Context (Optional)</h3>
            </div>
            <p className="text-xs text-gray-400">
              Link this request to one of your actively assigned subjects to accelerate departmental review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Assigned Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="">-- None / General Academic Purpose --</option>
                  {subjects.map((subj) => (
                    <option key={subj.subjectId} value={subj.subjectId}>
                      {subj.subjectCode} - {subj.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Section / Class Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section A, Batch 1"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Schedule & Slot Window */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-900">3. Date & Time Requirements</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Requested Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                />
                {validationErrors.requestedDate && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.requestedDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Start Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                {validationErrors.startTime && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  End Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                {validationErrors.endTime && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.endTime}</p>
                )}
              </div>
            </div>

            {validationErrors.timeWindow && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{validationErrors.timeWindow}</span>
              </p>
            )}
          </div>

          {/* Section 4: Priority & Quantity */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Clock className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-semibold text-slate-900">4. Requirements & Priority</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="LOW">Low - Routine academic activity</option>
                  <option value="MEDIUM">Medium - Standard lecture or lab</option>
                  <option value="HIGH">High - Scheduled examination or project demo</option>
                  <option value="URGENT">Urgent - Time-critical institutional event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Quantity / Required Units
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.quantity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Purpose & Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-slate-900">5. Academic Purpose & Justification</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Purpose / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Final Evaluation, AI Model Training Workshop"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  maxLength={255}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
                {validationErrors.purpose && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.purpose}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-400">
                    Detailed Notes / Special Setup Requirements (Optional)
                  </label>
                  <span className="text-xs text-gray-500">{description.length}/1000</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Specify any additional software, projector setup, seating arrangements, or lab assistant requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-xs text-rose-400">{validationErrors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/faculty/resource-requests')}
              disabled={submitting}
              className="border-slate-200 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Resource Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
