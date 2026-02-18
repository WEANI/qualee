'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import {
  Award,
  Gift,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Star,
  Percent,
  Package,
  Wrench,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import type { Merchant, LoyaltyReward } from '@/lib/types/database';

type RewardType = 'discount' | 'product' | 'service' | 'cashback';

interface RewardForm {
  name: string;
  description: string;
  type: RewardType;
  value: string;
  points_cost: number;
  quantity_available: number | null;
  is_active: boolean;
}

const defaultForm: RewardForm = {
  name: '',
  description: '',
  type: 'discount',
  value: '',
  points_cost: 100,
  quantity_available: null,
  is_active: true
};

const typeIcons: Record<RewardType, typeof Percent> = {
  discount: Percent,
  product: Package,
  service: Wrench,
  cashback: DollarSign
};

const typeColors: Record<RewardType, { bg: string; text: string; lightBg: string }> = {
  discount: { bg: '#dbeafe', text: '#2563eb', lightBg: '#eff6ff' },
  product: { bg: '#d1fae5', text: '#059669', lightBg: '#ecfdf5' },
  service: { bg: '#F5F3FF', text: '#7209B7', lightBg: '#F5F3FF' },
  cashback: { bg: '#fef3c7', text: '#d97706', lightBg: '#fffbeb' },
};

