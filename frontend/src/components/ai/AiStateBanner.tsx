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
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-300">AI Intelligence Microservice Unavailable</h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              {message || 'AI insights and predictive models are temporarily offline. Core academic scheduling and hostel operations remain fully operational.'}
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  if (status === 'INSUFFICIENT_DATA') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-300">Minimum Historical Data Required</h4>
            <p className="text-xs text-blue-200/80 mt-0.5">
              {message || 'The current filter criteria contain fewer historical records than the minimum threshold (5 records) required for high-confidence machine learning prediction.'}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 shrink-0">
          Zero Fabricated Fallbacks
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-300">AI Evaluation Error</h4>
          <p className="text-xs text-rose-200/80 mt-0.5">{message || 'Unable to compute predictive insights.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold shrink-0 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
