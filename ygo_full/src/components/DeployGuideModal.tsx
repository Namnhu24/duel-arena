/**
 * DeployGuideModal - Hosting & Custom Domain Deployment Guide (Mode 4)
 */

import React, { useState } from 'react';
import { Globe, Server, Cloud, Download, Check, Copy, ExternalLink, X, Smartphone, Laptop } from 'lucide-react';
import { sound } from '../utils/audio';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string) => {
    sound.playPhase();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#091524] border border-[#3b7294] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173852] to-[#0c1f2e] px-6 py-4 border-b border-[#3b7294] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-black text-xl text-amber-200">
                DEPLOYMENT & HOSTING GUIDE
              </h2>
              <span className="text-[10px] text-stone-300 font-semibold">
                How to publish your Yu-Gi-Oh! Web App to custom domains and mobile devices.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPhase();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#102436] hover:bg-[#1a3854] text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-stone-300 leading-relaxed">
          {/* 1. Live Web App Status */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/60">
            <h4 className="font-['Orbitron'] font-bold text-sm text-emerald-300 mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>CURRENT LIVE WEB URL (READY TO SHARE)</span>
            </h4>
            <p className="text-stone-300 mb-2">
              Your application is already deployed live on Google Cloud Run. Anyone can play it in any browser:
            </p>
            <div className="flex items-center justify-between p-2.5 bg-[#05111a] rounded-xl border border-emerald-600/50">
              <span className="font-mono text-[11px] text-emerald-200 truncate pr-2">
                {window.location.origin}
              </span>
              <button
                onClick={() => copyCommand(window.location.origin)}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-lg transition-colors flex-shrink-0"
              >
                {copiedCmd === window.location.origin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === window.location.origin ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* 2. Deploy to Vercel (1-Minute Free Deploy) */}
          <div className="p-4 rounded-2xl bg-[#0a1829] border border-[#234b6b]">
            <h4 className="font-['Orbitron'] font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>Option A: Free 1-Click Deploy to Vercel</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-300 pl-1">
              <li>Download the project folder or push it to your GitHub repository.</li>
              <li>Go to <strong className="text-white">vercel.com</strong> and click <strong>"Add New Project"</strong>.</li>
              <li>Select this repository, leave settings as default (Framework: Vite).</li>
              <li>Click <strong>"Deploy"</strong>. Within 30 seconds you will get a free <code className="text-amber-300">your-name.vercel.app</code> URL!</li>
            </ol>
            <div className="mt-3 flex items-center justify-between p-2 bg-[#050e18] rounded-xl border border-[#22445e]">
              <code className="text-amber-300 font-mono text-[11px]">npx vercel --prod</code>
              <button
                onClick={() => copyCommand('npx vercel --prod')}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:text-white px-2 py-0.5"
              >
                {copiedCmd === 'npx vercel --prod' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
          </div>

          {/* 3. Connect Custom Domain */}
          <div className="p-4 rounded-2xl bg-[#0a1829] border border-[#234b6b]">
            <h4 className="font-['Orbitron'] font-bold text-sm text-amber-300 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Option B: Connect Your Custom Domain (.com / .vn / .net)</span>
            </h4>
            <p className="text-stone-300 mb-2">
              Once deployed on Vercel or Cloudflare Pages:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-300 pl-1">
              <li>Go to Project Settings &gt; <strong>Domains</strong>.</li>
              <li>Enter your domain (e.g. <strong className="text-amber-200">yugioh-arena.com</strong>).</li>
              <li>Add the 2 DNS records (A Record: <code className="text-sky-300">76.76.21.21</code> or CNAME) in your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.).</li>
            </ul>
          </div>

          {/* 4. Install as Mobile / Desktop App (PWA) */}
          <div className="p-4 rounded-2xl bg-[#0a1829] border border-[#234b6b]">
            <h4 className="font-['Orbitron'] font-bold text-sm text-purple-300 mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Install as App on Phone / Tablet / Desktop (PWA)</span>
            </h4>
            <p className="text-stone-300 mb-2">
              You and your friends can install this directly onto your smartphone home screen as an app:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-[#050e18] border border-[#1e3b52]">
                <strong className="text-white block mb-1">On iOS (iPhone / iPad):</strong>
                <span>Open in Safari &gt; Tap the <strong className="text-sky-300">Share</strong> icon &gt; Tap <strong className="text-amber-300">"Add to Home Screen"</strong>.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#050e18] border border-[#1e3b52]">
                <strong className="text-white block mb-1">On Android / PC Chrome:</strong>
                <span>Tap the 3 dots menu &gt; Tap <strong className="text-amber-300">"Install App"</strong> or click the install icon in the address bar.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
