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
      <DashboardLayout merchant={merchant}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4361EE' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout merchant={merchant}>
      <style jsx global>{`
        @keyframes fadeInQR {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .qr-animate {
          animation: fadeInQR 0.3s ease-out;
        }
        .qr-icon-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .qr-scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        .qr-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .qr-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #4361EE, #7209B7);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .qr-card:hover::before {
          transform: scaleX(1);
        }
        .qr-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
        }
        .step-card {
          transition: all 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 qr-animate">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-7 h-7" style={{ color: '#4361EE' }} />
            Générateur de QR Code
          </h1>
          <p className="text-slate-500 mt-1">Téléchargez et partagez votre QR code pour collecter les avis clients</p>
        </div>

        {/* QR Code Display Card */}
        <Card className="qr-card p-5 sm:p-8 border border-gray-200 rounded-xl">
          <div className="flex flex-col items-center">
            {merchant?.qr_code_url && (
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                  <Check className="w-4 h-4" />
                  QR Code généré par l&apos;admin
                </span>
              </div>
            )}

            <div className="qr-scale-in bg-white p-6 sm:p-8 rounded-xl border-2 shadow-lg" style={{ borderColor: '#4361EE' }}>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56 sm:w-72 sm:h-72" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Print Button */}
            <Button
              onClick={printQR}
              className="mt-6 gap-2 text-white transition-all duration-200"
              style={{ backgroundColor: '#4361EE' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3A0CA3'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE'; }}
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
                  className="text-sm break-all font-mono bg-white px-4 py-3 rounded-lg border block transition-all duration-200 hover:border-blue-400 underline"
                  style={{ borderColor: '#d1d5db', color: '#4361EE' }}
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
                className="w-full gap-2 transition-all duration-200"
                style={copied ? { backgroundColor: '#d1fae5', borderColor: '#a7f3d0', color: '#065f46' } : {}}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
              <Button
                onClick={() => downloadQR('png')}
                className="w-full gap-2 text-white transition-all duration-200"
                style={{ backgroundColor: '#7209B7' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3A0CA3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7209B7'; }}
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
        </Card>

        {/* How to Use Card */}
        <Card className="qr-card p-5 sm:p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="qr-icon-enter w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f0f0ff' }}
            >
              <Info className="w-5 h-5" style={{ color: '#4361EE' }} />
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
                className="step-card flex gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: '#4361EE' }}
                >
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{step.title}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
