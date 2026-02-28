'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartAreaInteractive } from '@/components/dashboard/ChartAreaInteractive';
import {
  TrendingUp,
  Copy,
  ArrowUpRight,
  Star,
  Gift,
  RotateCw,
  MessageSquare,
  ScanLine,
  BarChart3,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';

interface DashboardUser {
  id: string;
  email?: string;
}

interface DashboardMerchant {
  id: string;
  business_name?: string;
  email: string;
}

interface ActivityItem {
  id: number;
  type: 'positive' | 'negative';
  rating: number;
  comment: string | null;
  date: string;
  customer_email: string | null;
  customer_phone: string | null;
}

interface ChartDataItem {
  date: string;
  positive: number;
  negative: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [merchant, setMerchant] = useState<DashboardMerchant | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    totalSpins: 0,
    rewardsRedeemed: 0,
    reviewsTrend: 0,
    positiveRatio: 0,
  });

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      let { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!merchantData) {
        // Try to find by email (user may have re-registered with new auth ID)
        const { data: merchantByEmail } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (merchantByEmail) {
          merchantData = merchantByEmail;
        } else {
          // No merchant at all - create one
          const { data: newMerchant, error: createError } = await supabase
            .from('merchants')
            .insert({
              id: user.id,
              email: user.email,
              business_name: user.user_metadata?.business_name || 'Mon Commerce',
              subscription_tier: 'starter',
              is_active: true
            })
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Failed to create merchant:', createError);
          } else {
            merchantData = newMerchant;
          }
        }
      }

      setMerchant(merchantData);

      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('rating, is_positive, created_at, comment, customer_email, customer_phone')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      const { count: spinsCount } = await supabase
        .from('spins')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      const { data: couponsData } = await supabase
        .from('coupons')
        .select('used')
        .eq('merchant_id', user.id);

      const totalReviews = feedbackData?.length || 0;
      const avgRating = (feedbackData || []).reduce((sum, f) => sum + f.rating, 0) / (totalReviews || 1);
      const totalSpins = spinsCount || 0;
      const rewardsRedeemed = couponsData?.filter(c => c.used).length || 0;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentReviews = feedbackData?.filter(f => new Date(f.created_at) >= thirtyDaysAgo).length || 0;
      const previousReviews = feedbackData?.filter(f => {
        const date = new Date(f.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length || 0;

      const reviewsTrend = previousReviews > 0
        ? Math.round(((recentReviews - previousReviews) / previousReviews) * 100)
        : (recentReviews > 0 ? 100 : 0);

      const positiveReviews = feedbackData?.filter(f => f.is_positive).length || 0;
      const positiveRatio = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;

      setStats({
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalSpins,
        rewardsRedeemed,
        reviewsTrend,
        positiveRatio,
      });

      const activity: ActivityItem[] = feedbackData?.slice(0, 5).map((f: { is_positive: boolean; rating: number; comment: string | null; created_at: string; customer_email: string | null; customer_phone: string | null }, idx: number) => ({
        id: idx,
        type: f.is_positive ? 'positive' as const : 'negative' as const,
        rating: f.rating,
        comment: f.comment,
        date: f.created_at,
        customer_email: f.customer_email,
        customer_phone: f.customer_phone,
      })) || [];

      setRecentActivity(activity);

      const chartMap = new Map<string, { date: string; positive: number; negative: number }>();
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);

      for (let d = new Date(ninetyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        chartMap.set(dateStr, { date: dateStr, positive: 0, negative: 0 });
      }

      feedbackData?.forEach((f: any) => {
        const dateStr = new Date(f.created_at).toISOString().split('T')[0];
        if (chartMap.has(dateStr)) {
          const entry = chartMap.get(dateStr)!;
          if (f.is_positive) {
            entry.positive += 1;
          } else {
            entry.negative += 1;
          }
        }
      });

      setChartData(Array.from(chartMap.values()));
    };

    checkAuth();
  }, [router]);

  if (!user || !merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          {merchant === null && user !== null ? (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Erreur de chargement du profil</h3>
              <p className="text-slate-600 mb-6">
                Impossible de charger ou creer votre profil marchand. Veuillez contacter le support ou essayer de vous reconnecter.
              </p>
              <Button onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}>
                Se deconnecter
              </Button>
            </div>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-600" />
              <p className="text-lg text-slate-600">Chargement...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total avis',
      value: stats.totalReviews,
      icon: MessageSquare,
      trend: stats.reviewsTrend,
      trendLabel: stats.reviewsTrend !== 0 ? `${stats.reviewsTrend > 0 ? '+' : ''}${stats.reviewsTrend}%` : null,
    },
    {
      label: 'Note moyenne',
      value: stats.avgRating,
      suffix: '/ 5.0',
      icon: Star,
      trend: null,
      trendLabel: stats.avgRating >= 4.5 ? 'Excellent' : null,
    },
    {
      label: 'Total tours de roue',
      value: stats.totalSpins,
      icon: RotateCw,
      trend: null,
      trendLabel: stats.totalSpins > 0 ? 'Actif' : null,
    },
    {
      label: 'Recompenses utilisees',
      value: stats.rewardsRedeemed,
      icon: Gift,
      trend: null,
      trendLabel: stats.positiveRatio > 0 ? `${stats.positiveRatio}% positifs` : null,
    },
  ];

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-violet-600" />
              </div>
              Bonjour, {merchant.business_name || 'Commercant'}
            </h1>
            <p className="text-slate-500 mt-1">
              Voici un apercu de votre activite
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentDate && (
              <span className="text-sm text-slate-500 px-4 py-2 rounded-xl border border-gray-200 shadow-sm bg-white">
                {currentDate}
              </span>
            )}
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white"
              >
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-600" />
                    </div>
                    {kpi.trendLabel && (
                      <Badge
                        className={`text-xs font-medium shadow-sm border ${
                          kpi.trend && kpi.trend < 0
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-violet-50 text-violet-700 border-violet-200'
                        }`}
                      >
                        {kpi.trend !== null && kpi.trend !== 0 && (
                          <TrendingUp className={`w-3 h-3 mr-1 ${kpi.trend < 0 ? 'rotate-180' : ''}`} />
                        )}
                        {kpi.trendLabel}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{kpi.value}</h3>
                      {kpi.suffix && <span className="text-sm text-slate-400">{kpi.suffix}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Chart */}
          <div className="group relative lg:col-span-2 border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Activite</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Avis des 90 derniers jours</p>
                </div>
              </div>
              <ChartAreaInteractive data={chartData} />
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Avis recents</h2>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                        idx < recentActivity.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${activity.rating >= 4 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}
                      `}>
                        {activity.rating}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.customer_email || activity.customer_phone || 'Client anonyme'}
                          </p>
                          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                            {new Date(activity.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {activity.comment || new Date(activity.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Aucun avis pour le moment
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-2 transition-all duration-200 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                  onClick={() => router.push('/dashboard/feedback')}
                >
                  Voir tous les avis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Link */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-violet-600" />
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: '/dashboard/scan', icon: ScanLine, label: 'Scanner', desc: 'Valider une carte client' },
                { href: '/dashboard/prizes', icon: Gift, label: 'Lots', desc: 'Gerer vos recompenses' },
                { href: '/dashboard/feedback', icon: Star, label: 'Avis', desc: 'Consulter les retours clients' },
                { href: '/dashboard/analytics', icon: BarChart3, label: 'Statistiques', desc: 'Analyser vos performances' },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white text-left"
                  >
                    <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="p-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                        <ActionIcon className="w-5 h-5 text-violet-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{action.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Link Card */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-violet-600" />
              Votre lien d&apos;avis
            </h3>
            <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-gradient-to-br from-[#0F172A] to-[#1e293b]">
              <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Lien public</h4>
                    <p className="text-sm text-slate-400 mt-1">Partagez ce lien avec vos clients</p>
                  </div>
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-violet-400" />
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-5 border border-white/10">
                  <code className="text-sm font-mono text-indigo-400 break-all">
                    {process.env.NEXT_PUBLIC_APP_URL}/rate/{user.id}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`);
                      alert('Lien copie !');
                    }}
                    className="bg-violet-600 text-white hover:bg-violet-700 border-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/qr')}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
