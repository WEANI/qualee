'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, Calendar, MapPin, Star, Music, Instagram as InstagramIcon, Globe, MessageCircle, Palette, Save, Compass } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const PLATFORMS = [
  { value: 'google_maps', label: 'Avis Google', icon: MapPin, color: 'bg-red-500' },
  { value: 'tripadvisor', label: 'TripAdvisor', icon: Star, color: 'bg-green-500' },
  { value: 'tiktok', label: 'TikTok', icon: Music, color: 'bg-black' },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon, color: 'bg-pink-500' },
];

export default function StrategyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Workflow mode: 'web' or 'whatsapp'
  const [workflowMode, setWorkflowMode] = useState<'web' | 'whatsapp'>('web');

  // Logo background color
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#FFFFFF');

  // Redirect URLs
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [tripadvisorUrl, setTripadvisorUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // Weekly schedule: array of 7 days, each with a platform
  const [weeklySchedule, setWeeklySchedule] = useState<string[]>(
    Array(7).fill('google_maps')
  );

  // Current day index (0 = Monday, 6 = Sunday) - computed client-side to avoid hydration mismatch
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);

  // Set current day index on client-side only
  useEffect(() => {
    const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0 = Monday, 6 = Sunday
    setCurrentDayIndex(dayIndex);
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

      // Load workflow mode
      setWorkflowMode(merchantData?.workflow_mode || 'web');

      // Load logo background color
      setLogoBackgroundColor(merchantData?.logo_background_color || '#FFFFFF');

      // Load redirect URLs
      setGoogleMapsUrl(merchantData?.google_maps_url || '');
      setTripadvisorUrl(merchantData?.tripadvisor_url || '');
      setTiktokUrl(merchantData?.tiktok_url || '');
      setInstagramUrl(merchantData?.instagram_url || '');

      // Load weekly schedule
      if (merchantData?.weekly_schedule) {
        try {
          const schedule = JSON.parse(merchantData.weekly_schedule);
          if (Array.isArray(schedule) && schedule.length === 7) {
            setWeeklySchedule(schedule);
          }
        } catch {
          // Invalid schedule format, use defaults
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleDayChange = (dayIndex: number, platform: string) => {
    const newSchedule = [...weeklySchedule];
    newSchedule[dayIndex] = platform;
    setWeeklySchedule(newSchedule);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const updates: any = {
        workflow_mode: workflowMode,
        logo_background_color: logoBackgroundColor || '#FFFFFF',
        google_maps_url: googleMapsUrl || null,
        tripadvisor_url: tripadvisorUrl || null,
        tiktok_url: tiktokUrl || null,
        instagram_url: instagramUrl || null,
        weekly_schedule: JSON.stringify(weeklySchedule),
      };

      const { error } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Strategie sauvegardee avec succes !' });

      // Refresh merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setMerchant(merchantData);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Echec de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = (platformValue: string) => {
    return PLATFORMS.find(p => p.value === platformValue) || PLATFORMS[0];
  };

  // Input focus/blur helpers
  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#4361EE';
    e.currentTarget.style.backgroundColor = '#f0f0ff';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.15)';
  };
  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#d1d5db';
    e.currentTarget.style.backgroundColor = '#f9fafb';
    e.currentTarget.style.boxShadow = 'none';
  };

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4361EE' }} />
        </div>
      </DashboardLayout>
    );
  }

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
        .strategy-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .strategy-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #4361EE, #7209B7);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .strategy-card:hover::before {
          transform: scaleX(1);
        }
        .strategy-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
        }
        .strategy-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .strategy-content {
          animation: fadeInTab 0.3s ease-out;
        }
        .day-card {
          transition: all 0.3s ease;
        }
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
          border-color: #4361EE !important;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 strategy-content">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-7 h-7" style={{ color: '#4361EE' }} />
            Strategie de Redirection
          </h1>
          <p className="text-slate-500 mt-1">Configurez vos liens et planifiez automatiquement vos redirections sur 7 jours</p>
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

        {/* Workflow Mode Selection */}
        <Card className="strategy-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="strategy-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <Globe className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Mode de Workflow</h2>
              <p className="text-xs sm:text-sm text-slate-500">Choisissez comment vos clients recevront le lien vers la roue apres avoir laisse un avis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Web Mode */}
            <button
              type="button"
              onClick={() => setWorkflowMode('web')}
              className="p-4 rounded-xl border-2 text-left transition-all duration-200"
              style={{
                borderColor: workflowMode === 'web' ? '#4361EE' : '#e5e7eb',
                backgroundColor: workflowMode === 'web' ? '#f0f0ff' : 'white',
              }}
              onMouseEnter={(e) => {
                if (workflowMode !== 'web') {
                  e.currentTarget.style.borderColor = '#a5b4fc';
                  e.currentTarget.style.backgroundColor = '#fafafe';
                }
              }}
              onMouseLeave={(e) => {
                if (workflowMode !== 'web') {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: workflowMode === 'web' ? '#4361EE' : '#e5e7eb' }}
                >
                  <Globe className={`w-5 h-5 ${workflowMode === 'web' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Mode Web</h4>
                  <p className="text-xs text-slate-500">Workflow actuel</p>
                </div>
                {workflowMode === 'web' && (
                  <Check className="w-5 h-5 ml-auto" style={{ color: '#4361EE' }} />
                )}
              </div>
              <p className="text-sm text-slate-500">
                Apres l&apos;avis Google, le client voit un timer de 15 secondes puis clique sur un bouton pour acceder a la roue.
              </p>
            </button>

            {/* WhatsApp Mode */}
            <button
              type="button"
              onClick={() => setWorkflowMode('whatsapp')}
              className="p-4 rounded-xl border-2 text-left transition-all duration-200"
              style={{
                borderColor: workflowMode === 'whatsapp' ? '#22c55e' : '#e5e7eb',
                backgroundColor: workflowMode === 'whatsapp' ? '#f0fdf4' : 'white',
              }}
              onMouseEnter={(e) => {
                if (workflowMode !== 'whatsapp') {
                  e.currentTarget.style.borderColor = '#86efac';
                  e.currentTarget.style.backgroundColor = '#fafafe';
                }
              }}
              onMouseLeave={(e) => {
                if (workflowMode !== 'whatsapp') {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: workflowMode === 'whatsapp' ? '#22c55e' : '#e5e7eb' }}
                >
                  <MessageCircle className={`w-5 h-5 ${workflowMode === 'whatsapp' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Mode WhatsApp</h4>
                  <p className="text-xs text-slate-500">Nouveau</p>
                </div>
                {workflowMode === 'whatsapp' && (
                  <Check className="w-5 h-5 text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-slate-500">
                Apres l&apos;avis Google, le client recoit automatiquement un message WhatsApp avec le lien vers la roue.
              </p>
            </button>
          </div>

          {/* WhatsApp Configuration */}
          {workflowMode === 'whatsapp' && (
            <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl space-y-4">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Configuration WhatsApp
              </h4>

              <div className="bg-white border border-green-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-slate-700">
                  <strong>Messages automatiques</strong> — Le contenu du message WhatsApp s&apos;adapte automatiquement selon le contexte :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="font-medium text-green-800 mb-1">Nouveau client</p>
                    <p className="text-slate-600 text-xs">
                      &quot;Merci pour votre avis ! Tournez la roue pour gagner un cadeau. Votre carte fidelite est prete !&quot;
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="font-medium text-blue-800 mb-1">Client fidele</p>
                    <p className="text-slate-600 text-xs">
                      &quot;Bon retour ! Tournez la roue pour tenter de gagner un cadeau. Consultez votre carte fidelite.&quot;
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  Les messages sont traduits automatiquement (FR, EN, TH, ES, PT) selon la langue du client
                </p>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f0ff', border: '1px solid #e8e6ff' }}>
                <p className="text-sm" style={{ color: '#4361EE' }}>
                  <strong>Fonctionnement :</strong> Le client entre son numero WhatsApp au lieu de son email.
                  Apres l&apos;avis, il recoit un message WhatsApp avec 2 boutons : <strong>Tourner la Roue</strong> et <strong>Ma Carte Fidelite</strong>.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Logo Background Color */}
        <Card className="strategy-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="strategy-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <Palette className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Couleur de Fond du Logo</h2>
              <p className="text-xs sm:text-sm text-slate-500">Definissez la couleur de fond du cercle qui contient votre logo sur la roue et la page coupon</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Couleur :</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={logoBackgroundColor}
                  onChange={(e) => setLogoBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 transition-colors duration-200"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={(e) => { (e.currentTarget as any).style.borderColor = '#4361EE'; }}
                  onBlur={(e) => { (e.currentTarget as any).style.borderColor = '#d1d5db'; }}
                />
                <input
                  type="text"
                  value={logoBackgroundColor}
                  onChange={(e) => setLogoBackgroundColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-28 px-3 py-2.5 border rounded-lg text-sm font-mono bg-gray-50 transition-all duration-200 focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Apercu :</span>
              <div
                className="w-16 h-16 rounded-full border-4 border-[#ffd700] flex items-center justify-center shadow-lg"
                style={{ backgroundColor: logoBackgroundColor }}
              >
                {merchant?.logo_url ? (
                  <img
                    src={merchant.logo_url}
                    alt="Logo"
                    className="w-12 h-12 object-contain rounded-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Logo</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {[
              { label: 'Blanc', value: '#FFFFFF' },
              { label: 'Noir', value: '#000000' },
              { label: 'Or', value: '#FFD700' },
              { label: 'Bleu nuit', value: '#1a1a2e' },
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setLogoBackgroundColor(preset.value)}
                className="px-3 py-1.5 text-xs rounded-full border transition-all duration-200"
                style={{
                  backgroundColor: logoBackgroundColor === preset.value ? '#f0f0ff' : 'white',
                  borderColor: logoBackgroundColor === preset.value ? '#4361EE' : '#e5e7eb',
                  color: logoBackgroundColor === preset.value ? '#4361EE' : '#6b7280',
                }}
                onMouseEnter={(e) => {
                  if (logoBackgroundColor !== preset.value) {
                    e.currentTarget.style.borderColor = '#a5b4fc';
                    e.currentTarget.style.backgroundColor = '#fafafe';
                  }
                }}
                onMouseLeave={(e) => {
                  if (logoBackgroundColor !== preset.value) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Redirect URLs Configuration */}
        <Card className="strategy-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="strategy-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <MapPin className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Liens de Redirection</h2>
              <p className="text-xs sm:text-sm text-slate-500">Configurez les URLs vers lesquelles rediriger vos clients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Google Reviews URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Google Reviews
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://g.page/your-business"
                className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>

            {/* TripAdvisor URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Star className="w-4 h-4 text-green-500" />
                TripAdvisor
              </label>
              <input
                type="url"
                value={tripadvisorUrl}
                onChange={(e) => setTripadvisorUrl(e.target.value)}
                placeholder="https://www.tripadvisor.com/..."
                className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>

            {/* TikTok URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Music className="w-4 h-4 text-black" />
                TikTok
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@your-account"
                className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>

            {/* Instagram URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <InstagramIcon className="w-4 h-4 text-pink-500" />
                Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/your-account"
                className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>
          </div>
        </Card>

        {/* Weekly Schedule */}
        <Card className="strategy-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="strategy-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Planification Automatique (7 jours)</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Selectionnez la plateforme de redirection pour chaque jour de la semaine.
                Le systeme utilisera automatiquement le bon lien selon le jour.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DAYS.map((day, index) => {
              const selectedPlatform = getPlatformInfo(weeklySchedule[index]);
              const Icon = selectedPlatform.icon;
              const isToday = currentDayIndex === index;

              return (
                <div
                  key={index}
                  className="day-card border-2 rounded-xl p-4"
                  style={{
                    borderColor: isToday ? '#4361EE' : '#e5e7eb',
                    backgroundColor: isToday ? '#f0f0ff' : 'white',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{day}</span>
                      {isToday && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#4361EE', color: 'white' }}
                        >
                          Aujourd&apos;hui
                        </span>
                      )}
                    </div>
                    <div className={`w-8 h-8 ${selectedPlatform.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <select
                    value={weeklySchedule[index]}
                    onChange={(e) => handleDayChange(index, e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 transition-all duration-200 focus:outline-none"
                    style={{ borderColor: '#d1d5db' }}
                    onFocus={inputFocusStyle}
                    onBlur={inputBlurStyle}
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-lg" style={{ backgroundColor: '#f0f0ff', border: '1px solid #e8e6ff' }}>
            <p className="text-sm" style={{ color: '#4361EE' }}>
              <strong>Astuce :</strong> Le systeme detecte automatiquement le jour de la semaine et redirige vos clients
              vers la plateforme configuree. Par exemple, si vous configurez &quot;TikTok&quot; pour le vendredi, tous les clients
              qui notent 4-5 etoiles le vendredi seront rediriges vers votre TikTok !
            </p>
          </div>
        </Card>

        {/* Current Day Preview */}
        {currentDayIndex !== null && (
          <Card
            className="strategy-card p-5 sm:p-6 border rounded-xl"
            style={{ borderColor: '#e8e6ff', background: 'linear-gradient(135deg, #f0f0ff, #EFF6FF)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Aujourd&apos;hui ({DAYS[currentDayIndex]})</h3>
                <p className="text-sm text-slate-500">
                  Les clients seront rediriges vers :
                  <span className="font-bold ml-1" style={{ color: '#4361EE' }}>
                    {getPlatformInfo(weeklySchedule[currentDayIndex]).label}
                  </span>
                </p>
              </div>
              <div className={`w-14 h-14 ${getPlatformInfo(weeklySchedule[currentDayIndex]).color} rounded-full flex items-center justify-center shadow-lg`}>
                {React.createElement(getPlatformInfo(weeklySchedule[currentDayIndex]).icon, {
                  className: "w-7 h-7 text-white"
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Save Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            className="transition-all duration-200"
            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4361EE';
              e.currentTarget.style.color = '#4361EE';
              e.currentTarget.style.backgroundColor = '#f0f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => {
              setWorkflowMode(merchant.workflow_mode || 'web');
              setLogoBackgroundColor(merchant.logo_background_color || '#FFFFFF');
              setGoogleMapsUrl(merchant.google_maps_url || '');
              setTripadvisorUrl(merchant.tripadvisor_url || '');
              setTiktokUrl(merchant.tiktok_url || '');
              setInstagramUrl(merchant.instagram_url || '');
              if (merchant.weekly_schedule) {
                try {
                  const schedule = JSON.parse(merchant.weekly_schedule);
                  setWeeklySchedule(schedule);
                } catch {
                  setWeeklySchedule(Array(7).fill('google_maps'));
                }
              }
            }}
          >
            Reinitialiser
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto text-white"
            style={{ backgroundColor: '#4361EE' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3A0CA3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE'; }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Sauvegarder la Strategie</>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
