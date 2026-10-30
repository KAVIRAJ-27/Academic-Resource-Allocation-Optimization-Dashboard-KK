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
    badgeColor: 'border-[#EED9B2] text-[#A87928] bg-[#FAF4E8]',
  },
  401: {
    title: 'Unauthorized Session',
    defaultMessage: 'Your credentials have expired or authentication is required to access this resource.',
    badgeColor: 'border-[#ECC6C6] text-[#B44747] bg-[#FDF0F0]',
  },
  403: {
    title: 'Access Forbidden',
    defaultMessage: 'You do not have the required role permissions to view this administrative resource.',
    badgeColor: 'border-[#EED9B2] text-[#A87928] bg-[#FAF4E8]',
  },
  404: {
    title: 'Resource Not Found',
    defaultMessage: 'The requested route, allocation, or record could not be found on the AHRAO server.',
    badgeColor: 'border-[#C6D5E2] text-[#657C91] bg-[#EFF4F8]',
  },
  409: {
    title: 'Conflict Detected',
    defaultMessage: 'Resource collision detected. The requested classroom, lab, or bed allocation has a scheduling conflict.',
    badgeColor: 'border-[#D8C9A8] text-[#B8A16A] bg-[#F4F0E6]',
  },
  500: {
    title: 'Internal Server Error',
    defaultMessage: 'An unexpected system anomaly occurred. Backend telemetry has logged this incident.',
    badgeColor: 'border-[#ECC6C6] text-[#B44747] bg-[#FDF0F0]',
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
    <div className="min-h-screen bg-[#FFFEFA] text-[#202020] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-[#D8C9A8] shadow-card text-[#B44747] mx-auto">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-2 uppercase tracking-wider ${info.badgeColor}`}>
            HTTP Error {statusCode}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#202020]">
            {title || info.title}
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed max-w-sm mx-auto">
            {message || info.defaultMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry ? (
            <Button variant="primary" size="md" onClick={onRetry} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry Operation
            </Button>
          ) : (
            <Button variant="outline" size="md" onClick={() => navigate(-1)} className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Go Back
            </Button>
          )}

          <Button variant="secondary" size="md" onClick={() => navigate('/')} className="w-full sm:w-auto">
            <Home className="w-4 h-4 mr-1.5" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};
