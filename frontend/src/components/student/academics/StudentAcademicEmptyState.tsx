import React from 'react';
import { EmptyState } from '../../ui';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';

interface StudentAcademicEmptyStateProps {
  type: 'subjects' | 'timetable' | 'error' | 'filter';
  onRetry?: () => void;
  onClearFilters?: () => void;
}

export const StudentAcademicEmptyState: React.FC<StudentAcademicEmptyStateProps> = ({
  type,
  onRetry,
  onClearFilters,
}) => {
  if (type === 'subjects') {
    return (
      <EmptyState
        title="No Subjects Assigned"
        description="No registered academic courses found for your selected semester. New subjects will appear once confirmed by your department."
        icon={BookOpen}
        compact
      />
    );
  }

  if (type === 'timetable') {
    return (
      <EmptyState
        title="No Timetable Published"
        description="Your section's weekly lecture and laboratory schedule has not yet been published by the academic department."
        icon={Clock}
        compact
      />
    );
  }

  if (type === 'filter') {
    return (
      <EmptyState
        title="No Matching Subjects Found"
        description="None of your registered subjects match the search query or semester filter applied."
        icon={BookOpen}
        compact
        actionLabel={onClearFilters ? 'Clear Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <EmptyState
      title="Academic Information Unavailable"
      description="Unable to retrieve verified academic records from the server at this time."
      icon={AlertCircle}
      compact
      actionLabel={onRetry ? 'Retry Connection' : undefined}
      onAction={onRetry}
    />
  );
};
