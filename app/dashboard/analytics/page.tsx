'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { ChartAreaInteractive } from '@/components/dashboard/ChartAreaInteractive';
import { TrendingUp, TrendingDown, Star, Gift, BarChart3, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  is_positive: boolean;
  created_at: string;
}

interface RatingDistribution {
  [key: number]: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [chartData, setChartData] = useState<Array<{ date: string; positive: number; negative: number }>>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    avgRating: 0,
    conversionRate: 0,
    totalSpins: 0,
    thisMonthReviews: 0,
    lastMonthReviews: 0,
    thisMonthPositive: 0,
    lastMonthPositive: 0,
  });
  const [loading, setLoading] = useState(true);

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

      // Fetch all feedback data
      const { data: allFeedback } = await supabase
        .from('feedback')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      const { data: spinsData } = await supabase
        .from('spins')
        .select('*')
        .eq('merchant_id', user.id);

      if (allFeedback) {
        setFeedbackData(allFeedback);

        // Calculate rating distribution
        const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        allFeedback.forEach((f) => {
          if (f.rating >= 1 && f.rating <= 5) {
            distribution[f.rating]++;
          }
        });
        setRatingDistribution(distribution);

        // Process chart data - last 90 days
        const chartMap = new Map<string, { date: string; positive: number; negative: number }>();
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        // Initialize all days with 0
        for (let d = new Date(ninetyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          chartMap.set(dateStr, { date: dateStr, positive: 0, negative: 0 });
        }

        // Fill with actual feedback data
        allFeedback.forEach((f) => {
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

        // Calculate date ranges for trends
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthFeedback = allFeedback.filter(f => new Date(f.created_at) >= thisMonthStart);
        const lastMonthFeedback = allFeedback.filter(f => {
          const date = new Date(f.created_at);
          return date >= lastMonthStart && date <= lastMonthEnd;
        });

        const totalReviews = allFeedback.length;
        const positiveReviews = allFeedback.filter(f => f.is_positive).length;
        const negativeReviews = totalReviews - positiveReviews;
        const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / (totalReviews || 1);
        const conversionRate = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

        setStats({
          totalReviews,
          positiveReviews,
          negativeReviews,
          avgRating: Math.round(avgRating * 10) / 10,
          conversionRate: Math.round(conversionRate),
          totalSpins: spinsData?.length || 0,
          thisMonthReviews: thisMonthFeedback.length,
          lastMonthReviews: lastMonthFeedback.length,
          thisMonthPositive: thisMonthFeedback.filter(f => f.is_positive).length,
          lastMonthPositive: lastMonthFeedback.filter(f => f.is_positive).length,
        });
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Calculate trend percentages
  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  const reviewsTrend = calculateTrend(stats.thisMonthReviews, stats.lastMonthReviews);
  const positiveTrend = calculateTrend(stats.thisMonthPositive, stats.lastMonthPositive);

  if (loading || !user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </DashboardLayout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Avis',
      value: stats.totalReviews,
      icon: BarChart3,
      trend: reviewsTrend,
      trendLabel: `${reviewsTrend.isPositive ? '+' : '-'}${reviewsTrend.value}% ce mois`,
    },
    {
      label: 'Avis Positifs (4-5)',
      value: stats.positiveReviews,
      icon: ThumbsUp,
      trend: positiveTrend,
      trendLabel: `${positiveTrend.isPositive ? '+' : '-'}${positiveTrend.value}% ce mois`,
    },
    {
      label: 'Avis Negatifs (1-3)',
      value: stats.negativeReviews,
      icon: ThumbsDown,
      trend: { value: stats.totalReviews > 0 ? Math.round((stats.negativeReviews / stats.totalReviews) * 100) : 0, isPositive: false },
      trendLabel: `${stats.totalReviews > 0 ? Math.round((stats.negativeReviews / stats.totalReviews) * 100) : 0}% du total`,
    },
    {
      label: 'Note Moyenne',
      value: stats.avgRating,
      suffix: '/ 5',
      icon: Star,
      trend: { value: 0, isPositive: true },
      trendLabel: 'Sur 5 etoiles',
    },
  ];

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-pink-600" />
            </div>
            Analytics
          </h1>
          <p className="text-slate-500 mt-1">Analyses detaillees de la performance de votre etablissement</p>
        </div>

        {/* Key Metrics - KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white"
              >
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.trend.isPositive ? (
                        <TrendingUp className="w-4 h-4 text-violet-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{kpi.value}</p>
                    {kpi.suffix && <span className="text-sm text-slate-400">{kpi.suffix}</span>}
                  </div>
                  <p className={`text-xs mt-2 ${kpi.trend.isPositive ? 'text-violet-500' : 'text-red-500'}`}>
                    {kpi.trendLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Evolution des Avis</h2>
                <p className="text-xs sm:text-sm text-slate-500">Tendances des 90 derniers jours</p>
              </div>
            </div>
            <ChartAreaInteractive data={chartData} />
          </div>
        </div>

        {/* Review Distribution and Conversion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Rating Distribution */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Distribution des Notes</h2>
                  <p className="text-xs sm:text-sm text-slate-500">{stats.totalReviews} avis au total</p>
                </div>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating] || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors duration-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium text-slate-700">{rating}</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            rating >= 4 ? 'bg-pink-500' : rating === 3 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count}</span>
                      <span className="text-xs text-slate-400 w-12 text-right">({Math.round(percentage)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Metriques de Conversion</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Indicateurs cles de performance</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Taux de Satisfaction',
                    value: `${stats.conversionRate}%`,
                    icon: TrendingUp,
                    iconClass: 'bg-pink-50 text-pink-600',
                  },
                  {
                    label: 'Total Tours de Roue',
                    value: stats.totalSpins,
                    icon: Gift,
                    iconClass: 'bg-pink-50 text-pink-600',
                  },
                  {
                    label: 'Avis ce mois',
                    value: stats.thisMonthReviews,
                    icon: Calendar,
                    iconClass: 'bg-pink-50 text-pink-600',
                  },
                ].map((metric, idx) => {
                  const MetricIcon = metric.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 transition-all duration-200 hover:bg-gray-100/50"
                    >
                      <div>
                        <p className="text-sm text-slate-500">{metric.label}</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900">{metric.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.iconClass}`}>
                        <MetricIcon className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews Analysis Table */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Analyse des Avis Recents</h2>
                <p className="text-xs sm:text-sm text-slate-500">Les 10 derniers avis recus</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedbackData.length > 0 ? (
                    feedbackData.slice(0, 10).map((feedback) => (
                      <tr
                        key={feedback.id}
                        className="transition-colors duration-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(feedback.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-slate-700">
                            {feedback.customer_email || feedback.customer_phone || 'Anonyme'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= feedback.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {feedback.is_positive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                              <ThumbsUp className="w-3 h-3" />
                              Positif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                              <ThumbsDown className="w-3 h-3" />
                              Negatif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-slate-600 truncate max-w-xs">
                            {feedback.comment || <span className="text-slate-400 italic">Pas de commentaire</span>}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-7 h-7 text-pink-600" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900 mb-1">Aucun avis pour le moment</p>
                        <p className="text-sm text-slate-500">Les avis de vos clients apparaitront ici.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {feedbackData.length > 10 && (
              <div className="mt-4 pt-4 text-center border-t border-gray-100">
                <p className="text-sm text-slate-500">
                  Affichage des 10 derniers avis sur <span className="font-semibold text-slate-900">{feedbackData.length}</span> au total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
