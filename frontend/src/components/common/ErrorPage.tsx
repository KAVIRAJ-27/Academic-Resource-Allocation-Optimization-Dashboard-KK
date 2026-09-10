import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorPageProps {
  statusCode?: 400 | 401 | 403 | 404 | 409 | 500;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ERROR_DETAILS: Record<
  number,
  { title: string; defaultMessage: string; badgeColor: string }
> = {
  400: {
    title: 'Bad Request',
    defaultMessage: 'The server could not understand the request due to invalid syntax or parameters.',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  401: {
    title: 'Unauthorized Session',
    defaultMessage: 'Your credentials have expired or authentication is required to access this resource.',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
  403: {
    title: 'Access Forbidden',
    defaultMessage: 'You do not have the required role permissions to view this administrative resource.',
    badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  },
  404: {
    title: 'Resource Not Found',
    defaultMessage: 'The requested route, allocation, or record could not be found on the AHRAO server.',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  409: {
    title: 'Conflict Detected',
    defaultMessage: 'Resource collision detected. The requested classroom, lab, or bed allocation has a scheduling conflict.',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  500: {
    title: 'Internal Server Error',
    defaultMessage: 'An unexpected system anomaly occurred. Backend telemetry has logged this incident.',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title,
  message,
  onRetry,
}) => {
  const navigate = useNavigate();
  const info = ERROR_DETAILS[statusCode] || ERROR_DETAILS[500];

  return (
    <div className="min-h-screen bg-[#080A0F] text-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#11141C] border border-[#1E2330] shadow-card text-teal-400 mx-auto">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-2 uppercase tracking-wider">
            HTTP Error {statusCode}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title || info.title}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
            {message || info.defaultMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </Button>

          {onRetry ? (
            <Button
              variant="primary"
              size="md"
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Try Again
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Dashboard Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
