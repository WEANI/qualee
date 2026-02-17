'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  KeyRound,
  Mail,
  Shield,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  LogOut,
  Clock,
  CalendarDays,
  Link2,
  CircleUserRound,
  ShieldCheck,
} from 'lucide-react';

type AccountTab = 'informations' | 'securite';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<AccountTab>('informations');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setMerchant(merchantData);
    };

    checkAuth();
  }, [router]);

  // Password validation
  const passwordChecks = useMemo(() => {
    if (!newPassword) return null;
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      matches: newPassword === confirmPassword && confirmPassword.length > 0,
    };
  }, [newPassword, confirmPassword]);

  const passwordStrength = useMemo(() => {
    if (!passwordChecks) return 0;
    let score = 0;
    if (passwordChecks.minLength) score++;
    if (passwordChecks.hasUppercase) score++;
    if (passwordChecks.hasNumber) score++;
    if (newPassword.length >= 12) score++;
    return score;
  }, [passwordChecks, newPassword]);

  const strengthLabel = passwordStrength <= 1 ? 'Faible' : passwordStrength <= 2 ? 'Moyen' : passwordStrength <= 3 ? 'Bon' : 'Fort';
  const strengthColor = passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-amber-500' : passwordStrength <= 3 ? 'bg-blue-500' : 'bg-emerald-500';

  const handleChangePassword = async () => {
    setMessage(null);

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès ! Vous devrez vous reconnecter.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return;

    setDeleting(true);
    setMessage(null);

    try {
      const { error: merchantError } = await supabase
        .from('merchants')
        .delete()
        .eq('id', user.id);

      if (merchantError) throw merchantError;

      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression du compte' });
      setDeleting(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setMessage(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      router.push('/auth/login');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la déconnexion' });
    }
  };

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: AccountTab; label: string; icon: typeof Shield; emoji: string }[] = [
    { key: 'informations', label: 'Informations', icon: Mail, emoji: '📋' },
    { key: 'securite', label: 'Sécurité', icon: Shield, emoji: '🛡️' },
  ];

  const PasswordCheck = ({ ok, text }: { ok: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
      <span className={ok ? 'text-emerald-700' : 'text-slate-500'}>{text}</span>
    </div>
  );

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .tab-content-enter {
          animation: fadeInTab 0.3s ease-out;
        }
        .account-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .account-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .account-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0D9488, #10B981);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .account-card:hover::before {
          transform: scaleX(1);
        }
        .account-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.12);
        }
        .danger-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .danger-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ef4444, #dc2626);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .danger-card:hover::before {
          transform: scaleX(1);
        }
        .danger-card:hover {
          border-color: #fca5a5;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CircleUserRound className="w-7 h-7 text-teal-600" />
            Mon Compte
          </h1>
          <p className="text-slate-500 mt-1">Gérez votre sécurité et vos paramètres de compte</p>
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-3 sm:p-4 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`font-medium text-sm ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}>{message.text}</p>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <nav
          role="tablist"
          className="flex gap-1 border-b-2 overflow-x-auto pb-0 scrollbar-hide"
          style={{ borderColor: '#ccfbf1' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => { setActiveTab(tab.key); setMessage(null); }}
              className="relative flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-t-lg"
              style={{
                color: activeTab === tab.key ? '#0D9488' : '#6b7280',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#0F766E';
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-base">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Active underline */}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left"
                style={{
                  backgroundColor: '#0D9488',
                  transform: activeTab === tab.key ? 'scaleX(1)' : 'scaleX(0)',
                }}
              />
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="tab-content-enter" key={activeTab}>

          {/* ===== TAB: INFORMATIONS ===== */}
          {activeTab === 'informations' && (
            <div className="space-y-5">

              {/* Adresse Email */}
              <Card className="account-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="account-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Adresse Email</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Email associé à votre compte</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-slate-500 mb-1">Email de connexion</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Email vérifié
                    </span>
                    <span className="text-xs text-slate-500">
                      le {new Date(user.email_confirmed_at || user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Changer mon mot de passe */}
              <Card className="account-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="account-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fef3c7' }}
                  >
                    <KeyRound className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Changer mon mot de passe</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Vous devrez vous reconnecter après cette action</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none pr-10"
                        style={{ borderColor: '#d1d5db' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#0D9488';
                          e.currentTarget.style.backgroundColor = '#f0fdfa';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none pr-10"
                        style={{ borderColor: '#d1d5db' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#0D9488';
                          e.currentTarget.style.backgroundColor = '#f0fdfa';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Real-time validation */}
                    {passwordChecks && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Force du mot de passe</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength <= 1 ? 'text-red-600' :
                              passwordStrength <= 2 ? 'text-amber-600' :
                              passwordStrength <= 3 ? 'text-blue-600' :
                              'text-emerald-600'
                            }`}>{strengthLabel}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${strengthColor}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <PasswordCheck ok={passwordChecks.minLength} text={`${newPassword.length} caractères (min: 8)`} />
                          <PasswordCheck ok={passwordChecks.hasUppercase} text="Contient des majuscules" />
                          <PasswordCheck ok={passwordChecks.hasNumber} text="Contient des chiffres" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none pr-10"
                        style={{ borderColor: '#d1d5db' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#0D9488';
                          e.currentTarget.style.backgroundColor = '#f0fdfa';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {confirmPassword && passwordChecks && (
                      <div className="mt-2">
                        <PasswordCheck
                          ok={passwordChecks.matches}
                          text={passwordChecks.matches ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setMessage(null);
                    }}
                    className="flex-1 sm:flex-initial transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                    className="flex-1 sm:flex-initial text-white transition-all duration-200"
                    style={{ backgroundColor: '#0D9488' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F766E'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D9488'; }}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Modifier le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ===== TAB: SECURITE ===== */}
          {activeTab === 'securite' && (
            <div className="space-y-5">

              {/* Informations de Sécurité */}
              <Card className="account-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="account-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Informations de Sécurité</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Statut de sécurité de votre compte</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-700">Compte sécurisé</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-gray-100">
                      <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Créé le</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-gray-100">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Dernière connexion</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-gray-100">
                    <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Appareils actifs</p>
                      <p className="text-sm font-medium text-slate-900">1 appareil connecté</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSignOutAllDevices}
                    className="w-full mt-2 text-amber-700 border-amber-300 hover:bg-amber-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnecter tous les appareils
                  </Button>
                </div>
              </Card>

              {/* Zone de Danger */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <h3 className="font-semibold text-red-900 text-sm sm:text-base">Zone de Danger</h3>
                </div>
                <p className="text-sm text-red-700">
                  Les actions de cette section sont irréversibles. Procédez avec prudence.
                </p>
              </div>

              {/* Supprimer mon compte */}
              <Card className="danger-card p-5 sm:p-6 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="account-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-red-900">Supprimer mon compte</h2>
                    <p className="text-xs sm:text-sm text-red-600">Toutes vos données seront définitivement supprimées</p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-red-800 mb-4">
                      Cette action supprimera définitivement votre compte, vos lots, vos avis clients, vos statistiques et toutes les données associées.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="border-red-300 text-red-700 hover:bg-red-100 transition-all duration-200"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Je comprends, continuer
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-300">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="font-semibold text-red-900 text-sm">Êtes-vous absolument sûr ?</p>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                      Cette action est <strong>irréversible</strong>. Elle supprimera définitivement votre compte et toutes les données associées.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-800 mb-1">
                        Tapez <strong>SUPPRIMER</strong> pour confirmer
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="SUPPRIMER"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-white transition-all duration-200 focus:outline-none"
                        style={{ borderColor: '#fca5a5' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#dc2626';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#fca5a5';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="flex-1 sm:flex-initial transition-all duration-200"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'SUPPRIMER' || deleting}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-initial transition-all duration-200"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Suppression...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer définitivement
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
