import { Users, PawPrint, Calendar, ShoppingBag, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const stats = [
  { label: "Total Users", value: "1,234", icon: Users, change: "+12%" },
  { label: "Total Pets", value: "2,567", icon: PawPrint, change: "+8%" },
  { label: "Appointments (Week)", value: "89", icon: Calendar, change: "+5%" },
  { label: "Services Booked", value: "156", icon: ShoppingBag, change: "+15%" },
];

const chartData = [
  { month: "Jan", users: 800, appointments: 120 },
  { month: "Feb", users: 950, appointments: 145 },
  { month: "Mar", users: 1234, appointments: 180 },
];

const mockUsers = [
  { id: "1", name: "Sarah M.", email: "sarah@test.com", role: "owner", pets: 2, active: true },
  { id: "2", name: "John D.", email: "john@test.com", role: "owner", pets: 1, active: true },
  { id: "3", name: "Dr. Smith", email: "smith@vet.com", role: "vet", pets: 0, active: true },
  { id: "4", name: "Admin", email: "admin@larana.com", role: "admin", pets: 0, active: true },
];

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      <PageHeader title="Admin Panel 🔧" subtitle="Platform management" gradient />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-success font-medium">{stat.change}</span>
              </div>
              <p className="mt-2 font-heading text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="analytics" className="mt-6">
        <TabsList>
          <TabsTrigger value="analytics"><BarChart3 className="mr-1 h-3.5 w-3.5" /> Analytics</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1 h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="services"><ShoppingBag className="mr-1 h-3.5 w-3.5" /> Services</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h3 className="font-heading font-bold mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(175, 100%, 35%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h3 className="font-heading font-bold mb-4">Appointments</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="hsl(16, 100%, 66%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-heading font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Email</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Role</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Pets</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">{user.role}</span></td>
                        <td className="px-4 py-3">{user.pets}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center text-muted-foreground">
              Service management coming with database integration.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
