'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Target,
  Users,
  Sparkles,
  Award,
  Rocket,
  Menu,
  X,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useState } from 'react';

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const team = [
    {
      name: "Alexandre Martin",
      role: "CEO & Co-fondateur",
      bio: "Expert en fidélisation client avec 10 ans d'expérience dans le secteur de la beauté.",
      image: "/team/ceo.jpg"
    },
    {
      name: "Sophie Dubois",
      role: "CTO & Co-fondatrice",
      bio: "Ingénieure passionnée par l'innovation technologique et l'expérience utilisateur.",
      image: "/team/cto.jpg"
    },
    {
      name: "Thomas Bernard",
      role: "Head of Product",
      bio: "Designer produit focalisé sur la création d'expériences digitales mémorables.",
      image: "/team/product.jpg"
    },
    {
      name: "Marie Laurent",
      role: "Head of Customer Success",
      bio: "Dédiée à accompagner nos clients vers le succès et la croissance.",
      image: "/team/success.jpg"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Nous aimons ce que nous faisons et mettons tout notre cœur dans chaque fonctionnalité.",
      color: "#EB1E99"
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Nous visons l'excellence dans tout ce que nous créons pour nos clients.",
      color: "#7209B7"
    },
    {
      icon: Users,
      title: "Proximité",
      description: "Nous restons proches de nos utilisateurs pour comprendre leurs besoins réels.",
      color: "#3A0CA3"
    },
    {
      icon: Rocket,
      title: "Innovation",
      description: "Nous repoussons constamment les limites pour offrir des solutions avant-gardistes.",
      color: "#00A7E1"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Logo Qualee pink violet.png" alt="Qualee" className="h-8 md:h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ça marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalités</Link>
              <Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</Link>
              <Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-[#7209B7] transition-colors text-sm">Connexion</Link>
              <Link href="/auth/signup" className="px-5 py-2.5 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-sm">
                Essai gratuit
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-[#EB1E99]">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-4">
              <Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Comment ça marche</Link>
              <Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Fonctionnalités</Link>
              <Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">Tarifs</Link>
              <Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors py-2">FAQ</Link>
              <hr className="border-gray-200" />
              <Link href="/auth/login" className="text-gray-600 hover:text-[#7209B7] transition-colors py-2">Connexion</Link>
              <Link href="/auth/signup" className="px-5 py-3 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full text-center">
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 px-4 bg-gradient-to-br from-white via-[#EB1E99]/5 to-[#7209B7]/5">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EB1E99]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7209B7]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EB1E99]/10 border border-[#EB1E99]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#EB1E99]" />
            <span className="text-[#EB1E99] text-sm font-medium">Notre histoire</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Réinventer la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              fidélisation client
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Qualee est née d'une conviction simple : la fidélisation client doit être simple,
            engageante et accessible à tous les professionnels de la beauté.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Notre{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                  mission
                </span>
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Nous croyons que chaque salon de beauté, barbier ou institut mérite d'avoir accès
                aux meilleurs outils de fidélisation, jusqu'ici réservés aux grandes enseignes.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                Notre mission est de démocratiser la fidélisation client en proposant une solution
                tout-en-un, intuitive et abordable qui transforme chaque visite en opportunité de
                créer une relation durable.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-full flex items-center justify-center text-white font-bold border-2 border-white">5</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7209B7] to-[#3A0CA3] rounded-full flex items-center justify-center text-white font-bold border-2 border-white">0</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3A0CA3] to-[#00A7E1] rounded-full flex items-center justify-center text-white font-bold border-2 border-white">0</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00A7E1] to-[#EB1E99] rounded-full flex items-center justify-center text-white font-bold border-2 border-white">+</div>
                </div>
                <p className="text-gray-600">salons nous font déjà confiance</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#EB1E99]/20 to-[#7209B7]/20 rounded-3xl blur-[60px]" />
              <div className="relative bg-gradient-to-br from-[#EB1E99]/10 to-[#7209B7]/10 rounded-3xl p-8 border border-[#EB1E99]/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">500+</p>
                    <p className="text-gray-600 mt-2">Salons équipés</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7209B7] to-[#3A0CA3]">50K+</p>
                    <p className="text-gray-600 mt-2">Clients fidélisés</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3A0CA3] to-[#00A7E1]">98%</p>
                    <p className="text-gray-600 mt-2">Satisfaction</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00A7E1] to-[#EB1E99]">40%</p>
                    <p className="text-gray-600 mt-2">Avis en plus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Nos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                valeurs
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ces valeurs guident chacune de nos décisions et façonnent notre culture d'entreprise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all group"
                style={{ '--hover-color': value.color } as React.CSSProperties}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${value.color}15` }}
                >
                  <value.icon className="w-7 h-7" style={{ color: value.color }} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              L'équipe derrière{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                Qualee
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une équipe passionnée, dédiée à révolutionner la fidélisation client.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <div className="aspect-square bg-gradient-to-br from-[#EB1E99]/20 to-[#7209B7]/20 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex gap-2">
                      <a href="#" className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#EB1E99] font-medium text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#EB1E99]/10 via-[#7209B7]/10 to-[#3A0CA3]/10 rounded-[2rem] p-8 md:p-16 text-center overflow-hidden border border-[#EB1E99]/20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EB1E99]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7209B7]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <Award className="w-16 h-16 mx-auto mb-6 text-[#EB1E99]" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Rejoignez l'aventure Qualee
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Prêt à transformer votre fidélisation client ? Commencez votre essai gratuit
                et découvrez pourquoi plus de 500 salons nous font confiance.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-lg shadow-lg shadow-[#EB1E99]/25"
              >
                Démarrer mon essai gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <img src="/Logo Qualee pink violet.png" alt="Qualee" className="h-10 w-auto mb-4" />
              <p className="text-gray-600 text-sm mb-6">
                La solution de fidélisation client nouvelle génération pour les professionnels de la beauté.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
              <ul className="space-y-3">
                <li><Link href="/landing#fonctionnement" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Comment ça marche</Link></li>
                <li><Link href="/landing#fonctionnalites" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Fonctionnalités</Link></li>
                <li><Link href="/landing#tarifs" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Tarifs</Link></li>
                <li><Link href="/landing#faq" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Entreprise</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">À propos</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Carrières</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Politique de confidentialité</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Conditions d'utilisation</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">Cookies</Link></li>
                <li><Link href="/gdpr" className="text-gray-600 hover:text-[#EB1E99] transition-colors text-sm">RGPD</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Qualee. Tous droits réservés.</p>
            <p className="text-gray-500 text-sm">Fait avec ❤️ pour les professionnels de la beauté</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
