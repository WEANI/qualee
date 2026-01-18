'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageCircle,
  QrCode,
  Gift,
  Calendar,
  BarChart3,
  Smartphone,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  CreditCard,
  Menu,
  X,
  Play
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, []);

  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Comment fonctionne l'intégration WhatsApp ?",
      answer: "Qualee utilise l'API officielle WhatsApp Business. Vos clients reçoivent automatiquement leur carte de fidélité et la roue des cadeaux directement dans leur conversation WhatsApp, sans télécharger d'application."
    },
    {
      question: "Est-ce compatible avec mon logiciel de caisse ?",
      answer: "Qualee fonctionne indépendamment de votre logiciel de caisse. Vous générez simplement un QR Code unique que vos clients scannent en caisse. Aucune intégration technique n'est requise."
    },
    {
      question: "Comment filtrez-vous les avis négatifs ?",
      answer: "Avant de rediriger vers Google, nous demandons au client de noter son expérience. Si la note est inférieure à 4 étoiles, il est redirigé vers un formulaire de feedback privé, vous permettant de résoudre le problème avant qu'il ne devienne public."
    },
    {
      question: "Puis-je personnaliser les récompenses de la roue ?",
      answer: "Absolument ! Vous définissez vos propres prix : -10%, produit offert, soin gratuit... Vous contrôlez aussi les probabilités de gain pour maîtriser votre budget."
    },
    {
      question: "Y a-t-il un engagement de durée ?",
      answer: "Non, Qualee est sans engagement. Vous pouvez résilier à tout moment. Nous proposons également un essai gratuit de 14 jours pour tester toutes les fonctionnalités."
    },
    {
      question: "Combien de temps pour mettre en place Qualee ?",
      answer: "La configuration prend moins de 10 minutes. Créez votre compte, personnalisez vos récompenses, imprimez votre QR Code et c'est parti !"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/Logo Qualee pink violet.png"
                alt="Qualee"
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">
                Comment ça marche
              </a>
              <a href="#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">
                FAQ
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-[#7209B7] transition-colors text-sm"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-sm"
              >
                Essai gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#EB1E99]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-4">
              <a href="#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">
                Comment ça marche
              </a>
              <a href="#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">
                FAQ
              </a>
              <hr className="border-gray-200" />
              <Link href="/auth/login" className="text-gray-600 hover:text-[#7209B7] transition-colors py-2">
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-3 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full text-center"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 bg-gradient-to-br from-white via-[#EB1E99]/5 to-[#7209B7]/5">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EB1E99]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7209B7]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EB1E99]/10 border border-[#EB1E99]/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#EB1E99]" />
                <span className="text-[#EB1E99] text-sm font-medium">La fidélisation nouvelle génération</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Boostez vos{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                  Avis Google
                </span>{' '}
                et fidélisez vos clients sur{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A7E1] to-[#3A0CA3]">
                  WhatsApp
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                La solution tout-en-un pour les <strong className="text-gray-900">Spécialistes de la beauté, Instituts, Coiffeurs, Barbiers</strong>.
                Transformez chaque client en ambassadeur grâce à la gamification.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#EB1E99]/25"
                >
                  Essayer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#fonctionnement"
                  className="px-8 py-4 border-2 border-[#3A0CA3]/30 text-[#3A0CA3] font-semibold rounded-full hover:bg-[#3A0CA3]/5 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Voir la démo
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>14 jours d'essai gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Configuration en 10 min</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Animated Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#EB1E99]/30 to-[#7209B7]/30 rounded-full blur-[80px] scale-110 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00A7E1]/20 to-[#3A0CA3]/20 rounded-full blur-[60px] scale-105 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />

                {/* Main Hero Image */}
                <div className="relative z-10 animate-float">
                  <img
                    src="/Design sans titre (2) (1).png"
                    alt="Qualee - Roue des cadeaux WhatsApp"
                    className="w-[320px] md:w-[420px] lg:w-[480px] h-auto drop-shadow-2xl"
                  />
                </div>

                {/* Sparkle Effects */}
                <div className="absolute top-10 left-0 w-3 h-3 bg-[#EB1E99] rounded-full animate-[ping_2s_ease-in-out_infinite]" />
                <div className="absolute top-1/4 right-0 w-2 h-2 bg-[#00A7E1] rounded-full animate-[ping_2.5s_ease-in-out_infinite_0.5s]" />
                <div className="absolute bottom-1/4 left-5 w-2 h-2 bg-[#7209B7] rounded-full animate-[ping_3s_ease-in-out_infinite_1s]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Pourquoi vos clients{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                ne reviennent pas
              </span>{' '}
              assez souvent ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Les méthodes traditionnelles de fidélisation ne fonctionnent plus. Il est temps de passer au digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Point 1 */}
            <div className="bg-gradient-to-b from-[#7209B7]/5 to-white border border-[#7209B7]/20 rounded-3xl p-8 hover:border-[#7209B7]/40 hover:shadow-lg hover:shadow-[#7209B7]/10 transition-all">
              <div className="w-14 h-14 bg-[#7209B7]/10 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-[#7209B7]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Vos clients oublient de laisser des avis</h3>
              <p className="text-gray-600">
                Seulement 5% des clients satisfaits pensent à laisser un avis spontanément.
                Votre réputation en ligne stagne pendant que vos concurrents progressent.
              </p>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-gradient-to-b from-[#3A0CA3]/5 to-white border border-[#3A0CA3]/20 rounded-3xl p-8 hover:border-[#3A0CA3]/40 hover:shadow-lg hover:shadow-[#3A0CA3]/10 transition-all">
              <div className="w-14 h-14 bg-[#3A0CA3]/10 rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-[#3A0CA3]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Les cartes papier finissent à la poubelle</h3>
              <p className="text-gray-600">
                70% des cartes de fidélité papier sont perdues ou jamais complétées.
                Votre investissement part littéralement à la poubelle.
              </p>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-gradient-to-b from-[#EB1E99]/5 to-white border border-[#EB1E99]/20 rounded-3xl p-8 hover:border-[#EB1E99]/40 hover:shadow-lg hover:shadow-[#EB1E99]/10 transition-all">
              <div className="w-14 h-14 bg-[#EB1E99]/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-[#EB1E99]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Absence d'incitation au retour</h3>
              <p className="text-gray-600">
                Vos clients n'ont pas de raison concrète de revenir rapidement.
                Sans récompense valable uniquement sur leur prochain RDV, ils sont plus volatiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7209B7]/10 border border-[#7209B7]/20 rounded-full mb-6">
              <Play className="w-4 h-4 text-[#7209B7]" />
              <span className="text-[#7209B7] text-sm font-medium">Voir en action</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Découvrez Qualee en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                2 minutes
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Voyez comment transformer chaque visite en opportunité de fidélisation
            </p>
          </div>

          {/* Video Container */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#EB1E99]/20 via-[#7209B7]/20 to-[#3A0CA3]/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Video Wrapper */}
            <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-2 shadow-2xl">
              <video
                className="w-full aspect-video rounded-xl"
                controls
                poster="/Design sans titre (2) (1).png"
              >
                <source src="/PRESENTATION QUALEE 1.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#EB1E99]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#7209B7]/20 rounded-full blur-xl" />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="fonctionnement" className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A7E1]/10 border border-[#00A7E1]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#00A7E1]" />
              <span className="text-[#00A7E1] text-sm font-medium">Simple & Efficace</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Un processus fluide qui transforme chaque visite en opportunité de fidélisation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-[#EB1E99]/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-8 h-full hover:border-[#EB1E99]/50 hover:shadow-xl hover:shadow-[#EB1E99]/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
                  1
                </div>
                <div className="w-14 h-14 bg-[#EB1E99]/10 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-7 h-7 text-[#EB1E99]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Le Scan</h3>
                <p className="text-gray-600">
                  En caisse, votre client scanne votre QR Code unique avec son smartphone.
                  Simple, rapide, sans application à télécharger.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-[#7209B7]/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-8 h-full hover:border-[#7209B7]/50 hover:shadow-xl hover:shadow-[#7209B7]/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7209B7] to-[#3A0CA3] rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
                  2
                </div>
                <div className="w-14 h-14 bg-[#7209B7]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-[#7209B7]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">L'Avis Google</h3>
                <p className="text-gray-600">
                  Il est redirigé automatiquement vers votre fiche Google pour déposer un avis.
                  Une solution simple pour faire grimper votre visibilité grâce à la satisfaction de vos clients.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-[#3A0CA3]/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-8 h-full hover:border-[#3A0CA3]/50 hover:shadow-xl hover:shadow-[#3A0CA3]/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3A0CA3] to-[#00A7E1] rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
                  3
                </div>
                <div className="w-14 h-14 bg-[#3A0CA3]/10 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-7 h-7 text-[#3A0CA3]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">La Magie WhatsApp</h3>
                <p className="text-gray-600">
                  Il reçoit instantanément sa carte de fidélité digitale et la Roue des Cadeaux
                  directement sur WhatsApp. Zéro friction.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-[#00A7E1]/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-8 h-full hover:border-[#00A7E1]/50 hover:shadow-xl hover:shadow-[#00A7E1]/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A7E1] to-[#EB1E99] rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
                  4
                </div>
                <div className="w-14 h-14 bg-[#00A7E1]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Gift className="w-7 h-7 text-[#00A7E1]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Le Rebound</h3>
                <p className="text-gray-600">
                  Le client gagne une récompense valable uniquement sur son prochain RDV.
                  Il a une raison concrète de revenir !
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-lg shadow-lg shadow-[#EB1E99]/25"
            >
              Mettre en place Qualee
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* iPhone Carousel Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-white via-[#7209B7]/5 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EB1E99]/10 border border-[#EB1E99]/20 rounded-full mb-6">
              <Smartphone className="w-4 h-4 text-[#EB1E99]" />
              <span className="text-[#EB1E99] text-sm font-medium">L'expérience client</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Découvrez le parcours{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                client
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une expérience fluide et engageante à chaque étape
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-md mx-auto">
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#EB1E99]/50 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#EB1E99]/50 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            {/* Slides Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* iPhone 1 - QR Scan */}
                <div className="w-full flex-shrink-0 flex justify-center px-4">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#EB1E99]/30 to-[#7209B7]/30 rounded-[3rem] blur-2xl scale-105 opacity-100" />

                    {/* iPhone Frame */}
                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl w-[280px]">
                      {/* Notch */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      {/* Screen */}
                      <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        <div className="h-full bg-gradient-to-b from-[#EB1E99]/10 to-white flex flex-col items-center justify-center p-6">
                          <div className="w-32 h-32 bg-white border-4 border-[#EB1E99] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <QrCode className="w-20 h-20 text-[#EB1E99]" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Scannez le QR Code</h3>
                          <p className="text-sm text-gray-600 text-center">En caisse, scannez avec votre smartphone</p>
                        </div>
                      </div>
                    </div>

                    {/* Step Label */}
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EB1E99]/10 rounded-full">
                        <span className="w-6 h-6 bg-[#EB1E99] rounded-full text-white text-sm font-bold flex items-center justify-center">1</span>
                        <span className="text-[#EB1E99] font-medium">Scan QR</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone 2 - Rating */}
                <div className="w-full flex-shrink-0 flex justify-center px-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7209B7]/30 to-[#3A0CA3]/30 rounded-[3rem] blur-2xl scale-105 opacity-100" />

                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl w-[280px]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        <div className="h-full bg-gradient-to-b from-[#7209B7]/10 to-white flex flex-col items-center justify-center p-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#7209B7] to-[#3A0CA3] rounded-full flex items-center justify-center mb-6">
                            <Star className="w-10 h-10 text-white fill-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Notez votre expérience</h3>
                          <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-8 h-8 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 text-center">Partagez votre avis en 1 clic</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7209B7]/10 rounded-full">
                        <span className="w-6 h-6 bg-[#7209B7] rounded-full text-white text-sm font-bold flex items-center justify-center">2</span>
                        <span className="text-[#7209B7] font-medium">Avis Google</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone 3 - Wheel */}
                <div className="w-full flex-shrink-0 flex justify-center px-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3A0CA3]/30 to-[#00A7E1]/30 rounded-[3rem] blur-2xl scale-105 opacity-100" />

                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl w-[280px]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        <div className="h-full bg-gradient-to-b from-[#3A0CA3]/10 to-white flex flex-col items-center justify-center p-6">
                          <div className="relative w-40 h-40 mb-6">
                            <div className="absolute inset-0 bg-gradient-conic from-[#EB1E99] via-[#7209B7] via-[#3A0CA3] via-[#00A7E1] to-[#EB1E99] rounded-full animate-spin-slow" style={{ animationDuration: '10s' }} />
                            <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                              <span className="text-[#EB1E99] font-black text-sm">SPIN</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Tournez la roue !</h3>
                          <p className="text-sm text-gray-600 text-center">Tentez votre chance et gagnez</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A0CA3]/10 rounded-full">
                        <span className="w-6 h-6 bg-[#3A0CA3] rounded-full text-white text-sm font-bold flex items-center justify-center">3</span>
                        <span className="text-[#3A0CA3] font-medium">Roue cadeaux</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone 4 - Prize Won */}
                <div className="w-full flex-shrink-0 flex justify-center px-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00A7E1]/30 to-[#EB1E99]/30 rounded-[3rem] blur-2xl scale-105 opacity-100" />

                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl w-[280px]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        <div className="h-full bg-gradient-to-b from-amber-100 to-white flex flex-col items-center justify-center p-6">
                          <div className="text-5xl mb-4">🎉</div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Félicitations !</h3>
                          <div className="bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold text-xl px-6 py-3 rounded-xl mb-4">
                            -15%
                          </div>
                          <p className="text-sm text-gray-600 text-center">Sur votre prochain RDV</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                        <span className="w-6 h-6 bg-amber-500 rounded-full text-white text-sm font-bold flex items-center justify-center">4</span>
                        <span className="text-amber-600 font-medium">Récompense</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone 5 - WhatsApp */}
                <div className="w-full flex-shrink-0 flex justify-center px-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-green-600/30 rounded-[3rem] blur-2xl scale-105 opacity-100" />

                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl w-[280px]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      <div className="bg-[#0b141a] rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                        {/* WhatsApp Header */}
                        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 mt-8">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EB1E99] to-[#7209B7] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Q</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">Qualee</p>
                            <p className="text-gray-400 text-xs">En ligne</p>
                          </div>
                        </div>

                        {/* Chat */}
                        <div className="p-3 space-y-3">
                          <div className="bg-[#1f2c34] rounded-xl rounded-tl-none px-3 py-2 max-w-[90%]">
                            <p className="text-white text-xs">Votre carte de fidélité a été créditée ! ⭐</p>
                            <p className="text-gray-400 text-[10px] mt-1 text-right">14:32</p>
                          </div>
                          <div className="bg-gradient-to-r from-[#EB1E99]/20 to-[#7209B7]/20 border border-[#EB1E99]/30 rounded-xl rounded-tl-none px-3 py-2 max-w-[90%]">
                            <p className="text-[#EB1E99] font-bold text-xs">🎁 Vous avez gagné -15% !</p>
                            <p className="text-white text-[10px] mt-1">Valable sur votre prochain RDV</p>
                            <p className="text-gray-400 text-[10px] mt-1 text-right">14:33</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                        <span className="w-6 h-6 bg-green-500 rounded-full text-white text-sm font-bold flex items-center justify-center">5</span>
                        <span className="text-green-600 font-medium">WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-3 mt-8">
              {[0, 1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-gradient-to-r from-[#EB1E99] to-[#7209B7] w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Tout ce dont vous avez besoin pour{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                fidéliser
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une plateforme complète pensée pour les professionnels de la beauté
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#EB1E99]/50 hover:shadow-xl hover:shadow-[#EB1E99]/10 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EB1E99]/10 to-[#7209B7]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8 text-[#EB1E99]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Carte de fidélité digitale</h3>
                  <p className="text-gray-600 mb-4">
                    Fini le papier ! Vos clients reçoivent leur carte directement sur WhatsApp.
                    Impossible à perdre.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Envoi instantané via WhatsApp
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Mise à jour automatique des points
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#00A7E1]/50 hover:shadow-xl hover:shadow-[#00A7E1]/10 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00A7E1]/10 to-[#3A0CA3]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-[#00A7E1]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">La Gamification</h3>
                  <p className="text-gray-600 mb-4">
                    Transformez chaque visite en moment ludique avec la Roue des Cadeaux.
                    Vos clients adorent jouer et gagnent des récompenses exclusives.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Roue des cadeaux personnalisable
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Récompenses valables sur le prochain RDV
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#7209B7]/50 hover:shadow-xl hover:shadow-[#7209B7]/10 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7209B7]/10 to-[#3A0CA3]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Star className="w-8 h-8 text-[#7209B7]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Boost Avis Google</h3>
                  <p className="text-gray-600 mb-4">
                    Collectez 10x plus d'avis positifs et grimpez dans les résultats de recherche locaux.
                    Vos concurrents vont vous détester.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Filtrage intelligent des avis négatifs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      +40% d'avis en moyenne
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#3A0CA3]/50 hover:shadow-xl hover:shadow-[#3A0CA3]/10 transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3A0CA3]/10 to-[#00A7E1]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-[#3A0CA3]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Tableau de bord complet</h3>
                  <p className="text-gray-600 mb-4">
                    Suivez vos meilleurs clients, mesurez votre ROI et analysez vos performances
                    en temps réel depuis votre dashboard.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Statistiques détaillées
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      Export des données clients
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Ce que disent nos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                clients
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Des professionnels comme vous qui ont transformé leur fidélisation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#EB1E99]/50 hover:shadow-xl hover:shadow-[#EB1E99]/10 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#EB1E99] fill-[#EB1E99]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                "+40% d'avis Google en seulement 1 mois ! Mes clients adorent tourner la roue.
                C'est devenu un rituel à chaque passage."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Marc Dupont</p>
                  <p className="text-gray-500 text-sm">Barber King - Paris</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#7209B7]/50 hover:shadow-xl hover:shadow-[#7209B7]/10 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#7209B7] fill-[#7209B7]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                "Mes clientes adorent recevoir leur carte de fidélité sur WhatsApp.
                Fini les 'j'ai oublié ma carte'. Le taux de retour a explosé !"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7209B7] to-[#3A0CA3] rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sophie Martin</p>
                  <p className="text-gray-500 text-sm">L'Atelier Beauté - Lyon</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#00A7E1]/50 hover:shadow-xl hover:shadow-[#00A7E1]/10 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#00A7E1] fill-[#00A7E1]" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                "En tant que tatoueur, le bouche-à-oreille est crucial. Qualee m'a permis
                de passer de 3.8 à 4.9 étoiles sur Google en 3 mois."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3A0CA3] to-[#00A7E1] rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Julien Noir</p>
                  <p className="text-gray-500 text-sm">InkMaster Studio - Marseille</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                +500
              </p>
              <p className="text-gray-600 mt-2">Salons équipés</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]">
                40%
              </p>
              <p className="text-gray-600 mt-2">Avis en plus</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3A0CA3] to-[#00A7E1]">
                98%
              </p>
              <p className="text-gray-600 mt-2">Taux d'ouverture WhatsApp</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00A7E1] to-[#EB1E99]">
                2x
              </p>
              <p className="text-gray-600 mt-2">Plus de retours clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A7E1]/10 border border-[#00A7E1]/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#00A7E1]" />
              <span className="text-[#00A7E1] text-sm font-medium">14 jours d'essai gratuit</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Des tarifs simples et{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                transparents
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Sans engagement. Annulez à tout moment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Plan */}
            <div className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Solo</h3>
                <p className="text-gray-600">Parfait pour un établissement unique</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">49€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Facturé mensuellement</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">1 établissement</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Clients illimités</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Roue des cadeaux personnalisable</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Boost Avis Google</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Automatisation WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Dashboard analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-700">Support email</span>
                </li>
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-4 border-2 border-[#3A0CA3]/30 text-[#3A0CA3] font-semibold rounded-full text-center hover:bg-[#3A0CA3]/5 transition-all"
              >
                Commencer l'essai gratuit
              </Link>
            </div>

            {/* Multi Shop Plan */}
            <div className="relative bg-gradient-to-b from-[#EB1E99]/10 to-white border-2 border-[#EB1E99]/50 rounded-3xl p-8 shadow-lg shadow-[#EB1E99]/10">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full text-sm">
                  Le plus populaire
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Multi Shop</h3>
                <p className="text-gray-600">Pour les réseaux multi-établissements</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">99€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">+ 29€/établissement supplémentaire</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Jusqu'à 10 établissements</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Tout du plan Solo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Dashboard centralisé</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Gestion des équipes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">API & Intégrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Rapports personnalisés</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#EB1E99]/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#EB1E99]" />
                  </div>
                  <span className="text-gray-700">Support prioritaire 24/7</span>
                </li>
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full text-center hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all shadow-lg shadow-[#EB1E99]/25"
              >
                Commencer l'essai gratuit
              </Link>
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Besoin d'une solution sur-mesure pour plus de 10 établissements ?
            </p>
            <a href="/contact" className="text-[#EB1E99] hover:text-[#f540ad] font-semibold">
              Contactez notre équipe commerciale →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Questions fréquentes
            </h2>
            <p className="text-gray-600 text-lg">
              Tout ce que vous devez savoir sur Qualee
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-lg pr-4 text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#EB1E99] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#EB1E99]/10 via-[#7209B7]/10 to-[#3A0CA3]/10 rounded-[2rem] p-8 md:p-16 text-center overflow-hidden border border-[#EB1E99]/20">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EB1E99]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7209B7]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Prêt à transformer votre fidélisation client ?
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Rejoignez les +500 salons qui utilisent Qualee pour booster leurs avis Google
                et fidéliser leurs clients automatiquement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#EB1E99]/25"
                >
                  Démarrer mon essai gratuit
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="/contact"
                  className="px-8 py-4 border-2 border-[#3A0CA3]/30 text-[#3A0CA3] font-semibold rounded-full hover:bg-[#3A0CA3]/5 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Parler à un expert
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                14 jours d'essai gratuit • Sans engagement • Configuration en 10 min
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <img
                src="/Logo Qualee pink violet.png"
                alt="Qualee"
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-600 text-sm mb-6">
                La solution de fidélisation client nouvelle génération pour les professionnels de la beauté.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#EB1E99]/10 hover:text-[#EB1E99] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#EB1E99]/10 hover:text-[#EB1E99] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#EB1E99]/10 hover:text-[#EB1E99] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ça marche</a></li>
                <li><a href="#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</a></li>
                <li><a href="#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">À propos</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Contact</a></li>
                <li><a href="/blog" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Blog</a></li>
                <li><a href="/careers" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Carrières</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Politique de confidentialité</a></li>
                <li><a href="/terms" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Conditions d'utilisation</a></li>
                <li><a href="/cookies" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Cookies</a></li>
                <li><a href="/gdpr" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">RGPD</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Qualee. Tous droits réservés.
            </p>
            <p className="text-gray-500 text-sm">
              Fait avec ❤️ pour les professionnels de la beauté
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
