'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Globe,
  Bell,
  Shield,
  Save,
} from 'lucide-react';

const TIMEZONES = [
  { value: 'Africa/Libreville', label: 'Africa/Libreville (UTC+1)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (UTC+1)' },
  { value: 'Africa/Douala', label: 'Africa/Douala (UTC+1)' },
  { value: 'Africa/Kinshasa', label: 'Africa/Kinshasa (UTC+1)' },
  { value: 'Africa/Brazzaville', label: 'Africa/Brazzaville (UTC+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1/+2)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; sql?: string } | null>(null);

  // Language & Region
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Libreville');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // Image uploads (kept from original)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');

  const loadSettings = useCallback(() => {
    // Load from localStorage
    const saved = localStorage.getItem('qualee_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications);
        if (parsed.reviewAlerts !== undefined) setReviewAlerts(parsed.reviewAlerts);
        if (parsed.weeklySummary !== undefined) setWeeklySummary(parsed.weeklySummary);
      } catch { /* ignore */ }
    }
  }, []);

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
      if (merchantData?.logo_url) setLogoPreview(merchantData.logo_url);
      if (merchantData?.background_url) setBackgroundPreview(merchantData.background_url);
    };

    checkAuth();
    loadSettings();
  }, [router, loadSettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const target = 9 / 16;
        if (Math.abs(aspectRatio - target) > 0.15) {
          setMessage({
            type: 'warning',
            text: `Le ratio de l'image est ${(aspectRatio * 16 / 9).toFixed(2)}:16. Recommandé : 9:16 (format vertical)`
          });
        }
      };
      img.src = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('merchant-assets')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw new Error(uploadError.message || 'Erreur de téléchargement');

    const { data: { publicUrl } } = supabase.storage
      .from('merchant-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      // Save settings to localStorage
      localStorage.setItem('qualee_settings', JSON.stringify({
        language,
        timezone,
        emailNotifications,
        reviewAlerts,
        weeklySummary,
      }));

      // Save image uploads if any
      const updates: Record<string, string> = {};
      if (logoFile) {
        updates.logo_url = await uploadImage(logoFile);
      }
      if (backgroundFile) {
        updates.background_url = await uploadImage(backgroundFile);
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('merchants')
          .update(updates)
          .eq('id', user.id);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
      setLogoFile(null);
      setBackgroundFile(null);

      // Refresh
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (merchantData) setMerchant(merchantData);
    } catch (error: any) {
      if (error.message?.includes('row-level security') || error.message?.includes('StorageApiError')) {
        setMessage({
          type: 'warning',
          text: 'Configuration requise : les politiques de stockage sont manquantes.',
          sql: `-- Run this in your Supabase SQL Editor:\nINSERT INTO storage.buckets (id, name, public) VALUES ('merchant-assets', 'merchant-assets', true) ON CONFLICT (id) DO NOTHING;\n\nDROP POLICY IF EXISTS "Public Access" ON storage.objects;\nCREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'merchant-assets' );\n\nDROP POLICY IF EXISTS "Auth Upload" ON storage.objects;\nCREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'merchant-assets' AND auth.role() = 'authenticated' );\n\nDROP POLICY IF EXISTS "Auth Update" ON storage.objects;\nCREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'merchant-assets' AND auth.role() = 'authenticated' );`
        });
      } else {
        setMessage({ type: 'error', text: error.message || 'Échec de l\'enregistrement' });
      }
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-14 h-7 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-teal-500' : 'bg-slate-300'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${enabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
    </button>
  );

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  const selectedLang = LANGUAGES.find(l => l.value === language) || LANGUAGES[0];

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-600 mt-1">Paramètres généraux de l&apos;application</p>
        </div>

        {message && (
          <Card className={`p-3 sm:p-4 ${
            message.type === 'success' ? 'bg-teal-50 border-teal-200' :
            message.type === 'warning' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              ) : message.type === 'warning' ? (
                <div className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0">!</div>
              ) : (
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  message.type === 'success' ? 'text-teal-700' :
                  message.type === 'warning' ? 'text-amber-800' :
                  'text-red-700'
                }`}>{message.text}</p>
                {message.sql && (
                  <pre className="mt-2 p-3 bg-white/50 rounded border text-xs font-mono overflow-x-auto">
                    {message.sql}
                  </pre>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Section 1: Language & Region */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Langue & Région</h2>
              <p className="text-xs sm:text-sm text-slate-500">Configurez la langue et le fuseau horaire</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Langue de l&apos;application</p>
              </div>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-8 border border-slate-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer w-full sm:w-auto"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.flag} {lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 sm:pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Fuseau horaire</p>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="px-3 py-2.5 border border-slate-300 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 w-full sm:w-auto sm:min-w-[280px]"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Notifications */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-xs sm:text-sm text-slate-500">Gérez vos préférences de notifications</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">Notifications par email</p>
                <p className="text-xs sm:text-sm text-slate-500">Recevez les notifications par email</p>
              </div>
              <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">Alertes nouveaux avis</p>
                <p className="text-xs sm:text-sm text-slate-500">Soyez prévenu quand un client laisse un avis</p>
              </div>
              <Toggle enabled={reviewAlerts} onChange={setReviewAlerts} />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">Résumé hebdomadaire</p>
                <p className="text-xs sm:text-sm text-slate-500">Recevez un résumé hebdomadaire de performance</p>
              </div>
              <Toggle enabled={weeklySummary} onChange={setWeeklySummary} />
            </div>
          </div>
        </Card>

        {/* Section 3: Account */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Compte</h2>
              <p className="text-xs sm:text-sm text-slate-500">Informations de votre compte</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Email</p>
              <p className="text-sm font-medium text-slate-900 break-all">{user.email}</p>
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Account ID</p>
              <p className="text-xs sm:text-sm font-mono text-slate-700 break-all">{user.id}</p>
            </div>
          </div>
        </Card>

        {/* Section 4: Personnalisation (images) */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Personnalisation</h2>
              <p className="text-xs sm:text-sm text-slate-500">Logo et image de fond de votre page d&apos;évaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Logo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">Logo de l&apos;entreprise</p>
                <Badge variant="outline" className="text-xs">Carré</Badge>
              </div>
              {logoPreview && (
                <div className="relative w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                  <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-violet-500 transition-colors">
                <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600"><span className="text-violet-600 font-semibold">Télécharger</span></p>
                  <p className="text-xs text-slate-500">PNG, JPG jusqu&apos;à 5 Mo</p>
                </label>
              </div>
            </div>

            {/* Background */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">Image de fond</p>
                <Badge variant="outline" className="text-xs">9:16</Badge>
              </div>
              {backgroundPreview && (
                <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-3">
                  <img src={backgroundPreview} alt="Background" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <p className="text-white text-xs">Superposition 40%</p>
                  </div>
                </div>
              )}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-violet-500 transition-colors">
                <input type="file" id="background-upload" accept="image/*" onChange={handleBackgroundChange} className="hidden" />
                <label htmlFor="background-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600"><span className="text-violet-600 font-semibold">Télécharger</span></p>
                  <p className="text-xs text-slate-500">PNG, JPG (9:16) jusqu&apos;à 10 Mo</p>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
