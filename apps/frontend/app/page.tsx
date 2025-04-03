"use client"
import React, { useEffect, useState } from "react";
import { Activity, Bell, Clock, Server, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
    <div className="mb-4 text-indigo-600 dark:text-indigo-400">{icon}</div>
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-lg">{description}</p>
  </div>
);

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, featured = false }) => (
  <div className={`p-8 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 transition-transform hover:scale-105 ${featured ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white"}`}>
    <h3 className="text-2xl font-semibold mb-4">{title}</h3>
    <div className="mb-6">
      <span className="text-5xl font-bold">${price}</span>
      <span className="text-lg">/month</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-lg">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-xl text-lg font-semibold transition ${featured ? "bg-white text-indigo-600 hover:bg-gray-100" : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700"}`}>
      Get Started
    </button>
  </div>
);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <section className="container mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
          WebGuard: Secure & Reliable Monitoring
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Stay ahead with real-time monitoring, instant alerts, and in-depth analytics.
        </p>
        <div className="mt-8 flex justify-center space-x-6">
          <button onClick={() => router.push("/dashboard")} className="px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition flex items-center">
            Start Monitoring
            <ArrowRight className="ml-2 h-6 w-6" />
          </button>
          <button className="px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-lg font-semibold hover:border-gray-400 dark:hover:border-gray-500 transition dark:text-white">
            View Demo
          </button>
        </div>
      </section>

      <section id="features" className="bg-gray-50 dark:bg-gray-800/50 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard icon={<Bell className="h-10 w-10" />} title="Instant Alerts" description="Receive notifications the moment an issue is detected." />
            <FeatureCard icon={<Clock className="h-10 w-10" />} title="24/7 Monitoring" description="Keep an eye on uptime and performance round-the-clock." />
            <FeatureCard icon={<Server className="h-10 w-10" />} title="Detailed Reports" description="Get insights and analytics on your service health." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
