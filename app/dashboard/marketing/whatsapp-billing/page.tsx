'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  CreditCard,
  RefreshCw,
  Calendar,
  Send,
  DollarSign,
} from 'lucide-react';

interface BillingMonth {
  id: string;
  month: string;
  messages_sent: number;
  total_cost: number;
  currency: string;
}

export default function WhatsAppBillingPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingMonth[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!merchantData) { router.push('/auth/login'); return; }
      setMerchant(merchantData);

      const { data: billingData } = await supabase
        .from('merchant_message_billing')
        .select('*')
        .eq('merchant_id', user.id)
        .order('month', { ascending: false })
        .limit(12);

      setBilling(billingData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalMessages = billing.reduce((s, b) => s + b.messages_sent, 0);
  const totalCost = billing.reduce((s, b) => s + parseFloat(String(b.total_cost)), 0);
  const currentMonth = billing[0];

  if (loading) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Facturation WhatsApp
          </h1>
          <p className="text-gray-500 mt-1">Suivi des couts de vos campagnes WhatsApp</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-gray-500">Ce mois</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currentMonth?.messages_sent || 0} msgs</p>
            <p className="text-sm text-amber-600 font-medium">{currentMonth ? parseFloat(String(currentMonth.total_cost)).toFixed(2) : '0.00'} EUR</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Total messages</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Total depense</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalCost.toFixed(2)} EUR</p>
          </div>
        </div>

        {/* Price per message */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
          <p className="text-sm text-violet-700">
            Prix par message : <strong>{merchant?.message_price_per_unit || 0.05} EUR</strong> (configure par l&apos;administrateur)
          </p>
        </div>

        {/* Monthly History */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Historique mensuel</h2>
          </div>

          {billing.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Aucune facturation pour le moment</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Mois</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Messages</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Cout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billing.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {new Date(b.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{b.messages_sent}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-amber-600">
                      {parseFloat(String(b.total_cost)).toFixed(2)} {b.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
