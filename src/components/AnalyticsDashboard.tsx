"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SimpleChart from "./SimpleChart";
import { 
  Users, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const overallAnalytics = useQuery(api.analytics.getOverallAnalytics);
  const dayWiseAnalytics = useQuery(api.analytics.getDayWiseAnalytics);
  const eventAnalytics = useQuery(api.analytics.getEventAnalytics);
  const recentActivity = useQuery(api.analytics.getRecentActivity);

  if (!overallAnalytics || !dayWiseAnalytics || !eventAnalytics || !recentActivity) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Overall Analytics Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{formatCurrency(overallAnalytics.totalRevenue)}</div>
            <div className="text-blue-100">Total Revenue</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{overallAnalytics.totalTickets}</div>
            <div className="text-blue-100">Tickets Sold</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{overallAnalytics.totalUsers}</div>
            <div className="text-blue-100">Total Users</div>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallAnalytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {overallAnalytics.totalTickets} tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              {overallAnalytics.cancelledEvents} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Scanned</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.scannedTickets}</div>
            <p className="text-xs text-muted-foreground">
              of {overallAnalytics.totalTickets} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallAnalytics.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallAnalytics.verifiedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallAnalytics.rejectedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Payment failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallAnalytics.verificationsRequested}</div>
            <p className="text-xs text-muted-foreground">
              Total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallAnalytics.verificationsApproved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Verifications</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallAnalytics.verificationsRejected}</div>
            <p className="text-xs text-muted-foreground">
              Verification failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Chart */}
        <SimpleChart
          title="Payment Status Distribution"
          description="Breakdown of payment verification status"
          data={[
            { label: "Verified", value: overallAnalytics.verifiedPayments, color: "bg-green-500" },
            { label: "Pending", value: overallAnalytics.pendingPayments, color: "bg-yellow-500" },
            { label: "Rejected", value: overallAnalytics.rejectedPayments, color: "bg-red-500" },
          ]}
          type="bar"
        />

        {/* Revenue Trend Chart */}
        <SimpleChart
          title="Revenue Trend (Last 7 Days)"
          description="Daily revenue from ticket sales"
          data={dayWiseAnalytics?.slice(-7).map(day => ({
            label: formatDate(day.date),
            value: day.revenue,
            color: "bg-blue-500"
          })) || []}
          type="line"
        />
      </div>

      {/* Verification Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Verification Analytics (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Daily breakdown of verification requests and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dayWiseAnalytics?.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{formatDate(day.date)}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                      {day.verificationsRequested || 0} requested
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      {day.verificationsApproved || 0} approved
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                      {day.verificationsRejected || 0} rejected
                    </Badge>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <div className="text-sm text-muted-foreground">
                    Approval Rate: {day.verificationsRequested > 0 
                      ? Math.round(((day.verificationsApproved || 0) / day.verificationsRequested) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day-wise Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Last 30 Days Analytics
          </CardTitle>
          <CardDescription>
            Daily breakdown of tickets, payments, and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dayWiseAnalytics?.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-sm font-medium">{formatDate(day.date)}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {day.ticketsCreated} tickets
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(day.revenue)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-yellow-600" />
                    {day.paymentsPending} pending
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {day.paymentsVerified} verified
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    {day.paymentsRejected} rejected
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1 flex-wrap w-full sm:w-auto">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-600" />
                    {day.verificationsRequested || 0} requested
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {day.verificationsApproved || 0} approved
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    {day.verificationsRejected || 0} rejected
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event-wise Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Analytics
          </CardTitle>
          <CardDescription>
            Performance metrics for each event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventAnalytics?.slice(0, 5).map((event) => (
              <div key={event.eventId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{event.eventName}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.eventDate).toLocaleDateString('en-IN')} • {event.location}
                  </div>
                  {event.isCancelled && (
                    <Badge variant="destructive" className="text-xs">Cancelled</Badge>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="font-medium">{formatCurrency(event.totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.scannedTickets}/{event.totalTickets} scanned
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-yellow-600">
                      {event.pendingPayments} pending
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {event.verifiedPayments} verified
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest transactions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'ticket_created' ? 'bg-blue-500' :
                    activity.type === 'payment_verified' ? 'bg-green-500' :
                    activity.type === 'payment_pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{activity.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-sm font-medium w-full sm:w-auto">
                    {formatCurrency(activity.amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
