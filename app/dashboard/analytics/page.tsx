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
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4361EE' }} />
        </div>
      </DashboardLayout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Avis',
      value: stats.totalReviews,
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #4361EE, #7209B7)',
      trend: reviewsTrend,
      trendLabel: `${reviewsTrend.isPositive ? '+' : '-'}${reviewsTrend.value}% ce mois`,
    },
    {
      label: 'Avis Positifs (4-5)',
      value: stats.positiveReviews,
      icon: ThumbsUp,
      gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
      trend: positiveTrend,
      trendLabel: `${positiveTrend.isPositive ? '+' : '-'}${positiveTrend.value}% ce mois`,
    },
    {
      label: 'Avis Negatifs (1-3)',
      value: stats.negativeReviews,
      icon: ThumbsDown,
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      trend: { value: stats.totalReviews > 0 ? Math.round((stats.negativeReviews / stats.totalReviews) * 100) : 0, isPositive: false },
      trendLabel: `${stats.totalReviews > 0 ? Math.round((stats.negativeReviews / stats.totalReviews) * 100) : 0}% du total`,
    },
    {
      label: 'Note Moyenne',
      value: stats.avgRating,
      suffix: '/ 5',
      icon: Star,
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      trend: { value: 0, isPositive: true },
      trendLabel: 'Sur 5 etoiles',
    },
  ];

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .analytics-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .analytics-card::before {
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
        .analytics-card:hover::before {
          transform: scaleX(1);
        }
        .analytics-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
        }
        .kpi-analytics {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease-out both;
        }
        .kpi-analytics:nth-child(1) { animation-delay: 0s; }
        .kpi-analytics:nth-child(2) { animation-delay: 0.05s; }
        .kpi-analytics:nth-child(3) { animation-delay: 0.1s; }
        .kpi-analytics:nth-child(4) { animation-delay: 0.15s; }
        .kpi-analytics:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(67, 97, 238, 0.18);
        }
        .analytics-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .analytics-content {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 analytics-content">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7" style={{ color: '#4361EE' }} />
            Analytics
          </h1>
          <p className="text-slate-500 mt-1">Analyses detaillees de la performance de votre etablissement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={idx}
                className="kpi-analytics p-5 sm:p-6 border border-gray-200 rounded-xl bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: kpi.gradient }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend.isPositive ? (
                      <TrendingUp className="w-4 h-4" style={{ color: '#4361EE' }} />
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
                <p
                  className="text-xs mt-2"
                  style={{ color: kpi.trend.isPositive ? '#4361EE' : '#dc2626' }}
                >
                  {kpi.trendLabel}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="analytics-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="analytics-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Evolution des Avis</h2>
              <p className="text-xs sm:text-sm text-slate-500">Tendances des 90 derniers jours</p>
            </div>
          </div>
          <ChartAreaInteractive data={chartData} />
        </Card>

        {/* Review Distribution and Conversion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Rating Distribution */}
          <Card className="analytics-card p-5 sm:p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="analytics-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FFF7ED' }}
              >
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
                const barColor = rating >= 4 ? '#4361EE' : rating === 3 ? '#F59E0B' : '#dc2626';
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
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">({Math.round(percentage)}%)</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Conversion Metrics */}
          <Card className="analytics-card p-5 sm:p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="analytics-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#f0f0ff' }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: '#4361EE' }} />
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
                  iconColor: '#4361EE',
                  iconBg: '#f0f0ff',
                },
                {
                  label: 'Total Tours de Roue',
                  value: stats.totalSpins,
                  icon: Gift,
                  iconColor: '#7209B7',
                  iconBg: '#FAF5FF',
                },
                {
                  label: 'Avis ce mois',
                  value: stats.thisMonthReviews,
                  icon: Calendar,
                  iconColor: '#4361EE',
                  iconBg: '#f0f0ff',
                },
              ].map((metric, idx) => {
                const MetricIcon = metric.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:bg-gray-50"
                    style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}
                  >
                    <div>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">{metric.value}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: metric.iconBg }}
                    >
                      <MetricIcon className="w-5 h-5" style={{ color: metric.iconColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Reviews Analysis Table */}
        <Card className="analytics-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="analytics-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <MessageSquare className="w-5 h-5" style={{ color: '#4361EE' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Analyse des Avis Recents</h2>
              <p className="text-xs sm:text-sm text-slate-500">Les 10 derniers avis recus</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#f3f4f6' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #f3f4f6' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#f3f4f6' }}>
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
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Positif
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                          >
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
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: '#f0f0ff' }}
                      >
                        <MessageSquare className="w-7 h-7" style={{ color: '#4361EE' }} />
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
            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #f3f4f6' }}>
              <p className="text-sm text-slate-500">
                Affichage des 10 derniers avis sur <span className="font-semibold text-slate-900">{feedbackData.length}</span> au total
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
