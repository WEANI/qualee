'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n/config';
import { MessageSquare, Send, Star, Gift, Sparkles } from 'lucide-react';
import { sanitizeString } from '@/lib/utils/validation';

export default function InternalFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const shopId = params.shopId as string;

  // Get params from URL
  const rating = parseInt(searchParams.get('rating') || '0');
  const phoneNumber = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const langFromUrl = searchParams.get('lang');
  const currentLang = langFromUrl || i18n.language || 'fr';

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (langFromUrl && i18n.language !== langFromUrl) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [langFromUrl]);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', shopId)
          .maybeSingle();

        if (!error && data) {
          setMerchant(data);
        }
      } catch {
        // Handle silently
      } finally {
        setFetching(false);
      }
    };

    if (shopId) {
      fetchMerchant();
    } else {
      setFetching(false);
    }
  }, [shopId]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setLoading(true);

    try {
      // Get or create user token
      const userToken = localStorage.getItem('user_token') || crypto.randomUUID();
      localStorage.setItem('user_token', userToken);

      // Save feedback to database
      const feedbackData: any = {
        merchant_id: shopId,
        rating: rating,
        comment: sanitizeString(comment, 2000),
        is_positive: false, // Low rating
        user_token: userToken,
        is_internal: true, // Mark as internal feedback (not from Google)
      };

      // Add contact info
      if (phoneNumber) {
        feedbackData.customer_phone = phoneNumber;
      }
      if (email) {
        feedbackData.customer_email = email;
      }

      const { error: feedbackError } = await supabase.from('feedback').insert(feedbackData);

      if (feedbackError) {
        console.error('Feedback error:', feedbackError);
      }

      // Send notification to merchant
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: shopId,
          type: 'feedback',
          title: '📝 Nouvel avis interne',
          message: `Un client a laissé un avis de ${rating} étoile${rating > 1 ? 's' : ''} avec un commentaire.`,
          data: { rating, isPositive: false, isInternal: true },
        }),
      }).catch(() => {});

      // Create loyalty card if merchant has loyalty enabled
      let loyaltyCardQrCode = '';
      let isNewLoyaltyClient = true;

      if (merchant?.loyalty_enabled) {
        try {
          const loyaltyRes = await fetch('/api/loyalty/client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantId: shopId,
              phone: phoneNumber || undefined,
              email: email || undefined,
              userToken: userToken,
              language: currentLang,
            }),
          });

          if (loyaltyRes.ok) {
            const loyaltyData = await loyaltyRes.json();
            loyaltyCardQrCode = loyaltyData.client?.qr_code_data || '';
            isNewLoyaltyClient = loyaltyData.isNew === true;
          }
        } catch {
          // Continue without loyalty card
        }
      }

      setSubmitted(true);

      // Redirect to spin wheel after a short delay
      setTimeout(() => {
        let spinUrl = `/spin/${shopId}?lang=${currentLang}`;
        if (phoneNumber) {
          spinUrl += `&phone=${encodeURIComponent(phoneNumber)}`;
        }
        if (loyaltyCardQrCode) {
          spinUrl += `&cardQr=${encodeURIComponent(loyaltyCardQrCode)}`;
          spinUrl += `&newClient=${isNewLoyaltyClient ? '1' : '0'}`;
        }
        router.push(spinUrl);
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-700">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-700 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commerce introuvable</h1>
          <p className="text-gray-600 mb-6">Désolé, nous n'avons pas pu trouver ce commerce.</p>
          <Button onClick={() => router.push('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const hasBackground = merchant.background_url;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      {hasBackground ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${merchant.background_url})` }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700"></div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        {merchant.logo_url && (
          <div className="flex justify-center mb-6">
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="h-32 object-contain drop-shadow-lg"
            />
          </div>
        )}

        {/* Feedback Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('internalFeedback.title', 'Partagez votre expérience')}
                </h1>
                <p className="text-gray-600 text-sm">
                  {t('internalFeedback.subtitle', 'Votre avis nous aide à nous améliorer')}
                </p>
              </div>

              {/* Rating Display */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Comment Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('internalFeedback.commentLabel', 'Dites-nous en plus')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('internalFeedback.commentPlaceholder', 'Qu\'est-ce qui pourrait être amélioré ?')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Reward Hint */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 text-sm mb-1">
                      {t('internalFeedback.rewardTitle', 'Un cadeau vous attend !')}
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {t('internalFeedback.rewardMessage', 'Après votre commentaire, vous pourrez tourner la roue et gagner une surprise !')}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !comment.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('internalFeedback.submit', 'Envoyer mon avis')}
                  </>
                )}
              </Button>
            </>
          ) : (
            // Success State
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('internalFeedback.thankYou', 'Merci pour votre avis !')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('internalFeedback.redirecting', 'Redirection vers la roue des cadeaux...')}
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
