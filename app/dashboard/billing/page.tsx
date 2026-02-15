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
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-teal-600" />
            </div>
            Facturation & Abonnement
          </h1>
          <p className="text-slate-500 mt-1">Gérez votre abonnement et vos informations de facturation</p>
        </div>

        {/* Current Plan */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-gradient-to-br from-teal-50 to-emerald-50">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Plan actuel</h2>
                <p className="text-xs sm:text-sm text-slate-500">Votre abonnement en cours</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Mettre à niveau
              </Button>
            </div>

            <div className="mb-5">
              <Badge className="bg-teal-600 text-white border-0 text-xs">
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
                  <Check className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-slate-500">Avis mensuels</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">Illimité</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <p className="text-sm text-slate-500">QR Codes</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">1</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-slate-500">Support</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">Email</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Moyen de paiement</h2>
                <p className="text-xs sm:text-sm text-slate-500">Gérez vos moyens de paiement</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Aucun moyen de paiement</p>
                  <p className="text-sm text-slate-500">Ajoutez un moyen de paiement pour mettre à niveau</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-all duration-200"
              >
                Ajouter une carte
              </Button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-teal-600" />
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
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-teal-200" />
              </div>
              <p className="text-slate-500 font-medium">Aucun historique de facturation</p>
              <p className="text-sm text-slate-400 mt-1">Vos factures apparaîtront ici</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
