import { Card, CardContent } from "@/components/ui/Card";
import { useGetAllCountTest } from "@/hooks/useThinkingStyleTest";
import { useUsers } from "@/hooks/useUsers";
import formatCurrency from "@/utils/formatCurrency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line} from 'recharts';

export default function OverviewPage() {
    const { data: users } = useUsers();
    const { data: testCount } = useGetAllCountTest();
  const totalUsers = users?.length || 0;


  const data = [
    { label: "Total Pengguna", value: totalUsers },
    { label: "Total Tes", value: testCount?.data.total || 0 },
  ];





  // Data untuk berbagai chart
  const monthlyData = [
    { bulan: 'Jan', pengguna: 800, tes: 200, keuntungan: 3200000 },
    { bulan: 'Feb', pengguna: 850, tes: 220, keuntungan: 3500000 },
    { bulan: 'Mar', pengguna: 920, tes: 280, keuntungan: 4100000 },
    { bulan: 'Apr', pengguna: 980, tes: 300, keuntungan: 4300000 },
    { bulan: 'May', pengguna: 1100, tes: 330, keuntungan: 4800000 },
    { bulan: 'Jun', pengguna: 1200, tes: 350, keuntungan: 5000000 },
  ];




  const CustomTooltip = ({ active, payload, label } : any) => {
    if (active && payload && payload.length) {
      return (
        <div className="w-full bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{`Bulan: ${label}`}</p>
          {payload.map((entry : any, index : any) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'keuntungan' 
                ? `${entry.name}: ${formatCurrency(entry.value)}`
                : `${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="container w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Ringkasan performa sistem testing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((item, index) => (
            <Card key={index} className="bg-white col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium text-sm mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-green-100 text-green-600' :
                    index === 2 ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index === 0 ? '👥' : 
                     index === 1 ? '📋' :
                     index === 2 ? '💰' : '⏳'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tren Bulanan */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tren Pertumbuhan Bulanan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="bulan" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="pengguna" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Pengguna"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tes" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Tes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribusi Jenis Tes */}
          {/* <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Distribusi Jenis Tes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tesTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tesTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Persentase']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {tesTypeData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}

          {/* Perbandingan Metrik */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Perbandingan Pengguna vs Tes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="bulan"
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pengguna" fill="#3B82F6" name="Pengguna" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="tes" fill="#10B981" name="Tes" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Summary Stats */}
        {/* <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border-0">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="text-lg font-semibold mb-2">Rata-rata Tes per Pengguna</h4>
                <p className="text-3xl font-bold">{(350/1200).toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Pertumbuhan Pengguna</h4>
                <p className="text-3xl font-bold text-green-300">+50%</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Keuntungan per Tes</h4>
                <p className="text-3xl font-bold">{formatCurrency(5000000/350)}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}

      </div>
    </div>
  );
}