export default function RewardsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [form, setForm] = useState<RewardForm>(defaultForm);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch rewards
      const res = await fetch(`/api/loyalty/rewards?merchantId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditingReward(null);
    setForm(defaultForm);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setForm({
      name: reward.name,
      description: reward.description || '',
      type: reward.type as RewardType,
      value: reward.value,
      points_cost: reward.points_cost,
      quantity_available: reward.quantity_available,
      is_active: reward.is_active
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    setSaving(true);
    setError(null);

    try {
      // Transform snake_case to camelCase for API
      const payload = {
        merchantId: merchant.id,
        name: form.name,
        description: form.description,
        type: form.type,
        value: form.value,
        pointsCost: form.points_cost,
        quantityAvailable: form.quantity_available,
        isActive: form.is_active
      };

      let res: Response;

      if (editingReward) {
        res = await fetch('/api/loyalty/rewards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rewardId: editingReward.id,
            merchantId: merchant.id,
            updates: form
          })
        });
      } else {
        res = await fetch('/api/loyalty/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Échec de la sauvegarde de la récompense');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm(t('loyalty.rewards.confirmDelete'))) return;
    if (!merchant) return;

    try {
      const res = await fetch('/api/loyalty/rewards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, merchantId: merchant.id })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInReward {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reward-animate {
          animation: fadeInReward 0.3s ease-out;
        }
        .reward-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .reward-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7209B7, #1800AD);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .reward-card:hover::before {
          transform: scaleX(1);
        }
        .reward-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(219, 39, 119, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 reward-animate">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/loyalty">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('dashboard.common.back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-7 h-7 text-violet-600" />
                {t('loyalty.rewards.title')}
              </h1>
              <p className="text-slate-500 mt-1">{t('loyalty.rewards.subtitle')}</p>
            </div>
          </div>
          <Button
            onClick={openAddModal}
            className="text-white transition-all duration-200"
            style={{ backgroundColor: '#7209B7' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5B0892'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7209B7'; }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('loyalty.rewards.add')}
          </Button>
        </div>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5F3FF' }}>
              <Gift className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {t('loyalty.rewards.noRewards')}
            </h3>
            <p className="text-slate-500 mb-6">
              {t('loyalty.rewards.noRewardsDesc')}
            </p>
            <Button
              onClick={openAddModal}
              className="text-white transition-all duration-200"
              style={{ backgroundColor: '#7209B7' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5B0892'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7209B7'; }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('loyalty.rewards.add')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {rewards.map((reward) => {
              const TypeIcon = typeIcons[reward.type as RewardType] || Gift;
              const colors = typeColors[reward.type as RewardType] || typeColors.cashback;
              return (
                <div
                  key={reward.id}
                  className={`reward-card bg-white rounded-xl border border-gray-200 ${!reward.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <TypeIcon className="w-6 h-6" style={{ color: colors.text }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(reward)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reward.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {reward.name}
                    </h3>
                    {reward.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {reward.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-900">{reward.points_cost}</span>
                        <span className="text-sm text-slate-500">{t('loyalty.clients.points')}</span>
                      </div>
                      <div className="text-sm">
                        {reward.quantity_available !== null ? (
                          <span className="text-slate-600">
                            {reward.quantity_available} {t('loyalty.rewards.quantity').toLowerCase()}
                          </span>
                        ) : (
                          <span className="text-indigo-600">{t('loyalty.rewards.quantityUnlimited')}</span>
                        )}
                      </div>
                    </div>

                    {!reward.is_active && (
                      <div className="mt-3 px-3 py-1.5 bg-gray-100 rounded-lg text-center border border-gray-200">
                        <span className="text-sm text-slate-600">Inactive</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="px-5 sm:px-6 py-3 rounded-b-xl"
                    style={{ backgroundColor: colors.lightBg }}
                  >
                    <p className="text-sm font-medium" style={{ color: colors.text }}>
                      {t(`loyalty.rewards.type${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}`)}: {reward.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingReward ? t('loyalty.rewards.edit') : t('loyalty.rewards.add')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('loyalty.rewards.name')} *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('loyalty.rewards.namePlaceholder')}
                  required
                  className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7209B7';
                    e.currentTarget.style.backgroundColor = '#F5F3FF';
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('loyalty.rewards.description')}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('loyalty.rewards.descriptionPlaceholder')}
                  className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                  rows={3}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7209B7';
                    e.currentTarget.style.backgroundColor = '#F5F3FF';
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('loyalty.rewards.type')} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['discount', 'product', 'service', 'cashback'] as RewardType[]).map((type) => {
                    const Icon = typeIcons[type];
                    const colors = typeColors[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className="p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3"
                        style={{
                          borderColor: form.type === type ? '#7209B7' : '#e5e7eb',
                          backgroundColor: form.type === type ? '#F5F3FF' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (form.type !== type) {
                            e.currentTarget.style.borderColor = '#EDE9FE';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (form.type !== type) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: form.type === type ? '#7209B7' : '#9ca3af' }} />
                        <span className="text-sm font-medium" style={{ color: form.type === type ? '#7209B7' : '#4b5563' }}>
                          {t(`loyalty.rewards.type${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('loyalty.rewards.value')} *
                </label>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={t('loyalty.rewards.valuePlaceholder')}
                  required
                  className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7209B7';
                    e.currentTarget.style.backgroundColor = '#F5F3FF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(219, 39, 119, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('loyalty.rewards.pointsCost')} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.points_cost}
                    onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                    style={{ borderColor: '#d1d5db' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7209B7';
                      e.currentTarget.style.backgroundColor = '#F5F3FF';
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('loyalty.rewards.quantity')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity_available ?? ''}
                    onChange={(e) => setForm({ ...form, quantity_available: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder={t('loyalty.rewards.quantityUnlimited')}
                    className="w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none"
                    style={{ borderColor: '#d1d5db' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7209B7';
                      e.currentTarget.style.backgroundColor = '#F5F3FF';
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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0"
                  style={{ backgroundColor: form.is_active ? '#7209B7' : '#d1d5db' }}
                >
                  <div
                    className="w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 absolute top-0.5"
                    style={{ left: form.is_active ? '30px' : '2px' }}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  {t('loyalty.rewards.isActive')}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 transition-all duration-200"
                  disabled={saving}
                >
                  {t('dashboard.common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white transition-all duration-200"
                  style={{ backgroundColor: '#7209B7' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5B0892'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7209B7'; }}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {t('dashboard.common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
