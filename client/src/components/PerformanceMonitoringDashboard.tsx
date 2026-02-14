/**
 * Performance Monitoring Dashboard
 * RusingÂcademy Learning Ecosystem
 * 
 * Real-time monitoring dashboard for tracking KPIs including
 * traffic, conversion rates, email performance, and Core Web Vitals.
 * 
 * @copyright Rusinga International Consulting Ltd.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Mail, FileText, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface KPIMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
}

interface ConversionFunnelData {
  stage: string;
  visitors: number;
  percentage: number;
}

interface EmailMetrics {
  campaign: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

const mockKPIs: KPIMetric[] = [
  { label: 'Total Visitors', value: 2847, change: 12.5, trend: 'up', target: 3000 },
  { label: 'Quiz Completions', value: 423, change: 8.3, trend: 'up', target: 500 },
  { label: 'Leads Generated', value: 389, change: 15.2, trend: 'up', target: 400 },
  { label: 'Conversion Rate', value: 13.7, change: 2.1, trend: 'up', target: 15 }
];

const mockFunnelData: ConversionFunnelData[] = [
  { stage: 'Page Visit', visitors: 2847, percentage: 100 },
  { stage: 'Quiz Started', visitors: 1256, percentage: 44.1 },
  { stage: 'Quiz Completed', visitors: 423, percentage: 14.9 },
  { stage: 'PDF Downloaded', visitors: 389, percentage: 13.7 },
  { stage: 'Booking Made', visitors: 87, percentage: 3.1 }
];

const mockEmailMetrics: EmailMetrics[] = [
  { campaign: 'Diagnostic Report', sent: 389, delivered: 385, opened: 231, clicked: 89, openRate: 60.0, clickRate: 23.1 },
  { campaign: 'Success Story (+24h)', sent: 312, delivered: 309, opened: 156, clicked: 45, openRate: 50.5, clickRate: 14.6 },
  { campaign: 'Free Session (+48h)', sent: 245, delivered: 243, opened: 134, clicked: 67, openRate: 55.1, clickRate: 27.6 }
];

const mockWebVitals: CoreWebVitals = { lcp: 5.3, fid: 60, cls: 0, fcp: 2.5, ttfb: 0.8 };

const KPICard: React.FC<{ metric: KPIMetric }> = ({ metric }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
      {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{metric.value.toLocaleString()}{metric.label.includes('Rate') ? '%' : ''}</div>
      <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {metric.trend === 'up' ? '+' : ''}{metric.change}% from last week
      </p>
      {metric.target && <Progress value={(metric.value / metric.target) * 100} className="mt-2" />}
    </CardContent>
  </Card>
);

const WebVitalsCard: React.FC<{ vitals: CoreWebVitals }> = ({ vitals }) => {
  const getStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1.8, poor: 3.0 },
      ttfb: { good: 0.8, poor: 1.8 }
    };
    const t = thresholds[metric];
    if (value <= t.good) return 'good';
    if (value <= t.poor) return 'needs-improvement';
    return 'poor';
  };

  return (
    <Card>
      <CardHeader><CardTitle>Core Web Vitals</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(vitals).map(([key, value]) => {
          const status = getStatus(key, value);
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase">{key}</span>
              <Badge variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}>
                {value}{key === 'cls' ? '' : key === 'fid' ? 'ms' : 's'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default function PerformanceMonitoringDashboard() {
  const [kpis, setKpis] = useState<KPIMetric[]>(mockKPIs);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>(mockFunnelData);
  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics[]>(mockEmailMetrics);
  const [webVitals, setWebVitals] = useState<CoreWebVitals>(mockWebVitals);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="email">Email Performance</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, index) => <KPICard key={index} metric={kpi} />)}
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader><CardTitle>Diagnostic Quiz Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              {funnelData.map((stage, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stage.stage}</span>
                    <span>{stage.visitors.toLocaleString()} ({stage.percentage}%)</span>
                  </div>
                  <Progress value={stage.percentage} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader><CardTitle>Email Campaign Performance</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Campaign</th>
                    <th className="text-right p-2">Sent</th>
                    <th className="text-right p-2">Open Rate</th>
                    <th className="text-right p-2">Click Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {emailMetrics.map((email, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{email.campaign}</td>
                      <td className="text-right p-2">{email.sent}</td>
                      <td className="text-right p-2">{email.openRate}%</td>
                      <td className="text-right p-2">{email.clickRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <WebVitalsCard vitals={webVitals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
