"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import {
  FileText,
  Users,
  Zap,
  Shield,
  Download,
  Star,
  ArrowRight,
  Github,
  Mail,
  BookOpen,
  Home,
  Play,
  Sparkles,
  Globe,
  Share2,
  FolderOpen,
  PenTool,
  Cloud,
  CheckCircle2,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
} from "lucide-react";
import Button from "./components/ui/Button";
import FeatureCard from "./components/ui/FeatureCard";
import PricingCard from "./components/ui/PricingCard";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const features = [
    {
      icon: PenTool,
      title: "Rich Text Editor",
      description: "Powerful Lexical-based editor with advanced formatting, tables, and media support",
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together with live cursors, typing indicators, and instant sync across devices",
    },
    {
      icon: Cloud,
      title: "Auto-save & Sync",
      description: "Never lose your work with intelligent cloud saving and cross-device synchronization",
    },
    {
      icon: FolderOpen,
      title: "Smart Organization",
      description: "Organize documents in folders, add tags, and find what you need instantly",
    },
    {
      icon: Share2,
      title: "Secure Sharing",
      description: "Share documents with customizable permissions and real-time access control",
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Export to Markdown, PDF, or Word formats for easy sharing and publishing",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SSO integration, and compliance-ready security features",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with instant loading and smooth real-time updates",
    },
  ];

  const pricingPlans = [
    {
      title: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 10 documents",
        "Basic collaboration features",
        "Standard export formats",
        "Community support",
        "100MB storage",
      ],
      popular: false,
      ctaText: "Get Started Free",
      onCtaClick: handleGetStarted,
    },
    {
      title: "Pro",
      price: "$12",
      period: "month",
      description: "Best for teams and power users",
      features: [
        "Unlimited documents",
        "Advanced collaboration tools",
        "Priority support",
        "Custom templates",
        "10GB storage",
        "Advanced analytics",
        "Team management",
        "API access",
      ],
      popular: true,
      ctaText: "Start Pro Trial",
      onCtaClick: handleGetStarted,
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "month",
      description: "For large organizations with specific needs",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "Compliance features",
        "Custom branding",
        "SLA guarantees",
      ],
      popular: false,
      ctaText: "Contact Sales",
      onCtaClick: () => window.open("mailto:sales@notestack.com", "_blank"),
    },
  ];

  const useCases = [
    {
      icon: Monitor,
      title: "Desktop & Web",
      description: "Full-featured editor in your browser with offline support",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Optimized for touch with gesture controls and mobile layouts",
    },
    {
      icon: Tablet,
      title: "Tablet Ready",
      description: "Perfect for note-taking and content creation on tablets",
    },
    {
      icon: Laptop,
      title: "Cross Platform",
      description: "Seamless experience across Windows, Mac, and Linux",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Note Stack
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="primary"
                  size="md"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  variant="primary"
                  size="md"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-20 sm:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8">
                <Sparkles size={16} />
                The future of collaborative writing
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                Write, Collaborate,{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Organize
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
                The modern way to create documents, collaborate in real-time, and organize your knowledge. 
                Built for teams who want to write better together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  variant="primary"
                  size="xl"
                  className="group"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                
                <Button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  variant="outline"
                  size="xl"
                  className="group"
                >
                  <Play size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Social proof */}
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - App Preview */}
            <div className="relative z-10">
              <div className="relative">
                {/* Main app window */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center text-sm text-gray-500">Note Stack - Document Editor</div>
                  </div>
                  
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                      <PenTool size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                      <Users size={16} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                      <Share2 size={16} className="text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Content preview */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                  </div>
                  
                  {/* Collaboration indicators */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <span className="text-xs text-gray-500">3 people editing</span>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle2 size={16} />
                    <span>Auto-saved</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                    <Zap size={16} />
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need to write better
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make collaboration seamless and writing enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Works everywhere you do
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Access your documents from any device, anywhere in the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <useCase.icon size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start free and upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                ctaText={plan.ctaText}
                onCtaClick={plan.onCtaClick}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Need a custom plan? <a href="mailto:sales@notestack.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contact our sales team</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your writing experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who are already using Note Stack to create, collaborate, and organize their work.
          </p>
          
          <Button
            onClick={handleGetStarted}
            variant="secondary"
            size="xl"
            className="group bg-white hover:bg-gray-50 text-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Writing Today
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Note Stack
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                The modern way to write, collaborate, and organize. Built for teams who want to create amazing content together.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <Home size={16} />
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <Star size={16} />
                    Features
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                    <BookOpen size={16} />
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Connect */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                    <Github size={16} />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                    <Mail size={16} />
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2">
                    <Globe size={16} />
                    Website
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Note Stack. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Built with Next.js, TailwindCSS &amp; ❤️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
