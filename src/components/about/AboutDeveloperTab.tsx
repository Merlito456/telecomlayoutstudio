import React from 'react';
import { Mail, Award, Globe, Copy } from 'lucide-react';

interface AboutDeveloperTabProps {
  copiedEmail: boolean;
  onCopyEmail: () => void;
}

export const AboutDeveloperTab: React.FC<AboutDeveloperTabProps> = ({
  copiedEmail,
  onCopyEmail,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 border border-sky-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-sky-400 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-sky-500/25 shrink-0 border-2 border-white/20">
            JR
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
                Engr. John Carlo Rabanes
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Licensed ECE
              </span>
            </div>
            <p className="text-sm font-semibold text-sky-400">
              OLT Rollout Engineer • Nokia Shanghai Bell
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Specializing in Optical Line Terminal (OLT) infrastructure, FTTH network architecture, telecom compound engineering, outside plant (OSP) deployment, and digital drafting automation.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-mono select-all">rabanes.johncarlo4@gmail.com</span>
          </div>

          <button
            type="button"
            onClick={onCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
          </button>
        </div>
      </div>

      {/* Company & Engineering Endorsement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Affiliation</span>
          </div>
          <div className="text-sm font-bold text-white">Nokia Shanghai Bell</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Telecommunications Network Infrastructure, Advanced Optical Access Solutions, and Turnkey Site Rollout Engineering.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Professional Scope</span>
          </div>
          <div className="text-sm font-bold text-white">Electronics &amp; Communications Engineer</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Licensed ECE credential with extensive field experience across fiber transmission, site power systems, and telecom layout engineering.
          </p>
        </div>
      </div>
    </div>
  );
};
