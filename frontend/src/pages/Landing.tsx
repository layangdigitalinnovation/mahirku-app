import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Shield, Zap, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getReferralId } from '../utils/referral';

export const Landing: React.FC = () => {
  useEffect(() => {
    // Track referral if present in URL
    getReferralId();
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Cognitive Style Analysis',
      description: 'Discover your unique thinking patterns through advanced numerology-based assessment.'
    },
    {
      icon: Shield,
      title: 'Biometric Security',
      description: 'Secure your results with fingerprint scanning technology for verified authenticity.'
    },
    {
      icon: TrendingUp,
      title: 'Referral System',
      description: 'Earn commissions by sharing NeuroScan with others as a verified affiliator.'
    },
    {
      icon: Eye,
      title: 'Deep Insights',
      description: 'Get detailed analysis of your cognitive strengths and behavioral patterns.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Brain className="h-20 w-20 text-blue-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                Cognitive Style
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Unlock the secrets of your thinking patterns with our advanced numerology-based assessment 
              and biometric verification system.
            </p>
            <div className="space-x-4">
              <Link to="/test">
                <Button size="lg" className="bg-slate-300 text-blue-600 hover:bg-blue-50">
                  <Zap className="mr-2" />
                  Take the Test
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Join as Affiliator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Mahirku?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the most advanced cognitive assessment platform with cutting-edge technology 
              and proven methodologies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:scale-105 transition-transform">
                <CardContent>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Tests Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Affiliators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Your Cognitive Style?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have unlocked their potential with Mahirku.
          </p>
          <Link to="/test">
            <Button size="lg" className="bg-orange-500 text-blue-600 hover:bg-blue-50">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};