'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Award,
  Users,
  Gift,
  Search,
  Eye,
  CreditCard,
  History,
  Settings,
  Star,
  Loader2,
  AlertCircle,
  Check,
  X,
  Upload,
  Coins,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calculator,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Merchant, LoyaltyClient, LoyaltyStats } from '@/lib/types/database';

type TabType = 'configuration' | 'donnees' | 'clients';
type SortField = 'card_id' | 'name' | 'points' | 'last_visit' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'suspended' | 'expired';

const ITEMS_PER_PAGE = 7;

export default function LoyaltyPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [clients, setClients] = useState<LoyaltyClient[]>([]);
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('configuration');

  // Configuration state
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [pointsPerPurchase, setPointsPerPurchase] = useState(10);
  const [purchaseThreshold, setPurchaseThreshold] = useState(1000);
  const [loyaltyCurrency, setLoyaltyCurrency] = useState('EUR');
  const [welcomePoints, setWelcomePoints] = useState(50);
  const [loyaltyCardFile, setLoyaltyCardFile] = useState<File | null>(null);
  const [loyaltyCardPreview, setLoyaltyCardPreview] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Simulator state
  const [simulatorAmount, setSimulatorAmount] = useState(2500);

  // Clients tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('last_visit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch merchant
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!merchantData) {
        router.push('/auth');
        return;
      }

      setMerchant(merchantData);

      // Load config from merchant
      setLoyaltyEnabled(merchantData.loyalty_enabled || false);
      setPointsPerPurchase(merchantData.points_per_purchase || 10);
      setPurchaseThreshold(merchantData.purchase_amount_threshold || 1000);
      setLoyaltyCurrency(merchantData.loyalty_currency || 'EUR');
      setWelcomePoints(merchantData.welcome_points || 50);
      if (merchantData.loyalty_card_image_url) {
        setLoyaltyCardPreview(merchantData.loyalty_card_image_url);
      }

      // Fetch loyalty clients
      const clientsRes = await fetch(`/api/loyalty/client?merchantId=${user.id}`);
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      // Calculate stats
      const { data: allClients } = await supabase
        .from('loyalty_clients')
        .select('id, points, status')
        .eq('merchant_id', user.id);

      const { data: transactions } = await supabase
        .from('points_transactions')
        .select('points, type')
        .eq('merchant_id', user.id);

      const { data: redeemed } = await supabase
        .from('redeemed_rewards')
        .select('id, status')
        .eq('merchant_id', user.id);

      const total_clients = allClients?.length || 0;
      const active_clients = allClients?.filter(c => c.status === 'active').length || 0;
      const total_points_issued = transactions
        ?.filter(t => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0) || 0;
      const total_points_redeemed = transactions
        ?.filter(t => t.points < 0)
        .reduce((sum, t) => sum + Math.abs(t.points), 0) || 0;
      const total_rewards_redeemed = redeemed?.filter(r => r.status === 'used').length || 0;
      const average_points_per_client = total_clients > 0 ? Math.round(total_points_issued / total_clients) : 0;

      setStats({
        total_clients,
        active_clients,
        total_points_issued,
        total_points_redeemed,
        total_rewards_redeemed,
        average_points_per_client
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Configuration handlers ---

  const handleLoyaltyCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoyaltyCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLoyaltyCardPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async () => {
    if (!merchant) return;
    setSavingConfig(true);
    setConfigMessage(null);

    try {
      const updates: Record<string, any> = {
        loyalty_enabled: loyaltyEnabled,
        points_per_purchase: pointsPerPurchase,
        purchase_amount_threshold: purchaseThreshold,
        loyalty_currency: loyaltyCurrency,
        welcome_points: welcomePoints
      };

      if (loyaltyCardFile) {
        const fileExt = loyaltyCardFile.name.split('.').pop();
        const fileName = `${merchant.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(fileName, loyaltyCardFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('merchant-assets').getPublicUrl(fileName);
        updates.loyalty_card_image_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', merchant.id);

      if (error) throw error;

      setConfigMessage({ type: 'success', text: 'Paramètres fidélité enregistrés avec succès !' });
      setLoyaltyCardFile(null);

      // Refresh
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchant.id)
        .maybeSingle();
      if (merchantData) setMerchant(merchantData);
    } catch (error: any) {
      setConfigMessage({ type: 'error', text: error.message || 'Échec de l\'enregistrement' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleResetConfig = () => {
    if (!merchant) return;
    setLoyaltyEnabled(merchant.loyalty_enabled || false);
    setPointsPerPurchase(merchant.points_per_purchase || 10);
    setPurchaseThreshold(merchant.purchase_amount_threshold || 1000);
    setLoyaltyCurrency(merchant.loyalty_currency || 'EUR');
    setWelcomePoints(merchant.welcome_points || 50);
    setLoyaltyCardFile(null);
    if (merchant.loyalty_card_image_url) {
      setLoyaltyCardPreview(merchant.loyalty_card_image_url);
    } else {
      setLoyaltyCardPreview('');
    }
    setConfigMessage(null);
  };

  // --- Clients tab logic ---

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const processedClients = useMemo(() => {
    let result = [...clients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client =>
        client.name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query) ||
        client.card_id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'card_id':
          comparison = (a.card_id || '').localeCompare(b.card_id || '');
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'points':
          comparison = a.points - b.points;
          break;
        case 'last_visit':
          comparison = new Date(a.last_visit || 0).getTime() - new Date(b.last_visit || 0).getTime();
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(processedClients.length / ITEMS_PER_PAGE);
  const paginatedClients = processedClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Simulator calculation
  const simulatedPoints = purchaseThreshold > 0
    ? Math.floor(simulatorAmount / purchaseThreshold) * pointsPerPurchase
    : 0;

  // Toggle component matching settings design
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ backgroundColor: enabled ? '#DB2777' : '#d1d5db' }}
    >
      <div
        className="w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 absolute top-0.5"
        style={{ left: enabled ? '30px' : '2px' }}
      />
    </button>
  );

  // --- Render ---

  if (loading) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Settings; emoji: string }[] = [
    { key: 'configuration', label: 'Configuration', icon: Settings, emoji: '⚙️' },
    { key: 'donnees', label: 'Données', icon: BarChart3, emoji: '📊' },
    { key: 'clients', label: 'Clients', icon: Users, emoji: '👥' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Actif
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Suspendu
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Expiré
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            En attente
          </span>
        );
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === field ? 'text-pink-600' : 'text-slate-300'}`} />
      </div>
    </th>
  );

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .tab-content-enter {
          animation: fadeInTab 0.3s ease-out;
        }
        .loyalty-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .loyalty-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .loyalty-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #DB2777, #8B5CF6);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .loyalty-card:hover::before {
          transform: scaleX(1);
        }
        .loyalty-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(219, 39, 119, 0.12);
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(219, 39, 119, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-pink-600" />
              Programme Fidélité
            </h1>
            <p className="text-slate-500 mt-1">Gérez votre programme de fidélité</p>
          </div>
          <Link href="/dashboard/loyalty/rewards">
            <Button
              variant="outline"
              className="transition-all duration-200"
              style={{ borderColor: '#FCE7F3', color: '#DB2777' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDF2F8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Gérer les récompenses
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <nav
          role="tablist"
          className="flex gap-1 border-b-2 overflow-x-auto pb-0 scrollbar-hide"
          style={{ borderColor: '#FCE7F3' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-t-lg"
              style={{
                color: activeTab === tab.key ? '#DB2777' : '#6b7280',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#BE185D';
                  e.currentTarget.style.backgroundColor = '#FDF2F8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-base">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left"
                style={{
                  backgroundColor: '#DB2777',
                  transform: activeTab === tab.key ? 'scaleX(1)' : 'scaleX(0)',
                }}
              />
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="tab-content-enter" key={activeTab}>

          {/* ============ ONGLET CONFIGURATION ============ */}
          {activeTab === 'configuration' && (
            <div className="space-y-5">
              {configMessage && (
                <Card className={`p-3 sm:p-4 ${
                  configMessage.type === 'success'
                    ? 'bg-violet-50 border-violet-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {configMessage.type === 'success' ? <Check className="w-5 h-5 text-violet-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                    <p className={`text-sm font-medium ${configMessage.type === 'success' ? 'text-violet-700' : 'text-red-700'}`}>{configMessage.text}</p>
                  </div>
                </Card>
              )}

              {/* Enable Toggle */}
              <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className="loyalty-icon-enter w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: loyaltyEnabled ? '#FDF2F8' : '#f3f4f6' }}
                    >
                      <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${loyaltyEnabled ? 'text-pink-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Programme fidélité activé</h3>
                      <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Activez le système de carte fidélité pour vos clients</p>
                    </div>
                  </div>
                  <Toggle enabled={loyaltyEnabled} onChange={setLoyaltyEnabled} />
                </div>
              </Card>

              {loyaltyEnabled && (
                <>
                  {/* Calcul des Points */}
                  <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="loyalty-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FDF2F8' }}
                      >
                        <Coins className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Calcul des Points</h3>
                        <p className="text-xs sm:text-sm text-slate-500">Configurez comment les points sont attribués</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Points par achat</label>
                        <p className="text-xs text-slate-500 mb-2">Nombre de points gagnés par seuil atteint</p>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={pointsPerPurchase}
                          onChange={(e) => setPointsPerPurchase(parseInt(e.target.value) || 10)}
                          className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                          style={{ borderColor: '#d1d5db' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#DB2777';
                            e.currentTarget.style.backgroundColor = '#FDF2F8';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Seuil d&apos;achat</label>
                        <p className="text-xs text-slate-500 mb-2">Montant d&apos;achat pour gagner des points</p>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={purchaseThreshold}
                          onChange={(e) => setPurchaseThreshold(parseInt(e.target.value) || 1000)}
                          className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                          style={{ borderColor: '#d1d5db' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#DB2777';
                            e.currentTarget.style.backgroundColor = '#FDF2F8';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Paramètres Régionaux */}
                  <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="loyalty-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#dbeafe' }}
                      >
                        <Gift className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Paramètres Régionaux</h3>
                        <p className="text-xs sm:text-sm text-slate-500">Devise et bonus de bienvenue</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Devise</label>
                        <select
                          value={loyaltyCurrency}
                          onChange={(e) => setLoyaltyCurrency(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                          style={{ borderColor: '#d1d5db' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#DB2777';
                            e.currentTarget.style.backgroundColor = '#FDF2F8';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <option value="EUR">EUR - Euro</option>
                          <option value="XAF">XAF - Franc CFA</option>
                          <option value="USD">USD - Dollar</option>
                          <option value="THB">THB - Baht</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Points de bienvenue</label>
                        <p className="text-xs text-slate-500 mb-2">Points offerts à l&apos;inscription</p>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={welcomePoints}
                          onChange={(e) => setWelcomePoints(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                          style={{ borderColor: '#d1d5db' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#DB2777';
                            e.currentTarget.style.backgroundColor = '#FDF2F8';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Image de la Carte */}
                  <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-5 gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="loyalty-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#fce7f3' }}
                        >
                          <CreditCard className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Image de la Carte (16:9)</h3>
                          <p className="text-xs sm:text-sm text-slate-500">Image personnalisée affichée sur la carte fidélité</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0" style={{ borderColor: '#FCE7F3', color: '#DB2777' }}>16:9</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {loyaltyCardPreview && (
                        <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={loyaltyCardPreview} alt="Aperçu carte" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div
                        className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors bg-gray-50/50"
                        style={{ borderColor: '#FCE7F3' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DB2777'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#FCE7F3'; }}
                      >
                        <input
                          type="file"
                          id="loyalty-card-upload"
                          accept="image/*"
                          onChange={handleLoyaltyCardChange}
                          className="hidden"
                        />
                        <label htmlFor="loyalty-card-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-pink-600" />
                          <p className="text-sm text-slate-600 mb-1">
                            <span className="font-semibold text-pink-600">Télécharger une image</span>
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG (16:9) jusqu&apos;à 5 Mo</p>
                        </label>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Save / Cancel */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetConfig}
                  disabled={savingConfig}
                  className="w-full sm:w-auto transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full sm:w-auto text-white transition-all duration-200"
                  style={{ backgroundColor: '#DB2777' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#BE185D'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DB2777'; }}
                >
                  {savingConfig ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
                  ) : (
                    <><Check className="w-4 h-4 mr-2" />Enregistrer</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ============ ONGLET DONNÉES ============ */}
          {activeTab === 'donnees' && (
            <div className="space-y-5">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Users, label: 'Clients fidélité', value: stats?.total_clients || 0, bg: '#dbeafe', iconColor: '#2563eb' },
                  { icon: Star, label: 'Points distribués', value: stats?.total_points_issued?.toLocaleString() || 0, bg: '#fef3c7', iconColor: '#d97706' },
                  { icon: Gift, label: 'Récompenses', value: stats?.total_rewards_redeemed || 0, bg: '#d1fae5', iconColor: '#059669' },
                  { icon: CreditCard, label: 'Cartes actives', value: stats?.active_clients || 0, bg: '#FDF2F8', iconColor: '#DB2777' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={i} className="stat-card p-3 sm:p-5 border border-gray-200 rounded-xl">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: stat.bg }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.iconColor }} />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Interactive Simulator */}
              <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl" style={{ background: 'linear-gradient(to bottom right, #FDF2F8, #dbeafe)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Calculator className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Simulateur de Points</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Simulez les points gagnés pour un montant</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Montant : <span className="font-bold text-pink-600">{simulatorAmount.toLocaleString()} {loyaltyCurrency}</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={purchaseThreshold * 20}
                      step={purchaseThreshold > 0 ? Math.max(1, Math.floor(purchaseThreshold / 10)) : 100}
                      value={simulatorAmount}
                      onChange={(e) => setSimulatorAmount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#DB2777' }}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0</span>
                      <span>{(purchaseThreshold * 20).toLocaleString()} {loyaltyCurrency}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center shadow-sm border border-gray-100">
                      <p className="text-lg sm:text-2xl font-bold text-pink-600">{simulatedPoints}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Points gagnés</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center shadow-sm border border-gray-100">
                      <p className="text-lg sm:text-2xl font-bold text-violet-600">+{welcomePoints}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Bonus bienvenue</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center shadow-sm border-2" style={{ borderColor: '#FCE7F3' }}>
                      <p className="text-lg sm:text-2xl font-bold text-slate-900">{simulatedPoints + welcomePoints}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Total</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Points Calculation Example */}
              <Card className="loyalty-card p-5 sm:p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="loyalty-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FDF2F8' }}
                  >
                    <BarChart3 className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Exemple de calcul de points</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Visualisez la conversion montant/points</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex-1 sm:flex-initial border border-gray-200">
                    <p className="text-base sm:text-xl font-bold text-pink-600">{purchaseThreshold.toLocaleString()} {loyaltyCurrency}</p>
                    <p className="text-xs sm:text-sm text-slate-600">Montant</p>
                  </div>
                  <div className="text-xl sm:text-2xl flex-shrink-0 text-pink-600">=</div>
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex-1 sm:flex-initial border border-gray-200">
                    <p className="text-base sm:text-xl font-bold text-pink-600">{pointsPerPurchase}</p>
                    <p className="text-xs sm:text-sm text-slate-600">Points</p>
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">
                  Exemple : achat de {(purchaseThreshold * 5).toLocaleString()} {loyaltyCurrency} = {pointsPerPurchase * 5} points
                </p>
              </Card>
            </div>
          )}

          {/* ============ ONGLET CLIENTS ============ */}
          {activeTab === 'clients' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Search, Sort, Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Rechercher nom, email, tel..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                    style={{ borderColor: '#d1d5db' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#DB2777';
                      e.currentTarget.style.backgroundColor = '#FDF2F8';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
                  className="px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none w-full sm:w-auto"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#DB2777';
                    e.currentTarget.style.backgroundColor = '#FDF2F8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>

              {/* Table / Mobile Cards */}
              {processedClients.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FDF2F8' }}>
                    <Users className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Aucun client trouvé</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Modifiez vos filtres pour voir plus de résultats.'
                      : 'Les clients apparaîtront ici après leur première visite.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <SortableHeader field="card_id">N° Carte</SortableHeader>
                          <SortableHeader field="name">Client</SortableHeader>
                          <SortableHeader field="points">Points</SortableHeader>
                          <SortableHeader field="last_visit">Dernière visite</SortableHeader>
                          <SortableHeader field="status">Statut</SortableHeader>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedClients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm px-2 py-1 rounded" style={{ backgroundColor: '#FDF2F8', color: '#DB2777' }}>
                                {client.card_id}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {client.name || 'Anonyme'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {client.email || client.phone || '-'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span className="font-semibold text-slate-900">{client.points}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {client.last_visit
                                ? new Date(client.last_visit).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                : '-'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(client.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/card/${client.qr_code_data}`} target="_blank">
                                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600" title="Voir la carte">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600" title="Historique">
                                  <History className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="sm:hidden space-y-3">
                    {paginatedClients.map((client) => (
                      <Card key={client.id} className="p-4 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">
                              {client.name || 'Anonyme'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {client.email || client.phone || '-'}
                            </p>
                          </div>
                          {getStatusBadge(client.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FDF2F8', color: '#DB2777' }}>
                              {client.card_id}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-sm font-semibold text-slate-900">{client.points} pts</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link href={`/card/${client.qr_code_data}`} target="_blank">
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 h-8 w-8 p-0" title="Voir la carte">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 h-8 w-8 p-0" title="Historique">
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {client.last_visit && (
                          <p className="text-xs text-slate-400 mt-2">
                            Dernière visite : {new Date(client.last_visit).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, processedClients.length)} sur {processedClients.length}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="h-8 px-2 sm:px-3 transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Précédent</span>
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200"
                            style={
                              currentPage === page
                                ? { backgroundColor: '#DB2777', color: 'white' }
                                : { color: '#4b5563' }
                            }
                            onMouseEnter={(e) => {
                              if (currentPage !== page) {
                                e.currentTarget.style.backgroundColor = '#FDF2F8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== page) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="h-8 px-2 sm:px-3 transition-all duration-200"
                      >
                        <span className="hidden sm:inline mr-1">Suivant</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
