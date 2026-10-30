import React from 'react';
import { AlertTriangle, Database, RefreshCw, Sparkles } from 'lucide-react';

interface AiStateBannerProps {
  status: 'SUCCESS' | 'INSUFFICIENT_DATA' | 'AI_SERVICE_UNAVAILABLE' | 'ERROR';
  message?: string;
  onRetry?: () => void;
}

export const AiStateBanner: React.FC<AiStateBannerProps> = ({
  status,
  message,
  onRetry,
}) => {
  if (status === 'SUCCESS') {
    return null;
  }

  if (status === 'AI_SERVICE_UNAVAILABLE') {
    return (
      <div className="bg-[#FAF7F0] border border-[#E8DEC8] rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-white text-[#A87928] shrink-0 border border-[#E8DEC8]">
            <AlertTriangle className="w-5 h-5 text-[#A87928]" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#202020]">AI Intelligence Microservice Unavailable</h4>
            <p className="text-xs text-[#555555] mt-0.5">
              {message || 'AI insights and predictive models are temporarily offline. Core academic scheduling and hostel operations remain fully operational.'}
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8] text-xs font-semibold shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#B8A16A]" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  if (status === 'INSUFFICIENT_DATA') {
    return (
      <div className="bg-[#EFF3F6] border border-[#C2D1DD] rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-white text-[#657C91] shrink-0 border border-[#C2D1DD]">
            <Database className="w-5 h-5 text-[#657C91]" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#202020]">Minimum Historical Data Required</h4>
            <p className="text-xs text-[#555555] mt-0.5">
              {message || 'The current filter criteria contain fewer historical records than the minimum threshold (5 records) required for high-confidence machine learning prediction.'}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#657C91] bg-white px-2.5 py-1 rounded border border-[#C2D1DD] shrink-0 font-medium">
          Zero Fabricated Fallbacks
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF0F0] border border-[#ECC0C0] rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-white text-[#B44747] shrink-0 border border-[#ECC0C0]">
          <AlertTriangle className="w-5 h-5 text-[#B44747]" />
        </div>
        <div>
          <h4 className="text-sm font-serif font-bold text-[#202020]">AI Evaluation Error</h4>
          <p className="text-xs text-[#555555] mt-0.5">{message || 'Unable to compute predictive insights.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#F4F0E6] text-[#202020] border border-[#ECC0C0] text-xs font-semibold shrink-0 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#B44747]" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
