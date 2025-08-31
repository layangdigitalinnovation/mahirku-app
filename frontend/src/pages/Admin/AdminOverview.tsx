import { Card, CardContent } from "@/components/ui/Card";

export default function OverviewPage() {
  const data = [
    { label: "Total Users", value: 1200 },
    { label: "Total Tests", value: 350 },
    { label: "Total Commissions", value: `Rp ${new Intl.NumberFormat('id-ID').format(5000000)}` },
    { label: "Pending Commissions", value: `Rp ${new Intl.NumberFormat('id-ID').format(1200000)}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 space-y-6">
      
      <div className="container mx-auto py-20 grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item, index) => (
          <Card className="bg-primary-100!" key={index}>
            <CardContent className="p-6">
              <p className="text-primary-900 font-bold font-heading">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
