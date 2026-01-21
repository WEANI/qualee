'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, Share2, Printer } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
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

      // Check if QR code already exists in storage
      if (merchantData?.qr_code_url) {
        setQrCodeUrl(merchantData.qr_code_url);
      } else {
        // Generate new QR code
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`;
        const qr = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#7209B7',
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
    alert('Lien copie dans le presse-papiers !');
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
              border: 4px solid #7209B7;
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
              color: #7209B7;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7209B7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generateur de QR Code</h1>
          <p className="text-gray-600">Telechargez et partagez votre QR code pour collecter les avis clients</p>
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center mb-8">
            {merchant?.qr_code_url && (
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  QR Code genere par l'admin
                </span>
              </div>
            )}
            <div className="bg-white p-8 rounded-lg border-4 border-[#7209B7] shadow-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Print Button */}
            <Button
              onClick={printQR}
              className="mt-6 gap-2 bg-[#EB1E99] hover:bg-[#d11a87]"
            >
              <Printer className="w-4 h-4" />
              Imprimer le QR Code
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Votre lien d'avis :</p>
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm break-all text-violet-600 hover:text-teal-700 font-mono bg-white px-4 py-3 rounded border border-gray-300 block hover:border-violet-500 transition-colors underline"
              >
                {`${process.env.NEXT_PUBLIC_APP_URL}/rate/${user.id}`}
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={copyLink} variant="outline" className="w-full gap-2">
                <Copy className="w-4 h-4" />
                Copier le lien
              </Button>
              <Button onClick={() => downloadQR('png')} className="w-full gap-2 bg-[#7209B7] hover:bg-[#3A0CA3]">
                <Download className="w-4 h-4" />
                Telecharger PNG
              </Button>
              <Button onClick={() => downloadQR('svg')} variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Comment utiliser votre QR Code</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-900">Imprimez et affichez</p>
                <p className="text-sm text-gray-700">Placez le QR code a votre caisse ou sur vos tables</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-900">Les clients scannent</p>
                <p className="text-sm text-gray-700">Ils scannent et notent leur experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-900">Routage intelligent</p>
                <p className="text-sm text-gray-700">Les avis positifs vont sur Google automatiquement</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <p className="font-semibold text-gray-900">Feedback prive</p>
                <p className="text-sm text-gray-700">Les avis negatifs restent prives pour vous ameliorer</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
