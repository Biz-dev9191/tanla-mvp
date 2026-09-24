import React, { useState } from 'react';
import { ChannelMessage } from '@/core/types';
import { PhoneCall, Play, Square, Volume2, Mic } from 'lucide-react';

interface VoiceSimulationProps {
  message: ChannelMessage;
  customerName: string;
}

export const VoiceSimulation: React.FC<VoiceSimulationProps> = ({ message, customerName }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.body);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-300 shadow-aurora-md overflow-hidden">
      {/* Voice Call Header */}
      <div className="bg-aurora-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <PhoneCall strokeWidth={1.5} className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs">Automated Voice Broadcast</h4>
            <p className="text-[10px] text-white/80 font-mono">Recipient: {customerName}</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20">
          Simulated Channel
        </span>
      </div>

      {/* Voice Script */}
      <div className="p-5 space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-aurora-neutral-500 uppercase tracking-wide block mb-1">
            Agent Spoken Script:
          </span>
          <div className="p-3.5 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 text-xs text-aurora-neutral-900 leading-relaxed font-sans italic">
            "{message.body}"
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-3 bg-aurora-primary-light rounded-lg border border-aurora-primary/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 strokeWidth={1.5} className={`w-4 h-4 text-aurora-primary ${isPlaying ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-semibold text-aurora-neutral-900">
              {isPlaying ? 'Synthesizing Audio Playback...' : 'Interactive Voice Playback'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSpeak}
            className="px-3 py-1.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded text-xs font-bold flex items-center space-x-1 shadow-sm transition"
          >
            {isPlaying ? (
              <>
                <Square strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                <span>Play Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-2.5 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-center text-[10px] text-aurora-neutral-500 font-mono">
        Phonetically calibrated for IVR / Automated Call Server
      </div>
    </div>
  );
};
