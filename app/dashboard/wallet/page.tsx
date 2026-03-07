'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import {
  Wallet,
  Send,
  RefreshCw,
  Smartphone,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Bell,
  TrendingUp,
} from 'lucide-react';

interface NotificationHistory {
  id: string;
  header: string;
  body: string;
  total_sent: number;
  total_failed: number;
  total_not_found: number;
  created_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [walletConfigured, setWalletConfigured] = useState(false);

  // Notification form
  const [notifHeader, setNotifHeader] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifStartDate, setNotifStartDate] = useState('');
  const [notifEndDate, setNotifEndDate] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Sync
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // History
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Charger le merchant
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!merchantData) {
        router.push('/auth/login');
        return;
      }

      setMerchant(merchantData);

      // Charger le nombre de clients
      const clientsRes = await fetch(`/api/loyalty/client?merchantId=${user.id}`);
      const clientsData = await clientsRes.json();
      setTotalClients(clientsData.clients?.length || 0);

      // Vérifier si Google Wallet est configuré
      const walletRes = await fetch(`/api/loyalty/wallet/google?clientId=test-config-check`);
      const walletData = await walletRes.json();
      // Si on obtient "Client not found" (404), ça veut dire que l'API fonctionne
      // Si on obtient "configured: false", Google Wallet n'est pas configuré
      setWalletConfigured(walletData.configured !== false);

      // Charger l'historique des notifications
      try {
        const { data: historyData } = await supabase
          .from('wallet_notifications')
          .select('*')
          .eq('merchant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setHistory(historyData || []);
      } catch {
        // Table peut ne pas exister
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant || !notifHeader || !notifBody) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/loyalty/wallet/google/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          header: notifHeader,
          body: notifBody,
          startDate: notifStartDate || undefined,
          endDate: notifEndDate || undefined,
        }),
      });

      const data = await res.json();
      setSendResult(data);

      if (data.success) {
        setNotifHeader('');
        setNotifBody('');
        setNotifStartDate('');
        setNotifEndDate('');
        // Recharger l'historique
        loadData();
      }
    } catch (error) {
      setSendResult({ error: 'Erreur de connexion' });
    } finally {
      setSending(false);
    }
  }

  async function handleSyncPasses() {
    if (!merchant) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/loyalty/wallet/google/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const data = await res.json();
      setSyncResult(data);
    } catch (error) {
      setSyncResult({ error: 'Erreur de connexion' });
    } finally {
      setSyncing(false);
    }
  }

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              Google Wallet
            </h1>
            <p className="text-gray-500 mt-1">
              Gerez les cartes de fidelite et envoyez des notifications
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                {walletConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-500">Statut</span>
            </div>
            <p className={`text-lg font-bold ${walletConfigured ? 'text-green-600' : 'text-red-500'}`}>
              {walletConfigured ? 'Configure' : 'Non configure'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Clients fidelite</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalClients}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Passes actifs</span>
            </div>
            <p className="text-lg font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-400 mt-1">Mis a jour lors de la synchro</p>
          </div>
        </div>

        {!walletConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800 mb-2">Google Wallet non configure</h3>
            <p className="text-sm text-amber-700">
              Pour activer Google Wallet, configurez les variables d&apos;environnement suivantes dans Netlify :
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              <li><code className="bg-amber-100 px-1.5 py-0.5 rounded">GOOGLE_WALLET_ISSUER_ID</code></li>
              <li><code className="bg-amber-100 px-1.5 py-0.5 rounded">GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL</code></li>
              <li><code className="bg-amber-100 px-1.5 py-0.5 rounded">GOOGLE_WALLET_PRIVATE_KEY</code></li>
            </ul>
          </div>
        )}

        {walletConfigured && (
          <>
            {/* Sync Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-violet-600" />
                    Synchronisation des passes
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Met a jour les points et achats sur tous les passes Google Wallet de vos clients
                  </p>
                </div>
                <Button
                  onClick={handleSyncPasses}
                  disabled={syncing}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6"
                >
                  {syncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  {syncing ? 'Synchronisation...' : 'Synchroniser'}
                </Button>
              </div>

              {syncResult && (
                <div className={`rounded-xl p-4 ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {syncResult.success ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Synchronisation terminee</p>
                        <p className="text-sm text-green-700">
                          {syncResult.updated} mis a jour, {syncResult.notFound} pas encore ajoutes, {syncResult.failed} erreurs
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{syncResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-violet-600" />
                Envoyer une notification
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Envoyez un message qui apparaitra directement sur la carte de fidelite Google Wallet de vos clients
              </p>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Titre de la notification
                  </label>
                  <input
                    type="text"
                    value={notifHeader}
                    onChange={(e) => setNotifHeader(e.target.value)}
                    placeholder="Ex: Offre speciale weekend !"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    required
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    placeholder="Ex: -20% sur tout le menu ce samedi ! Presentez votre carte de fidelite."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm resize-none"
                    rows={3}
                    required
                    maxLength={250}
                  />
                  <p className="text-xs text-gray-400 mt-1">{notifBody.length}/250 caracteres</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de debut (optionnel)
                    </label>
                    <input
                      type="date"
                      value={notifStartDate}
                      onChange={(e) => setNotifStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      value={notifEndDate}
                      onChange={(e) => setNotifEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    />
                  </div>
                </div>

                {sendResult && (
                  <div className={`rounded-xl p-4 ${sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {sendResult.success ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-800">Notification envoyee !</p>
                          <p className="text-sm text-green-700">
                            {sendResult.sent} envoyees, {sendResult.notFound} pas encore dans Wallet, {sendResult.failed} erreurs
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">{sendResult.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={sending || !notifHeader || !notifBody}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
                </Button>
              </form>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-violet-600" />
                  Historique des notifications
                </h2>

                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{item.header}</p>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-green-600">{item.total_sent} envoyees</span>
                          {item.total_failed > 0 && (
                            <span className="text-red-500">{item.total_failed} erreurs</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
              <h3 className="font-semibold text-violet-800 mb-2">Comment ca marche ?</h3>
              <ul className="text-sm text-violet-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-violet-600 mt-0.5">1.</span>
                  Vos clients ajoutent leur carte de fidelite dans Google Wallet depuis la page de leur carte
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-violet-600 mt-0.5">2.</span>
                  Quand vous modifiez leurs points, le pass se met a jour automatiquement
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-violet-600 mt-0.5">3.</span>
                  Vous pouvez envoyer des messages promotionnels qui apparaissent sur leur carte
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-violet-600 mt-0.5">4.</span>
                  Les clients recoivent une notification sur leur telephone a chaque mise a jour
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
