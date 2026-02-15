'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Loader2,
  Globe,
  Bell,
  Shield,
  Save,
  Settings,
  Link2,
  CalendarDays,
  ExternalLink,
  Clock,
} from 'lucide-react';

type SettingsTab = 'general' | 'links' | 'planning';

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

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((_, i) => ({
  open: '09:00',
  close: i >= 5 ? '13:00' : '18:00',
  closed: i === 6,
}));

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Language & Region
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Libreville');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // Social links
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // Planning - Opening hours
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);

  const loadSettings = useCallback(() => {
    const saved = localStorage.getItem('qualee_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications);
        if (parsed.reviewAlerts !== undefined) setReviewAlerts(parsed.reviewAlerts);
        if (parsed.weeklySummary !== undefined) setWeeklySummary(parsed.weeklySummary);
        if (parsed.schedule) setSchedule(parsed.schedule);
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
      if (merchantData?.google_maps_url || merchantData?.google_review_link) setGoogleReviewLink(merchantData.google_maps_url || merchantData.google_review_link);
      if (merchantData?.tiktok_url) setTiktokUrl(merchantData.tiktok_url);
      if (merchantData?.instagram_url) setInstagramUrl(merchantData.instagram_url);
    };

    checkAuth();
    loadSettings();
  }, [router, loadSettings]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      // Save local settings to localStorage
      localStorage.setItem('qualee_settings', JSON.stringify({
        language,
        timezone,
        emailNotifications,
        reviewAlerts,
        weeklySummary,
        schedule,
      }));

      // Save social links to database
      if (activeTab === 'links') {
        const { error } = await supabase
          .from('merchants')
          .update({
            google_maps_url: googleReviewLink || null,
            google_review_link: googleReviewLink || null,
            tiktok_url: tiktokUrl || null,
            instagram_url: instagramUrl || null,
          })
          .eq('id', user.id);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });

      // Refresh merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (merchantData) setMerchant(merchantData);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Échec de l\'enregistrement' });
    } finally {
      setSaving(false);
    }
  };

  const updateScheduleDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map((day, i) => i === index ? { ...day, [field]: value } : day));
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ backgroundColor: enabled ? '#0D9488' : '#d1d5db' }}
    >
      <div
        className="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 absolute top-0.5"
        style={{ left: enabled ? '26px' : '2px' }}
      />
    </button>
  );

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: SettingsTab; label: string; icon: typeof Settings; emoji: string }[] = [
    { key: 'general', label: 'Général', icon: Settings, emoji: '⚙️' },
    { key: 'links', label: 'Liens', icon: Link2, emoji: '🔗' },
    { key: 'planning', label: 'Planification', icon: CalendarDays, emoji: '📅' },
  ];

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
        .settings-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .settings-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .settings-card::before {
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
        .settings-card:hover::before {
          transform: scaleX(1);
        }
        .settings-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-teal-600" />
            Paramètres
          </h1>
          <p className="text-slate-500 mt-1">Configurez les paramètres de votre application</p>
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-3 sm:p-4 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
            message.type === 'warning' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`font-medium text-sm ${
                message.type === 'success' ? 'text-emerald-700' :
                message.type === 'warning' ? 'text-amber-800' :
                'text-red-700'
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
                backgroundColor: activeTab === tab.key ? 'transparent' : 'transparent',
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

          {/* ===== TAB: GÉNÉRAL ===== */}
          {activeTab === 'general' && (
            <div className="space-y-5">

              {/* Langue & Région */}
              <Card className="settings-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="settings-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Globe className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Langue & Région</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configurez la langue et le fuseau horaire</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <label className="text-sm font-medium text-slate-700">Langue de l&apos;application</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-4 py-2.5 border rounded-lg text-sm bg-gray-50 transition-all duration-200 w-full sm:w-auto focus:outline-none"
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
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.flag} {lang.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <label className="text-sm font-medium text-slate-700">Fuseau horaire</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="px-3 py-2.5 border rounded-lg text-sm bg-gray-50 transition-all duration-200 w-full sm:w-auto sm:min-w-[280px] focus:outline-none"
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
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="settings-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="settings-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Bell className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Notifications</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Gérez vos préférences de notifications</p>
                  </div>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'Notifications par email', desc: 'Recevez les notifications par email', value: emailNotifications, onChange: setEmailNotifications },
                    { label: 'Alertes nouveaux avis', desc: 'Soyez prévenu quand un client laisse un avis', value: reviewAlerts, onChange: setReviewAlerts },
                    { label: 'Résumé hebdomadaire', desc: 'Recevez un résumé hebdomadaire de performance', value: weeklySummary, onChange: setWeeklySummary },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 py-4 px-3 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                      style={{ borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs sm:text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Toggle enabled={item.value} onChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Compte */}
              <Card className="settings-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="settings-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Compte</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Informations de votre compte</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{user.email}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-slate-500 mb-1">Account ID</p>
                    <p className="text-xs sm:text-sm font-mono text-slate-600 break-all">{user.id}</p>
                  </div>
                </div>
              </Card>

              {/* Save General */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto text-white"
                  style={{ backgroundColor: '#0D9488' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F766E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D9488'; }}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Enregistrer</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ===== TAB: LIENS ===== */}
          {activeTab === 'links' && (
            <div className="space-y-5">

              <Card className="settings-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="settings-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Link2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Liens de Redirection</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configurez vos liens vers les réseaux sociaux</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Google Reviews */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google Reviews
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={googleReviewLink}
                        onChange={(e) => setGoogleReviewLink(e.target.value)}
                        placeholder="https://g.page/r/votre-lien"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
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
                      {googleReviewLink && (
                        <a href={googleReviewLink} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* TikTok */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.82a4.83 4.83 0 0 1-1-.13z"/>
                      </svg>
                      TikTok
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="https://www.tiktok.com/@votre-compte"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
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
                      {tiktokUrl && (
                        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Instagram */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <defs>
                          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFDC80"/>
                            <stop offset="25%" stopColor="#F77737"/>
                            <stop offset="50%" stopColor="#E1306C"/>
                            <stop offset="75%" stopColor="#C13584"/>
                            <stop offset="100%" stopColor="#833AB4"/>
                          </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
                        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
                      </svg>
                      Instagram
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://www.instagram.com/votre-compte"
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
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
                      {instagramUrl && (
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Save Links */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto text-white"
                  style={{ backgroundColor: '#0D9488' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F766E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D9488'; }}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Enregistrer les liens</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ===== TAB: PLANIFICATION ===== */}
          {activeTab === 'planning' && (
            <div className="space-y-5">

              <Card className="settings-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="settings-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Horaires d&apos;ouverture</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Configurez vos horaires pour chaque jour de la semaine</p>
                  </div>
                </div>

                <div className="space-y-0">
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3.5 px-3 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                      style={{ borderBottom: i < 6 ? '1px solid #f3f4f6' : 'none' }}
                    >
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <span className="text-sm font-medium text-slate-800 w-24">{day}</span>
                        <button
                          type="button"
                          onClick={() => updateScheduleDay(i, 'closed', !schedule[i].closed)}
                          className="text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200"
                          style={{
                            backgroundColor: schedule[i].closed ? '#fee2e2' : '#dcfce7',
                            color: schedule[i].closed ? '#dc2626' : '#16a34a',
                          }}
                        >
                          {schedule[i].closed ? 'Fermé' : 'Ouvert'}
                        </button>
                      </div>

                      {!schedule[i].closed && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={schedule[i].open}
                            onChange={(e) => updateScheduleDay(i, 'open', e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                            style={{ borderColor: '#d1d5db' }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#0D9488';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                          <span className="text-slate-400 text-sm">-</span>
                          <input
                            type="time"
                            value={schedule[i].close}
                            onChange={(e) => updateScheduleDay(i, 'close', e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                            style={{ borderColor: '#d1d5db' }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#0D9488';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#d1d5db';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      )}

                      {schedule[i].closed && (
                        <div className="text-sm text-slate-400 italic">Aucun horaire</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Save Planning */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto text-white"
                  style={{ backgroundColor: '#0D9488' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F766E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D9488'; }}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Enregistrer les horaires</>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
