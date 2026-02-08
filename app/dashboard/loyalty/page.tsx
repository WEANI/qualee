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

  // --- Render ---

  if (loading) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Settings }[] = [
    { key: 'configuration', label: 'Configuration', icon: Settings },
    { key: 'donnees', label: 'Données', icon: BarChart3 },
    { key: 'clients', label: 'Clients', icon: Users },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === field ? 'text-violet-500' : 'text-slate-300'}`} />
      </div>
    </th>
  );

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Award className="w-7 h-7 text-violet-500" />
              Programme Fidélité
            </h1>
            <p className="text-slate-600 mt-1">Gérez votre programme de fidélité</p>
          </div>
          <Link href="/dashboard/loyalty/rewards">
            <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
              <Gift className="w-4 h-4 mr-2" />
              Gérer les récompenses
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                      isActive
                        ? 'border-violet-500 text-violet-700 bg-violet-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* ============ ONGLET CONFIGURATION ============ */}
            {activeTab === 'configuration' && (
              <div className="space-y-6">
                {configMessage && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    configMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {configMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm">{configMessage.text}</p>
                  </div>
                )}

                {/* Enable Toggle */}
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${loyaltyEnabled ? 'bg-violet-100' : 'bg-slate-100'}`}>
                        <Star className={`w-6 h-6 ${loyaltyEnabled ? 'text-violet-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Programme fidélité activé</h3>
                        <p className="text-sm text-slate-600">Activez le système de carte fidélité pour vos clients</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoyaltyEnabled(!loyaltyEnabled)}
                      className={`w-14 h-7 rounded-full transition-colors ${loyaltyEnabled ? 'bg-violet-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${loyaltyEnabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </Card>

                {loyaltyEnabled && (
                  <>
                    {/* Grouped: Calcul des Points */}
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Coins className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Calcul des Points</h3>
                          <p className="text-sm text-slate-500">Configurez comment les points sont attribués</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Points par achat</label>
                          <p className="text-xs text-slate-500 mb-2">Nombre de points gagnés par seuil atteint</p>
                          <Input
                            type="number"
                            min={1}
                            value={pointsPerPurchase}
                            onChange={(e) => setPointsPerPurchase(parseInt(e.target.value) || 10)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Seuil d'achat</label>
                          <p className="text-xs text-slate-500 mb-2">Montant d'achat pour gagner des points</p>
                          <Input
                            type="number"
                            min={1}
                            value={purchaseThreshold}
                            onChange={(e) => setPurchaseThreshold(parseInt(e.target.value) || 1000)}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Grouped: Paramètres Régionaux */}
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Paramètres Régionaux</h3>
                          <p className="text-sm text-slate-500">Devise et bonus de bienvenue</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Devise</label>
                          <select
                            value={loyaltyCurrency}
                            onChange={(e) => setLoyaltyCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                          >
                            <option value="EUR">EUR - Euro</option>
                            <option value="XAF">XAF - Franc CFA</option>
                            <option value="USD">USD - Dollar</option>
                            <option value="THB">THB - Baht</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Points de bienvenue</label>
                          <p className="text-xs text-slate-500 mb-2">Points offerts à l'inscription</p>
                          <Input
                            type="number"
                            min={0}
                            value={welcomePoints}
                            onChange={(e) => setWelcomePoints(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Image de la Carte */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">Image de la Carte (16:9)</h3>
                          <p className="text-sm text-slate-500">Image personnalisée affichée sur la carte fidélité</p>
                        </div>
                        <Badge variant="outline" className="border-violet-200 text-violet-700">16:9</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loyaltyCardPreview && (
                          <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
                            <img src={loyaltyCardPreview} alt="Aperçu carte" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="border-2 border-dashed border-violet-300 rounded-lg p-6 text-center hover:border-violet-500 transition-colors bg-violet-50/30">
                          <input
                            type="file"
                            id="loyalty-card-upload"
                            accept="image/*"
                            onChange={handleLoyaltyCardChange}
                            className="hidden"
                          />
                          <label htmlFor="loyalty-card-upload" className="cursor-pointer">
                            <Upload className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 mb-1">
                              <span className="text-violet-600 font-semibold">Télécharger une image</span>
                            </p>
                            <p className="text-xs text-slate-500">PNG, JPG (16:9) jusqu'à 5 Mo</p>
                          </label>
                        </div>
                      </div>
                    </Card>
                  </>
                )}

                {/* Save / Cancel */}
                <Card className="p-6 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Enregistrer les paramètres</h4>
                      <p className="text-sm text-slate-500">Les modifications seront appliquées immédiatement à votre programme fidélité.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleResetConfig}
                        disabled={savingConfig}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {savingConfig ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ============ ONGLET DONNÉES ============ */}
            {activeTab === 'donnees' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.total_clients || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Clients fidélité actifs</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.total_points_issued?.toLocaleString() || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Points distribués</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                        <Gift className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.total_rewards_redeemed || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Récompenses échangées</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stats?.active_clients || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Cartes actives</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Interactive Simulator */}
                <Card className="p-6 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calculator className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Simulateur de Points</h3>
                      <p className="text-sm text-slate-500">Simulez les points gagnés pour un montant d'achat</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Montant d'achat : <span className="text-violet-700 font-bold">{simulatorAmount.toLocaleString()} {loyaltyCurrency}</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={purchaseThreshold * 20}
                        step={purchaseThreshold > 0 ? Math.max(1, Math.floor(purchaseThreshold / 10)) : 100}
                        value={simulatorAmount}
                        onChange={(e) => setSimulatorAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0</span>
                        <span>{(purchaseThreshold * 20).toLocaleString()} {loyaltyCurrency}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold text-violet-600">{simulatedPoints}</p>
                        <p className="text-xs text-slate-500 mt-1">Points gagnés</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold text-emerald-600">+{welcomePoints}</p>
                        <p className="text-xs text-slate-500 mt-1">Bonus bienvenue</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-violet-200">
                        <p className="text-2xl font-bold text-slate-900">{simulatedPoints + welcomePoints}</p>
                        <p className="text-xs text-slate-500 mt-1">Total</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Points Calculation Example */}
                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Exemple de calcul de points</h3>
                  <div className="flex items-center justify-center gap-4 text-center">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xl font-bold text-violet-600">{purchaseThreshold.toLocaleString()} {loyaltyCurrency}</p>
                      <p className="text-sm text-slate-600">Montant d'achat</p>
                    </div>
                    <div className="text-2xl text-violet-500">=</div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xl font-bold text-violet-600">{pointsPerPurchase}</p>
                      <p className="text-sm text-slate-600">Points gagnés</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Exemple : achat de {(purchaseThreshold * 5).toLocaleString()} {loyaltyCurrency} = {pointsPerPurchase * 5} points
                  </p>
                </Card>
              </div>
            )}

            {/* ============ ONGLET CLIENTS ============ */}
            {activeTab === 'clients' && (
              <div className="space-y-4">
                {/* Search, Sort, Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher par nom, email, téléphone, n° carte..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="expired">Expiré</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                {processedClients.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun client trouvé</h3>
                    <p className="text-slate-600">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Modifiez vos filtres pour voir plus de résultats.'
                        : 'Les clients apparaîtront ici après leur première visite.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <SortableHeader field="card_id">N° Carte</SortableHeader>
                            <SortableHeader field="name">Client</SortableHeader>
                            <SortableHeader field="points">Points</SortableHeader>
                            <SortableHeader field="last_visit">Dernière visite</SortableHeader>
                            <SortableHeader field="status">Statut</SortableHeader>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {paginatedClients.map((client) => (
                            <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm text-violet-600 bg-violet-50 px-2 py-1 rounded">
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
                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-violet-600" title="Voir la carte">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-violet-600" title="Historique">
                                    <History className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-slate-500">
                        Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, processedClients.length)} de {processedClients.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Précédent
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-violet-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
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
                        >
                          Suivant
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
