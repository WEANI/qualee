'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Heart,
  Coffee,
  Laptop,
  Users,
  Rocket,
  Menu,
  X,
  Building2
} from 'lucide-react';

export default function CareersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const benefits = [
    {
      icon: Laptop,
      title: "Remote-first",
      description: "Travaillez d'où vous voulez, avec une flexibilité totale.",
      color: "#EB1E99"
    },
    {
      icon: Heart,
      title: "Mutuelle premium",
      description: "Une couverture santé complète pour vous et votre famille.",
      color: "#7209B7"
    },
    {
      icon: Coffee,
      title: "Budget équipement",
      description: "2000€ pour configurer votre espace de travail idéal.",
      color: "#3A0CA3"
    },
    {
      icon: Rocket,
      title: "Formation continue",
      description: "Budget annuel dédié à votre développement professionnel.",
      color: "#00A7E1"
    }
  ];

  const jobs = [
    {
      id: 1,
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Paris / Remote",
      type: "CDI",
      description: "Rejoignez notre équipe tech pour développer des fonctionnalités innovantes et améliorer notre plateforme."
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Paris / Remote",
      type: "CDI",
      description: "Concevez des expériences utilisateur exceptionnelles qui transforment la fidélisation client."
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Paris",
      type: "CDI",
      description: "Accompagnez nos clients vers le succès et devenez leur partenaire de croissance."
    },
    {
      id: 4,
      title: "Growth Marketing Manager",
      department: "Marketing",
      location: "Paris / Remote",
      type: "CDI",
      description: "Développez et exécutez des stratégies d'acquisition pour accélérer notre croissance."
    },
    {
      id: 5,
      title: "Sales Development Representative",
      department: "Sales",
      location: "Paris",
      type: "CDI",
      description: "Identifiez et qualifiez de nouvelles opportunités commerciales dans le secteur de la beauté."
    }
  ];

  const values = [
    {
      title: "Impact",
      description: "Chaque jour, nous aidons des milliers de professionnels à développer leur activité."
    },
    {
      title: "Innovation",
      description: "Nous repoussons les limites de la fidélisation client avec des solutions avant-gardistes."
    },
    {
      title: "Bienveillance",
      description: "Nous cultivons un environnement où chacun peut s'épanouir et grandir."
    },
    {
      title: "Excellence",
      description: "Nous visons l'excellence dans tout ce que nous entreprenons."
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
            <Briefcase className="w-4 h-4 text-[#EB1E99]" />
            <span className="text-[#EB1E99] text-sm font-medium">Rejoignez-nous</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Construisez l'avenir de la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              fidélisation
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Rejoignez une équipe passionnée qui révolutionne la relation client pour
            les professionnels de la beauté.
          </p>

          <a
            href="#offres"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all shadow-lg shadow-[#EB1E99]/25"
          >
            Voir les offres
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Pourquoi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                nous rejoindre
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Chez Qualee, nous croyons que les meilleures idées naissent d'équipes épanouies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all group text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <benefit.icon className="w-8 h-8" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Nos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                valeurs
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EB1E99] to-[#7209B7] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="offres" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Nos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
                offres d'emploi
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Trouvez le poste qui correspond à vos ambitions
            </p>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#EB1E99]/50 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#EB1E99] transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-3 py-1 bg-[#EB1E99]/10 text-[#EB1E99] rounded-full text-xs font-medium">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/careers/${job.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all text-sm whitespace-nowrap"
                  >
                    Postuler
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Matching Job */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#EB1E99]/10 via-[#7209B7]/10 to-[#3A0CA3]/10 rounded-[2rem] p-8 md:p-12 text-center overflow-hidden border border-[#EB1E99]/20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EB1E99]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7209B7]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <Users className="w-16 h-16 mx-auto mb-6 text-[#EB1E99]" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Vous ne trouvez pas le poste idéal ?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Envoyez-nous votre candidature spontanée. Nous sommes toujours à la recherche
                de talents exceptionnels.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-bold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all shadow-lg shadow-[#EB1E99]/25"
              >
                Candidature spontanée
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
