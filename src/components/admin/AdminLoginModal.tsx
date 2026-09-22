import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { dataService } from '../../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const isValid = await dataService.verifyAdminLogin(email, password);
      if (isValid) {
        onLoginSuccess();
        onClose();
      } else {
        setErrorMessage(
          'Email atau kata sandi admin tidak valid. Silakan periksa kembali.'
        );
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memverifikasi akun admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-tight">Login Admin</h3>
          <p className="text-xs text-red-100 mt-1">
            Panel Pengelolaan Data GIS & Tempat PKL SMKN 1 Songgom
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Email / Username Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan email admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard Admin'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
