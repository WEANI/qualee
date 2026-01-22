'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Download, ArrowUpRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facturation & Abonnement</h1>
          <p className="text-gray-600">Gérez votre abonnement et vos informations de facturation</p>
        </div>

        {/* Current Plan */}
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-violet-50 border-teal-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="mb-2 bg-violet-600">Plan actuel</Badge>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                Plan {merchant.subscription_tier || 'Gratuit'}
              </h2>
              <p className="text-gray-600 mt-1">Parfait pour démarrer</p>
            </div>
            <Button className="bg-violet-600 hover:bg-teal-700">
              Mettre à niveau
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Avis mensuels</p>
              <p className="text-2xl font-bold text-gray-900">Illimité</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">QR Codes</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Support</p>
              <p className="text-2xl font-bold text-gray-900">Email</p>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyen de paiement</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-teal-700 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Aucun moyen de paiement</p>
                <p className="text-sm text-gray-500">Ajoutez un moyen de paiement pour mettre à niveau</p>
              </div>
            </div>
            <Button variant="outline">Ajouter une carte</Button>
          </div>
        </Card>

        {/* Billing History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Historique de facturation</h3>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Tout télécharger
            </Button>
          </div>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun historique de facturation</p>
            <p className="text-sm text-gray-400 mt-1">Vos factures apparaîtront ici</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
