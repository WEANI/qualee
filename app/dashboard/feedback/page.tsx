'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { Feedback } from '@/lib/types/database';
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, Loader2, Star } from 'lucide-react';

const PAGE_SIZE = 10;

export default function FeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

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
      fetchFeedback(user.id);
    };

    checkAuth();
  }, [router]);

  const fetchFeedback = async (merchantId: string) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    setFeedback(data || []);
  };

  const filteredFeedback = feedback.filter((f) => {
    if (filter === 'positive') return f.is_positive;
    if (filter === 'negative') return !f.is_positive;
    return true;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    setPage,
    totalItems,
    pageSize,
  } = usePagination(filteredFeedback, { pageSize: PAGE_SIZE });

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4361EE' }} />
        </div>
      </DashboardLayout>
    );
  }

  const filterButtons = [
    { key: 'all' as const, label: 'Tous', count: feedback.length, icon: MessageSquare, activeColor: '#4361EE' },
    { key: 'positive' as const, label: 'Positifs', count: feedback.filter(f => f.is_positive).length, icon: ThumbsUp, activeColor: '#16a34a' },
    { key: 'negative' as const, label: 'Negatifs', count: feedback.filter(f => !f.is_positive).length, icon: ThumbsDown, activeColor: '#dc2626' },
  ];

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feedback-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease-out both;
        }
        .feedback-card::before {
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
        .feedback-card:hover::before {
          transform: scaleX(1);
        }
        .feedback-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
        }
        .feedback-list {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 feedback-list">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7" style={{ color: '#4361EE' }} />
            Avis clients
          </h1>
          <p className="text-slate-500 mt-1">Consultez et gerez tous les avis et retours clients</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {filterButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = filter === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border"
                style={{
                  backgroundColor: isActive ? btn.activeColor : 'white',
                  color: isActive ? 'white' : '#6b7280',
                  borderColor: isActive ? btn.activeColor : '#e5e7eb',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = btn.activeColor;
                    e.currentTarget.style.backgroundColor = '#fafafe';
                    e.currentTarget.style.color = btn.activeColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                {btn.label} ({btn.count})
              </button>
            );
          })}
        </div>

        {/* Pagination Info */}
        {filteredFeedback.length > 0 && (
          <PaginationInfo
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        )}

        {/* Feedback List */}
        <div className="grid gap-4">
          {paginatedData.map((f, idx) => (
            <Card
              key={f.id}
              className="feedback-card p-5 sm:p-6 border border-gray-200 rounded-xl"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: f.is_positive ? '#f0fdf4' : '#fef2f2',
                    }}
                  >
                    {f.is_positive ? (
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= f.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500 font-medium">({f.rating}/5)</span>
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: f.is_positive ? '#f0fdf4' : '#fef2f2',
                        color: f.is_positive ? '#16a34a' : '#dc2626',
                        borderColor: f.is_positive ? '#bbf7d0' : '#fecaca',
                      }}
                    >
                      {f.is_positive ? 'Avis positif' : 'Attention requise'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(f.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {f.comment && (
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}
                >
                  <p className="text-sm text-slate-700 leading-relaxed">{f.comment}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-6"
          />
        )}

        {/* Empty State */}
        {filteredFeedback.length === 0 && (
          <Card className="feedback-card p-8 sm:p-12 border border-gray-200 rounded-xl">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#f0f0ff' }}
              >
                <MessageSquare className="w-8 h-8" style={{ color: '#4361EE' }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun avis pour le moment</h3>
              <p className="text-slate-500 mb-6">
                {filter === 'all'
                  ? 'Commencez a collecter les avis clients en partageant votre QR code !'
                  : `Aucun avis ${filter === 'positive' ? 'positif' : 'negatif'} trouve.`
                }
              </p>
              <Button
                onClick={() => router.push('/dashboard/qr')}
                className="gap-2 text-white"
                style={{ backgroundColor: '#4361EE' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3A0CA3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE'; }}
              >
                Voir le QR Code
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
