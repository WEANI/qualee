'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, Share2, Printer, QrCode, ExternalLink, Loader2, Check, Info } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      if (merchantData?.qr_code_url) {
        setQrCodeUrl(merchantData.qr_code_url);
      } else {
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`;
        const qr = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#0D9488',
            light: '#FFFFFF',
          },
        });

        setQrCodeUrl(qr);
      }
    };

    checkAuth();
  }, [router]);

  const downloadQR = (format: 'png' | 'svg') => {
    if (!canvasRef.current || !qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qualee-qr-${merchant?.business_name || 'code'}.${format}`;
    link.href = qrCodeUrl;
    link.click();
  };

  const copyLink = () => {
    if (!user) return;
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${merchant?.business_name || 'Qualee'}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 4px solid #0D9488;
              border-radius: 16px;
            }
            .qr-image {
              width: 300px;
              height: 300px;
            }
            .business-name {
              margin-top: 20px;
              font-size: 24px;
              font-weight: bold;
              color: #0D9488;
            }
            .instruction {
              margin-top: 10px;
              font-size: 16px;
              color: #666;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-image" />
            <div class="business-name">${merchant?.business_name || ''}</div>
            <div class="instruction">Scannez pour laisser un avis</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!user || !merchant) {
    return (
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-teal-600" />
            </div>
            Générateur de QR Code
          </h1>
          <p className="text-slate-500 mt-1">Téléchargez et partagez votre QR code pour collecter les avis clients</p>
        </div>

        {/* QR Code Display Card */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-8">
            <div className="flex flex-col items-center">
              {merchant?.qr_code_url && (
                <div className="mb-4 text-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                    <Check className="w-4 h-4" />
                    QR Code généré par l&apos;admin
                  </span>
                </div>
              )}

              <div className="bg-white p-6 sm:p-8 rounded-xl border-2 border-teal-500 shadow-lg">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56 sm:w-72 sm:h-72" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <Button
                onClick={printQR}
                className="mt-6 gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200"
              >
                <Printer className="w-4 h-4" />
                Imprimer le QR Code
              </Button>
            </div>

            <div className="mt-8 space-y-5">
              {/* Link Display */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                <p className="text-sm font-medium text-slate-700 mb-2">Votre lien d&apos;avis :</p>
                <div className="relative">
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all font-mono bg-white px-4 py-3 rounded-lg border border-gray-200 block transition-all duration-200 hover:border-teal-400 underline text-teal-600"
                  >
                    {`${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className={`w-full gap-2 transition-all duration-200 ${
                    copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </Button>
                <Button
                  onClick={() => downloadQR('png')}
                  className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PNG
                </Button>
                <Button
                  onClick={() => downloadQR('svg')}
                  variant="outline"
                  className="w-full gap-2 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Card */}
        <div className="group relative border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-md bg-white">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Comment utiliser votre QR Code</h2>
                <p className="text-xs sm:text-sm text-slate-500">Suivez ces étapes pour maximiser vos avis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { num: '1', title: 'Imprimez et affichez', desc: 'Placez le QR code à votre caisse ou sur vos tables' },
                { num: '2', title: 'Les clients scannent', desc: 'Ils scannent et notent leur expérience' },
                { num: '3', title: 'Routage intelligent', desc: 'Les avis positifs vont sur Google automatiquement' },
                { num: '4', title: 'Feedback privé', desc: 'Les avis négatifs restent privés pour vous améliorer' },
              ].map((step) => (
                <div
                  key={step.num}
                  className="flex gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-sm">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{step.title}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
