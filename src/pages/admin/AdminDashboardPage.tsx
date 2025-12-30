/**
 * Admin Dashboard Page
 * 
 * Complete admin dashboard with KPIs, charts, and management tools.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Star,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getAdminKPIs,
  getRevenueData,
  getTripStatusDistribution,
  getTripSatisfaction,
  getUserGrowthData,
  getAdminAlerts,
  getRecentActivities,
  getQuickStats,
  getUpcomingTripsForAdmin,
} from '../../services/admin.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/date';
import type { Trip } from '../../types';

/**
 * AdminDashboardPage Component
 */
export function AdminDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'month' | 'week' | 'year'>('month');

  // Fetch all data
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['adminKPIs'],
    queryFn: getAdminKPIs,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueData', revenuePeriod],
    queryFn: () => getRevenueData(revenuePeriod),
  });

  const { data: tripStatus, isLoading: tripStatusLoading } = useQuery({
    queryKey: ['tripStatus'],
    queryFn: getTripStatusDistribution,
  });

  const { data: satisfaction, isLoading: satisfactionLoading } = useQuery({
    queryKey: ['tripSatisfaction'],
    queryFn: getTripSatisfaction,
  });

  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['userGrowth'],
    queryFn: getUserGrowthData,
  });

  const { data: alerts } = useQuery({
    queryKey: ['adminAlerts'],
    queryFn: getAdminAlerts,
    refetchInterval: 10000, // Refetch every 10 seconds for alerts
  });

  const { data: activities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => getRecentActivities(20),
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const { data: quickStats } = useQuery({
    queryKey: ['quickStats'],
    queryFn: getQuickStats,
  });

  const { data: upcomingTrips } = useQuery({
    queryKey: ['upcomingTripsAdmin'],
    queryFn: getUpcomingTripsForAdmin,
  });

  /**
   * Export trips to CSV
   */
  const handleExportCSV = (): void => {
    if (!upcomingTrips) return;

    const headers = ['Date', 'Nom', 'Guide', 'Participants', 'Statut'];
    const rows = upcomingTrips.map((trip) => {
      const tripWithGuide = trip as Trip & { guide?: { name: string; phone: string } };
      return [
        formatDate(trip.date),
        trip.title,
        tripWithGuide.guide?.name || 'N/A',
        `${trip.participants.length}/${trip.maxParticipants}`,
        trip.status,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorties-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (kpisLoading || revenueLoading || tripStatusLoading || satisfactionLoading || userGrowthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vue d'ensemble de votre activité
            </p>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              {kpis?.revenue.change !== undefined && (
                <div className={`flex items-center gap-1 ${kpis.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {kpis.revenue.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {kpis.revenue.change >= 0 ? '+' : ''}
                    {kpis.revenue.change.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenu Total</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis?.revenue.current.toLocaleString('fr-FR')} DA
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ce mois
            </p>
          </Card>

          {/* Active Users */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              {kpis?.activeUsers.growthRate !== undefined && (
                <div className={`flex items-center gap-1 ${kpis.activeUsers.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {kpis.activeUsers.growthRate >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {kpis.activeUsers.growthRate >= 0 ? '+' : ''}
                    {kpis.activeUsers.growthRate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Utilisateurs Actifs</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis?.activeUsers.total.toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {kpis?.activeUsers.newThisMonth} nouveaux ce mois
            </p>
          </Card>

          {/* Active Trips */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sorties Actives</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis?.activeTrips.ongoing}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {kpis?.activeTrips.upcomingThisMonth} à venir ce mois • {kpis?.activeTrips.averageFillRate.toFixed(0)}% remplissage
            </p>
          </Card>

          {/* Satisfaction */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Satisfaction Moyenne</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis?.satisfaction.average.toFixed(1)}/5
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {kpis?.satisfaction.totalRatings} avis
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Registrations */}
          <Card title="Revenus & Inscriptions">
            <div className="mb-4 flex gap-2">
              {(['month', 'week', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    revenuePeriod === period
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {period === 'month' ? 'Mois' : period === 'week' ? 'Semaine' : 'Année'}
                </button>
              ))}
            </div>
            {revenueData && revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    name="Revenus (DA)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="registrations"
                    stroke="#10b981"
                    name="Inscriptions"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </Card>

          {/* Trip Status Distribution */}
          <Card title="Sorties par Statut">
            {tripStatus && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Complétées', value: tripStatus.completed },
                      { name: 'En cours', value: tripStatus.ongoing },
                      { name: 'À venir', value: tripStatus.upcoming },
                      { name: 'Annulées', value: tripStatus.cancelled },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[tripStatus.completed, tripStatus.ongoing, tripStatus.upcoming, tripStatus.cancelled].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Satisfaction by Trip */}
          <Card title="Satisfaction par Sortie">
            {satisfaction && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Top 5 mieux notées
                  </h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={satisfaction.topRated} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis dataKey="tripTitle" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="averageRating" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Top 5 moins bien notées
                  </h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={satisfaction.bottomRated} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis dataKey="tripTitle" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="averageRating" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>

          {/* User Growth */}
          <Card title="Croissance Utilisateurs">
            {userGrowth && userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Total utilisateurs"
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Nouveaux utilisateurs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming Trips Table */}
        <Card
          title="Sorties à Venir"
          actions={
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nom
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Guide
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Participants
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingTrips && upcomingTrips.length > 0 ? (
                  upcomingTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(trip.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        {trip.title}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {(trip as { guide?: { name?: string } }).guide?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {trip.participants.length}/{trip.maxParticipants}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          text={trip.status}
                          variant={
                            trip.status === 'upcoming'
                              ? 'info'
                              : trip.status === 'ongoing'
                              ? 'success'
                              : 'default'
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" icon={Eye}>
                            Voir
                          </Button>
                          <Button variant="ghost" size="sm" icon={Edit}>
                            Éditer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucune sortie à venir
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Alerts & Notifications */}
        <Card title="Alertes & Notifications">
          <div className="space-y-3">
            {alerts && alerts.length > 0 ? (
              alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        alert.priority === 'critical'
                          ? 'text-red-500'
                          : alert.priority === 'high'
                          ? 'text-orange-500'
                          : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      text={alert.priority}
                      variant={
                        alert.priority === 'critical'
                          ? 'danger'
                          : alert.priority === 'high'
                          ? 'warning'
                          : 'info'
                      }
                    />
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune alerte
              </p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Activité Récente">
          <div className="space-y-3">
            {activities && activities.length > 0 ? (
              activities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 border-l-4 border-primary bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune activité récente
              </p>
            )}
          </div>
        </Card>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Taux de conversion
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats?.conversionRate.toFixed(1)}%
            </p>
          </Card>
          <Card className="text-center">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Revenu moyen/sortie
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats?.averageRevenuePerTrip.toLocaleString('fr-FR')} DA
            </p>
          </Card>
          <Card className="text-center">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Taux de rétention
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats?.retentionRate.toFixed(1)}%
            </p>
          </Card>
          <Card className="text-center">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">NPS Score</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats?.npsScore}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

