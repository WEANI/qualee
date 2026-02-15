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

  const {
    currentPage,
    totalPages,
    paginatedData,
    setPage,
    totalItems,
    pageSize,
  } = usePagination(filteredFeedback, { pageSize: PAGE_SIZE });

  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  const filterButtons = [
    { key: 'all' as const, label: 'Tous', count: feedback.length, icon: MessageSquare, activeClass: 'bg-teal-600 text-white border-teal-600', hoverBorder: 'border-teal-400' },
    { key: 'positive' as const, label: 'Positifs', count: feedback.filter(f => f.is_positive).length, icon: ThumbsUp, activeClass: 'bg-emerald-600 text-white border-emerald-600', hoverBorder: 'border-emerald-400' },
    { key: 'negative' as const, label: 'Négatifs', count: feedback.filter(f => !f.is_positive).length, icon: ThumbsDown, activeClass: 'bg-red-600 text-white border-red-600', hoverBorder: 'border-red-400' },
  ];

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
            Avis clients
          </h1>
          <p className="text-slate-500 mt-1">Consultez et gérez tous les avis et retours clients</p>
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive ? btn.activeClass : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
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
            <div
              key={f.id}
              className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white"
            >
              <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        f.is_positive ? 'bg-emerald-50' : 'bg-red-50'
                      }`}
                    >
                      {f.is_positive ? (
                        <ThumbsUp className="w-5 h-5 text-emerald-600" />
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
                        className={`text-xs ${
                          f.is_positive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
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
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <p className="text-sm text-slate-700 leading-relaxed">{f.comment}</p>
                  </div>
                )}
              </div>
            </div>
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
          <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="p-8 sm:p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun avis pour le moment</h3>
                <p className="text-slate-500 mb-6">
                  {filter === 'all'
                    ? 'Commencez à collecter les avis clients en partageant votre QR code !'
                    : `Aucun avis ${filter === 'positive' ? 'positif' : 'négatif'} trouvé.`
                  }
                </p>
                <Button
                  onClick={() => router.push('/dashboard/qr')}
                  className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Voir le QR Code
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
