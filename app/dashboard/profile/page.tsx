'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Check,
  X,
  Loader2,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    website: '',
    siret: '',
  });

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

      if (merchantData) {
        setFormData({
          name: merchantData.name || '',
          business_name: merchantData.business_name || '',
          email: merchantData.email || user.email || '',
          phone: merchantData.phone || '',
          address: merchantData.address || '',
          city: merchantData.city || '',
          postal_code: merchantData.postal_code || '',
          country: merchantData.country || 'France',
          website: merchantData.website || '',
          siret: merchantData.siret || '',
        });
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          name: formData.name || null,
          business_name: formData.business_name || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
          website: formData.website || null,
          siret: formData.siret || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

      // Refresh merchant data
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setMerchant(merchantData);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez les informations de votre entreprise</p>
        </div>

        {message && (
          <Card className={`p-4 ${
            message.type === 'success' ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-teal-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${
                message.type === 'success' ? 'text-teal-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                <p className="text-sm text-gray-600">Vos informations de contact</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email
                  </div>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Téléphone
                  </div>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </Card>

          {/* Informations entreprise */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informations entreprise</h2>
                <p className="text-sm text-gray-600">Détails de votre activité</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom commercial
                </label>
                <Input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                  placeholder="Ma Boutique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    SIRET
                  </div>
                </label>
                <Input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => handleChange('siret', e.target.value)}
                  placeholder="123 456 789 00012"
                  maxLength={17}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Site web
                  </div>
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.monsite.fr"
                />
              </div>
            </div>
          </Card>

          {/* Adresse */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Adresse</h2>
                <p className="text-sm text-gray-600">Localisation de votre établissement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <Input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="75001"
                  maxLength={10}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Canada">Canada</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Tunisie">Tunisie</option>
                  <option value="Algérie">Algérie</option>
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Cameroun">Cameroun</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (merchant) {
                setFormData({
                  name: merchant.name || '',
                  business_name: merchant.business_name || '',
                  email: merchant.email || user.email || '',
                  phone: merchant.phone || '',
                  address: merchant.address || '',
                  city: merchant.city || '',
                  postal_code: merchant.postal_code || '',
                  country: merchant.country || 'France',
                  website: merchant.website || '',
                  siret: merchant.siret || '',
                });
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
