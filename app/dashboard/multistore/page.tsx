'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Building2,
  Plus,
  Store,
  Users,
  Settings,
  Trash2,
  MapPin,
  Phone,
  Globe,
  ChevronRight,
  Gift,
  Award,
  XCircle,
  Loader2,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Organization, Store as StoreType } from '@/lib/types/database';

interface OrganizationWithStores extends Organization {
  stores?: StoreType[];
}

type ViewMode = 'list' | 'organization' | 'store' | 'new-org' | 'new-store';

export default function MultiStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithStores[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithStores | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [orgForm, setOrgForm] = useState({
    name: '',
    slug: '',
    share_loyalty_cards: true,
    share_prizes: true,
    share_rewards: true,
    allow_cross_store_redemption: true,
    primary_color: '#7209B7',
    secondary_color: '#EB1E99'
  });

  const [storeForm, setStoreForm] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    is_headquarters: false,
    use_shared_loyalty: true,
    use_shared_prizes: true,
    use_shared_rewards: true,
    google_review_link: '',
    google_maps_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // Get merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();

      setMerchant(merchantData);

      // Get user's organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          *,
          stores (*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;
      setOrganizations(orgsData || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateOrganization = async () => {
    if (!orgForm.name.trim()) {
      setError('Le nom de l\'organisation est requis');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...orgForm,
          slug: orgForm.slug || generateSlug(orgForm.name),
          migrate_from_merchant: true
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await loadData();
      setViewMode('list');
      setOrgForm({
        name: '',
        slug: '',
        share_loyalty_cards: true,
        share_prizes: true,
        share_rewards: true,
        allow_cross_store_redemption: true,
        primary_color: '#7209B7',
        secondary_color: '#EB1E99'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          organization_id: selectedOrg.id,
          ...orgForm
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await loadData();
      setViewMode('list');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette organisation et tous ses magasins ?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch(`/api/organizations?organization_id=${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await loadData();
      setViewMode('list');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateStore = async () => {
    if (!selectedOrg || !storeForm.name.trim()) {
      setError('Le nom du magasin est requis');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          organization_id: selectedOrg.id,
          ...storeForm,
          slug: storeForm.slug || generateSlug(storeForm.name)
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await loadData();
      // Refresh selected org
      const updatedOrg = organizations.find(o => o.id === selectedOrg.id);
      if (updatedOrg) setSelectedOrg(updatedOrg);
      setViewMode('organization');
      setStoreForm({
        name: '',
        slug: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        is_headquarters: false,
        use_shared_loyalty: true,
        use_shared_prizes: true,
        use_shared_rewards: true,
        google_review_link: '',
        google_maps_url: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!selectedStore) return;

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch('/api/stores', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          store_id: selectedStore.id,
          ...storeForm
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await loadData();
      setViewMode('organization');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer ce magasin ?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch(`/api/stores?store_id=${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openOrgDetails = (org: OrganizationWithStores) => {
    setSelectedOrg(org);
    setOrgForm({
      name: org.name,
      slug: org.slug,
      share_loyalty_cards: org.share_loyalty_cards,
      share_prizes: org.share_prizes,
      share_rewards: org.share_rewards,
      allow_cross_store_redemption: org.allow_cross_store_redemption,
      primary_color: org.primary_color,
      secondary_color: org.secondary_color
    });
    setViewMode('organization');
  };

  const openStoreDetails = (store: StoreType) => {
    setSelectedStore(store);
    setStoreForm({
      name: store.name,
      slug: store.slug,
      address: store.address || '',
      city: store.city || '',
      country: store.country || '',
      phone: store.phone || '',
      email: store.email || '',
      is_headquarters: store.is_headquarters,
      use_shared_loyalty: store.use_shared_loyalty,
      use_shared_prizes: store.use_shared_prizes,
      use_shared_rewards: store.use_shared_rewards,
      google_review_link: store.google_review_link || '',
      google_maps_url: store.google_maps_url || ''
    });
    setViewMode('store');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {viewMode !== 'list' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (viewMode === 'store') {
                    setViewMode('organization');
                  } else {
                    setViewMode('list');
                    setSelectedOrg(null);
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {viewMode === 'list' && 'Gestion Multi-Magasins'}
                {viewMode === 'organization' && selectedOrg?.name}
                {viewMode === 'store' && selectedStore?.name}
                {viewMode === 'new-org' && 'Nouvelle Organisation'}
                {viewMode === 'new-store' && 'Nouveau Magasin'}
              </h2>
              <p className="text-slate-500 mt-1">
                {viewMode === 'list' && 'Gerez vos organisations et points de vente'}
                {viewMode === 'organization' && `${selectedOrg?.stores?.length || 0} magasin(s)`}
                {viewMode === 'store' && (selectedStore?.is_headquarters ? 'Siege social' : 'Point de vente')}
                {viewMode === 'new-org' && 'Creez une nouvelle enseigne'}
                {viewMode === 'new-store' && 'Ajoutez un point de vente'}
              </p>
            </div>
          </div>
          {viewMode === 'list' && (
            <Button
              onClick={() => {
                setOrgForm({
                  name: '',
                  slug: '',
                  share_loyalty_cards: true,
                  share_prizes: true,
                  share_rewards: true,
                  allow_cross_store_redemption: true,
                  primary_color: '#7209B7',
                  secondary_color: '#EB1E99'
                });
                setViewMode('new-org');
              }}
              className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Organisation
            </Button>
          )}
          {viewMode === 'organization' && (
            <Button
              onClick={() => {
                setStoreForm({
                  name: '',
                  slug: '',
                  address: '',
                  city: '',
                  country: '',
                  phone: '',
                  email: '',
                  is_headquarters: false,
                  use_shared_loyalty: true,
                  use_shared_prizes: true,
                  use_shared_rewards: true,
                  google_review_link: '',
                  google_maps_url: ''
                });
                setViewMode('new-store');
              }}
              className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Magasin
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="float-right">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Organizations List View */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {organizations.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Aucune organisation
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Creez votre premiere organisation pour gerer plusieurs points de vente sous une meme enseigne.
                </p>
                <Button
                  onClick={() => setViewMode('new-org')}
                  className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Creer une Organisation
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openOrgDetails(org)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: org.primary_color + '20' }}
                        >
                          <Building2 className="w-7 h-7" style={{ color: org.primary_color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{org.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {org.stores?.length || 0} magasin(s)
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {org.share_loyalty_cards && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Fidelite partagee
                              </Badge>
                            )}
                            {org.allow_cross_store_redemption && (
                              <Badge variant="secondary" className="text-xs">
                                <Gift className="w-3 h-3 mr-1" />
                                Recuperation cross-store
                              </Badge>
                            )}
                            <Badge className="text-xs capitalize">
                              {org.subscription_tier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Organization Details View */}
        {viewMode === 'organization' && selectedOrg && (
          <div className="space-y-6">
            {/* Settings Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Parametres de l'Organisation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nom de l'organisation</Label>
                    <Input
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      placeholder="Mon Enseigne"
                    />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input
                      value={orgForm.slug}
                      onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                      placeholder="mon-enseigne"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Cartes de fidelite partagees</p>
                      <p className="text-sm text-slate-500">Les clients cumulent leurs points sur tous les magasins</p>
                    </div>
                    <Switch
                      checked={orgForm.share_loyalty_cards}
                      onCheckedChange={(checked) => setOrgForm({ ...orgForm, share_loyalty_cards: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Lots partages</p>
                      <p className="text-sm text-slate-500">Memes lots pour tous les magasins</p>
                    </div>
                    <Switch
                      checked={orgForm.share_prizes}
                      onCheckedChange={(checked) => setOrgForm({ ...orgForm, share_prizes: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Recuperation cross-store</p>
                      <p className="text-sm text-slate-500">Les gagnants peuvent recuperer leur lot dans n'importe quel magasin</p>
                    </div>
                    <Switch
                      checked={orgForm.allow_cross_store_redemption}
                      onCheckedChange={(checked) => setOrgForm({ ...orgForm, allow_cross_store_redemption: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteOrganization(selectedOrg.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <Button
                  onClick={handleUpdateOrganization}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </div>
            </Card>

            {/* Stores List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Magasins ({selectedOrg.stores?.length || 0})
              </h3>

              {selectedOrg.stores?.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun magasin pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOrg.stores?.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => openStoreDetails(store)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Store className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{store.name}</h4>
                            {store.is_headquarters && (
                              <Badge variant="secondary" className="text-xs">Siege</Badge>
                            )}
                            {store.is_active ? (
                              <Badge className="text-xs bg-green-100 text-green-700">Actif</Badge>
                            ) : (
                              <Badge className="text-xs bg-red-100 text-red-700">Inactif</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {[store.address, store.city, store.country].filter(Boolean).join(', ') || 'Adresse non renseignee'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(store.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Store Details View */}
        {viewMode === 'store' && selectedStore && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Informations generales
                </h4>
                <div>
                  <Label>Nom du magasin</Label>
                  <Input
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={storeForm.slug}
                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={storeForm.is_headquarters}
                    onCheckedChange={(checked) => setStoreForm({ ...storeForm, is_headquarters: checked })}
                  />
                  <Label>Siege social</Label>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </h4>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="123 Rue Exemple"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ville</Label>
                    <Input
                      value={storeForm.city}
                      onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <Label>Pays</Label>
                    <Input
                      value={storeForm.country}
                      onChange={(e) => setStoreForm({ ...storeForm, country: e.target.value })}
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact
                </h4>
                <div>
                  <Label>Telephone</Label>
                  <Input
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    placeholder="contact@magasin.fr"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Liens
                </h4>
                <div>
                  <Label>Lien Google Reviews</Label>
                  <Input
                    value={storeForm.google_review_link}
                    onChange={(e) => setStoreForm({ ...storeForm, google_review_link: e.target.value })}
                    placeholder="https://g.page/..."
                  />
                </div>
                <div>
                  <Label>Lien Google Maps</Label>
                  <Input
                    value={storeForm.google_maps_url}
                    onChange={(e) => setStoreForm({ ...storeForm, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Sharing Settings */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Options de partage
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Fidelite partagee</p>
                      <p className="text-xs text-slate-500">Utiliser la fidelite de l'organisation</p>
                    </div>
                    <Switch
                      checked={storeForm.use_shared_loyalty}
                      onCheckedChange={(checked) => setStoreForm({ ...storeForm, use_shared_loyalty: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Lots partages</p>
                      <p className="text-xs text-slate-500">Utiliser les lots de l'organisation</p>
                    </div>
                    <Switch
                      checked={storeForm.use_shared_prizes}
                      onCheckedChange={(checked) => setStoreForm({ ...storeForm, use_shared_prizes: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Recompenses partagees</p>
                      <p className="text-xs text-slate-500">Utiliser les recompenses de l'organisation</p>
                    </div>
                    <Switch
                      checked={storeForm.use_shared_rewards}
                      onCheckedChange={(checked) => setStoreForm({ ...storeForm, use_shared_rewards: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="destructive"
                onClick={() => handleDeleteStore(selectedStore.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <Button
                onClick={handleUpdateStore}
                disabled={saving}
                className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </Card>
        )}

        {/* New Organization Form */}
        {viewMode === 'new-org' && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Nom de l'organisation *</Label>
                  <Input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                    placeholder="Mon Enseigne"
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={orgForm.slug}
                    onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                    placeholder="mon-enseigne"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    URL: qualee.app/{orgForm.slug || 'mon-enseigne'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={orgForm.primary_color}
                        onChange={(e) => setOrgForm({ ...orgForm, primary_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={orgForm.primary_color}
                        onChange={(e) => setOrgForm({ ...orgForm, primary_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Couleur secondaire</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={orgForm.secondary_color}
                        onChange={(e) => setOrgForm({ ...orgForm, secondary_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={orgForm.secondary_color}
                        onChange={(e) => setOrgForm({ ...orgForm, secondary_color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Options de partage</p>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Cartes de fidelite partagees</p>
                    <p className="text-sm text-slate-500">Les clients cumulent leurs points sur tous les magasins</p>
                  </div>
                  <Switch
                    checked={orgForm.share_loyalty_cards}
                    onCheckedChange={(checked) => setOrgForm({ ...orgForm, share_loyalty_cards: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Lots partages</p>
                    <p className="text-sm text-slate-500">Memes lots pour tous les magasins</p>
                  </div>
                  <Switch
                    checked={orgForm.share_prizes}
                    onCheckedChange={(checked) => setOrgForm({ ...orgForm, share_prizes: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Recuperation cross-store</p>
                    <p className="text-sm text-slate-500">Les gagnants peuvent recuperer leur lot dans n'importe quel magasin</p>
                  </div>
                  <Switch
                    checked={orgForm.allow_cross_store_redemption}
                    onCheckedChange={(checked) => setOrgForm({ ...orgForm, allow_cross_store_redemption: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t">
              <Button
                onClick={handleCreateOrganization}
                disabled={saving || !orgForm.name.trim()}
                className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Creer l'Organisation
              </Button>
            </div>
          </Card>
        )}

        {/* New Store Form */}
        {viewMode === 'new-store' && selectedOrg && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Informations generales</h4>
                <div>
                  <Label>Nom du magasin *</Label>
                  <Input
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                    placeholder="Magasin Paris Centre"
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={storeForm.slug}
                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                    placeholder="paris-centre"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={storeForm.is_headquarters}
                    onCheckedChange={(checked) => setStoreForm({ ...storeForm, is_headquarters: checked })}
                  />
                  <Label>Definir comme siege social</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Adresse</h4>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="123 Rue Exemple"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ville</Label>
                    <Input
                      value={storeForm.city}
                      onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Pays</Label>
                    <Input
                      value={storeForm.country}
                      onChange={(e) => setStoreForm({ ...storeForm, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Contact</h4>
                <div>
                  <Label>Telephone</Label>
                  <Input
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Liens</h4>
                <div>
                  <Label>Lien Google Reviews</Label>
                  <Input
                    value={storeForm.google_review_link}
                    onChange={(e) => setStoreForm({ ...storeForm, google_review_link: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Lien Google Maps</Label>
                  <Input
                    value={storeForm.google_maps_url}
                    onChange={(e) => setStoreForm({ ...storeForm, google_maps_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t">
              <Button
                onClick={handleCreateStore}
                disabled={saving || !storeForm.name.trim()}
                className="bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Creer le Magasin
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
