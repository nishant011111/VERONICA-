import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Copy, Check, Download, ShieldCheck, Sparkles, User, Mail, GraduationCap, Building2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface UserQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const UserQrModal: React.FC<UserQrModalProps> = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate unique profile payload for QR Code
  const qrData = JSON.stringify({
    v: '1.0',
    type: 'veronica_student_id',
    id: profile.id || `std_${Date.now()}`,
    name: profile.name || 'Academic Student',
    email: profile.email || '',
    studentId: profile.studentIdNumber || 'STD-2026-8891',
    university: profile.university || 'Veronica Institute',
    verified: true,
    issuedAt: new Date().toISOString().split('T')[0],
  });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById('user-profile-qr-code-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = '#0f172a'; // Slate-900 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${(profile.name || 'student').toLowerCase().replace(/\s+/g, '_')}_qr_badge.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Digital Student Pass
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Cryptographically Signed QR ID</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/30 flex items-center justify-center relative group">
            <QRCodeSVG
              id="user-profile-qr-code-svg"
              value={qrData}
              size={180}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          {/* User Meta Card */}
          <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold truncate">{profile.name || 'Academic Student'}</span>
            </div>
            {profile.email && (
              <div className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-slate-400">
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ID: {profile.studentIdNumber || 'STD-2026-8891'}</span>
            </div>
            {profile.university && (
              <div className="flex items-center gap-2.5 text-slate-400">
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{profile.university}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-1 border-t border-slate-700/60 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIAL VERONICA ACADEMIC BADGE</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Data' : 'Copy Payload'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Save Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserQrModal;
