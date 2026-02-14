'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Download, ArrowUpRight, Loader2, Zap, QrCode, Headphones, Check } from 'lucide-react';

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);

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

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366F1' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInBilling {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .billing-fade-in {
          animation: fadeInBilling 0.3s ease-out;
        }
        .billing-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .billing-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .billing-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366F1, #EC4899);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .billing-card:hover::before {
          transform: scaleX(1);
        }
        .billing-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 billing-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7" style={{ color: '#6366F1' }} />
            Facturation & Abonnement
          </h1>
          <p className="text-slate-500 mt-1">Gérez votre abonnement et vos informations de facturation</p>
        </div>

        {/* Current Plan */}
        <Card className="billing-card p-5 sm:p-6 border border-gray-200 rounded-xl" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div
              className="billing-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#6366F1' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Plan actuel</h2>
              <p className="text-xs sm:text-sm text-slate-500">Votre abonnement en cours</p>
            </div>
            <Button
              className="text-white transition-all duration-200"
              style={{ backgroundColor: '#6366F1' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4F46E5'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6366F1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Mettre à niveau
            </Button>
          </div>

          <div className="mb-5">
            <Badge className="text-white border-0 text-xs" style={{ backgroundColor: '#6366F1' }}>
              Plan actuel
            </Badge>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 capitalize">
              Plan {merchant.subscription_tier || 'Gratuit'}
            </h3>
            <p className="text-slate-600 mt-1 text-sm">Parfait pour démarrer</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                <p className="text-sm text-slate-500">Avis mensuels</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">Illimité</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4" style={{ color: '#6366F1' }} />
                <p className="text-sm text-slate-500">QR Codes</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">1</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-4 h-4" style={{ color: '#F59E0B' }} />
                <p className="text-sm text-slate-500">Support</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">Email</p>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="billing-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="billing-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#EEF2FF' }}
            >
              <CreditCard className="w-5 h-5" style={{ color: '#6366F1' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Moyen de paiement</h2>
              <p className="text-xs sm:text-sm text-slate-500">Gérez vos moyens de paiement</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Aucun moyen de paiement</p>
                <p className="text-sm text-slate-500">Ajoutez un moyen de paiement pour mettre à niveau</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-gray-200 transition-all duration-200"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = ''; }}
            >
              Ajouter une carte
            </Button>
          </div>
        </Card>

        {/* Billing History */}
        <Card className="billing-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="billing-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#EEF2FF' }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#6366F1' }} />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Historique de facturation</h2>
              <p className="text-xs sm:text-sm text-slate-500">Vos factures et paiements</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-700">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tout télécharger</span>
            </Button>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#EEF2FF' }}>
              <Calendar className="w-8 h-8" style={{ color: '#C7D2FE' }} />
            </div>
            <p className="text-slate-500 font-medium">Aucun historique de facturation</p>
            <p className="text-sm text-slate-400 mt-1">Vos factures apparaîtront ici</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
