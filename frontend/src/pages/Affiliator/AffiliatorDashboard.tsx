import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Copy, Share2, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { generateReferralLink } from '../../utils/referral';

export const AffiliatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalTests: 0,
    totalCommission: 0,
    pendingCommission: 0
  });
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (user) {
      setReferralLink(generateReferralLink(user.uid));
      fetchAffiliatorData();
    }
  }, [user]);

  const fetchAffiliatorData = async () => {
    if (!user) return;
    
    try {
      // Fetch commissions from localStorage (mock database)
      const allCommissions = JSON.parse(localStorage.getItem('neuroscan-commissions') || '[]');
      const userCommissions = allCommissions.filter((commission: any) => commission.affiliatorId === user.uid);
      
      // Sort by timestamp (newest first)
      userCommissions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      let totalCommission = 0;
      let pendingCommission = 0;
      
      userCommissions.forEach((commission: any) => {
        totalCommission += commission.amount;
        if (commission.status === 'pending') {
          pendingCommission += commission.amount;
        }
      });
      
      setCommissions(userCommissions);
      setStats({
        totalClicks: 0, // This would need click tracking implementation
        totalTests: userCommissions.length,
        totalCommission,
        pendingCommission
      });
    } catch (error) {
      console.error('Error fetching affiliator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NeuroScan - Discover Your Cognitive Style',
          text: 'Take this amazing cognitive style test and discover your unique thinking patterns!',
          url: referralLink
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliator Dashboard</h1>
          <p className="text-gray-600">Track your referrals and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-10 w-10 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats.totalCommission.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats.pendingCommission.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Group Invitation */}
        <Card className="mb-8 bg-green-50 border border-green-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="h-10 w-10 mr-3"
              />
            <div>
              <h2 className="text-xl font-semibold text-green-800">Join Our Affiliator WhatsApp Group</h2>
              <p className="text-sm text-green-700">Stay connected and get the latest updates, tips, and support.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <a
            href="https://chat.whatsapp.com/Eceagjt11Il9dFcDndtWiQ?mode=r_c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            Join WhatsApp Group
          </a>
        </CardContent>
      </Card>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Referral Link</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 break-all">{referralLink}</p>
            </div>
            <div className="space-x-3">
              <Button onClick={copyReferralLink} icon={Copy}>
                Copy Link
              </Button>
              <Button onClick={shareReferralLink} variant="outline" icon={Share2}>
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Commission History</h2>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions yet</h3>
                <p className="text-gray-600 mb-4">Share your referral link to start earning</p>
                <Button onClick={shareReferralLink} icon={Share2}>
                  Share Your Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Rp {commission.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(commission.timestamp).toLocaleDateString()} • 
                          Test ID: {commission.testId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        commission.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {commission.status}
                      </span>
                      <Button variant="ghost" size="sm" icon={Eye}>
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};