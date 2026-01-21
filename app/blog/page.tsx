'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Menu,
  X,
  Search
} from 'lucide-react';

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous les articles' },
    { id: 'fidelisation', name: 'Fidélisation' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'conseils', name: 'Conseils' },
    { id: 'actualites', name: 'Actualités' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "10 stratégies pour fidéliser vos clients en salon de beauté",
      excerpt: "Découvrez les meilleures pratiques pour transformer vos visiteurs occasionnels en clients fidèles et ambassadeurs de votre marque.",
      category: "fidelisation",
      date: "15 Jan 2025",
      readTime: "8 min",
      image: "/blog/fidelisation.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Comment obtenir plus d'avis Google pour votre salon",
      excerpt: "Les avis Google sont essentiels pour votre visibilité. Voici nos conseils pour encourager vos clients à partager leur expérience.",
      category: "marketing",
      date: "12 Jan 2025",
      readTime: "6 min",
      image: "/blog/google-reviews.jpg",
      featured: false
    },
    {
      id: 3,
      title: "WhatsApp Business : le guide complet pour les professionnels de la beauté",
      excerpt: "Exploitez tout le potentiel de WhatsApp pour communiquer avec vos clients et booster votre activité.",
      category: "conseils",
      date: "10 Jan 2025",
      readTime: "10 min",
      image: "/blog/whatsapp.jpg",
      featured: false
    },
    {
      id: 4,
      title: "Les tendances marketing beauté pour 2025",
      excerpt: "Quelles sont les stratégies qui fonctionneront cette année ? Notre analyse des tendances à suivre.",
      category: "actualites",
      date: "8 Jan 2025",
      readTime: "7 min",
      image: "/blog/trends.jpg",
      featured: false
    },
    {
      id: 5,
      title: "Créer un programme de fidélité efficace : le guide étape par étape",
      excerpt: "Tout ce que vous devez savoir pour mettre en place un programme de fidélité qui engage vraiment vos clients.",
      category: "fidelisation",
      date: "5 Jan 2025",
      readTime: "12 min",
      image: "/blog/loyalty-program.jpg",
      featured: false
    },
    {
      id: 6,
      title: "Réseaux sociaux : comment promouvoir votre salon efficacement",
      excerpt: "Instagram, TikTok, Facebook... Quelle stratégie adopter pour maximiser votre présence en ligne ?",
      category: "marketing",
      date: "2 Jan 2025",
      readTime: "9 min",
      image: "/blog/social-media.jpg",
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
            <BookOpen className="w-4 h-4 text-[#EB1E99]" />
            <span className="text-[#EB1E99] text-sm font-medium">Blog Qualee</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Ressources et{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB1E99] to-[#7209B7]">
              conseils
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Découvrez nos articles, guides et conseils pour optimiser votre fidélisation client
            et développer votre activité.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#EB1E99]/20 focus:border-[#EB1E99] transition-all outline-none"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'all' && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-[#EB1E99]/20 to-[#7209B7]/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-[#EB1E99]/30" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-[#EB1E99]/10 text-[#EB1E99] rounded-full text-sm font-medium">
                    Article à la une
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime} de lecture
                  </span>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 text-[#EB1E99] font-semibold hover:text-[#7209B7] transition-colors"
                  >
                    Lire l'article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-[#EB1E99]/30 transition-all group"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-[#EB1E99]/10 to-[#7209B7]/10 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-[#EB1E99]/20 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#EB1E99] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-[#EB1E99] font-medium text-sm hover:text-[#7209B7] transition-colors flex items-center gap-1"
                    >
                      Lire
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-[#EB1E99]/30 text-[#EB1E99] font-semibold rounded-full hover:bg-[#EB1E99]/5 transition-all">
              Charger plus d'articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#EB1E99]/10 via-[#7209B7]/10 to-[#3A0CA3]/10 rounded-[2rem] p-8 md:p-12 text-center overflow-hidden border border-[#EB1E99]/20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EB1E99]/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7209B7]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Restez informé
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Recevez nos derniers articles et conseils directement dans votre boîte mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-5 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#EB1E99]/20 focus:border-[#EB1E99] transition-all outline-none"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-[#EB1E99] to-[#7209B7] text-white font-semibold rounded-full hover:from-[#f540ad] hover:to-[#8a1ed1] transition-all">
                  S'abonner
                </button>
              </div>
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
