import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFEFA] text-[#202020] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-[#D8C9A8] shadow-card text-[#B8A16A] mx-auto">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border border-[#D8C9A8] text-[#202020] bg-[#F4F0E6] uppercase tracking-wider">
            404 Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#202020]">
            Page Not Found
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed max-w-sm mx-auto">
            The route or resource you are seeking does not exist on the AHRAO dashboard platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="md" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/')} className="w-full sm:w-auto">
            <Home className="w-4 h-4 mr-1.5" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};
