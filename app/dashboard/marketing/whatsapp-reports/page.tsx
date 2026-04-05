'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import {
  BarChart3,
  RefreshCw,
  Send,
  CheckCircle,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CampaignSend {
  id: string;
  template_name: string;
  recipient_count: number;
  price_per_message: number;
  total_cost: number;
  status: string;
  stats_sent: number;
  stats_delivered: number;
  stats_read: number;
  stats_failed: number;
  sent_at: string;
  completed_at: string;
}

export default function WhatsAppReportsPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

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

      const { data: sendsData } = await supabase
        .from('campaign_sends')
        .select('*')
        .eq('merchant_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      setSends(sendsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(sendId: string) {
    if (expandedId === sendId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sendId);
    const { data } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('campaign_send_id', sendId)
      .order('created_at', { ascending: false });
    setMessages(data || []);
  }

  // Aggregate stats
  const totalSent = sends.reduce((s, c) => s + c.stats_sent, 0);
  const totalDelivered = sends.reduce((s, c) => s + c.stats_delivered, 0);
  const totalRead = sends.reduce((s, c) => s + c.stats_read, 0);
  const totalFailed = sends.reduce((s, c) => s + c.stats_failed, 0);

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Rapports campagnes
            </h1>
            <p className="text-gray-500 mt-1">Suivi de delivrance et statistiques</p>
          </div>
          <Button onClick={loadData} className="bg-white border border-gray-300 text-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Envoyes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Delivres</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalDelivered}</p>
            <p className="text-xs text-green-600">{deliveryRate}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-gray-500">Lus</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalRead}</p>
            <p className="text-xs text-violet-600">{readRate}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Echoues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalFailed}</p>
          </div>
        </div>

        {/* Campaign Sends List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Historique des envois</h2>
          </div>

          {sends.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Aucun envoi pour le moment</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sends.map((send) => (
                <div key={send.id}>
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => loadMessages(send.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{send.template_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(send.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{send.recipient_count}</p>
                        <p className="text-[10px] text-gray-400">DEST.</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{send.stats_delivered}</p>
                        <p className="text-[10px] text-gray-400">DELIVRES</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-violet-600">{send.stats_read}</p>
                        <p className="text-[10px] text-gray-400">LUS</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-red-500">{send.stats_failed}</p>
                        <p className="text-[10px] text-gray-400">ECHECS</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-amber-600">{send.total_cost} EUR</p>
                        <p className="text-[10px] text-gray-400">COUT</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${send.status === 'completed' ? 'bg-green-100 text-green-700' : send.status === 'failed' ? 'bg-red-100 text-red-700' : send.status === 'sending' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {send.status}
                      </span>
                      {expandedId === send.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded messages */}
                  {expandedId === send.id && (
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400">
                              <th className="text-left py-1">Telephone</th>
                              <th className="text-left py-1">Statut</th>
                              <th className="text-left py-1">Envoye</th>
                              <th className="text-left py-1">Delivre</th>
                              <th className="text-left py-1">Lu</th>
                              <th className="text-left py-1">Erreur</th>
                            </tr>
                          </thead>
                          <tbody>
                            {messages.map((msg: any) => (
                              <tr key={msg.id} className="border-t border-gray-100">
                                <td className="py-1.5 font-mono">{msg.recipient_phone}</td>
                                <td className="py-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${msg.status === 'read' ? 'bg-violet-100 text-violet-700' : msg.status === 'delivered' ? 'bg-green-100 text-green-700' : msg.status === 'sent' ? 'bg-blue-100 text-blue-700' : msg.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {msg.status}
                                  </span>
                                </td>
                                <td className="py-1.5 text-gray-400">{msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString('fr-FR') : '-'}</td>
                                <td className="py-1.5 text-gray-400">{msg.delivered_at ? new Date(msg.delivered_at).toLocaleTimeString('fr-FR') : '-'}</td>
                                <td className="py-1.5 text-gray-400">{msg.read_at ? new Date(msg.read_at).toLocaleTimeString('fr-FR') : '-'}</td>
                                <td className="py-1.5 text-red-400">{msg.error_message || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
