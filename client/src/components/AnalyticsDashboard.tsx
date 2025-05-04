import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, message, Alert, List, Avatar, Badge, Select, Button } from 'antd';
import { Line, Bar, Funnel } from '@ant-design/plots';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatCurrency, formatDate } from '../utils/formatters';
import styles from './AnalyticsDashboard.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Metric {
  totalRevenue: number;
  premiumUsers: number;
  conversionRate: number;
  mrr: number;
  churnRate: number;
  anomalies: string[];
}

interface RevenueByPlan {
  planType: string;
  revenue: number;
}

interface CohortData {
  cohortMonth: string;
  userCount: number;
  retentionRate: number;
}

interface FunnelData {
  stage: string;
  count: number;
  conversionRate: number;
}

interface Prediction {
  metricName: string;
  currentValue: number;
  predictedValue: number;
  date: Date;
}

interface ChurnRisk {
  userId: string;
  riskScore: number;
  lastPaymentDate: Date;
  planType: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  type: 'active' | 'referrer' | 'paying';
}

interface Company {
  id: string;
  name: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('global');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<Metric[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [loading, setLoading] = useState(false);

  const { data: wsData, subscribe, unsubscribe } = useWebSocket('ws://localhost:8080');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      subscribe(selectedCompany === 'global' ? undefined : selectedCompany);

      fetchCurrentMetrics();
      fetchHistoricalMetrics();
      fetchRevenueByPlan();
      fetchCohortAnalysis();
      fetchConversionFunnel();
    }

    return () => {
      unsubscribe(selectedCompany === 'global' ? undefined : selectedCompany);
    };
  }, [selectedCompany, subscribe, unsubscribe]);

  useEffect(() => {
    if (wsData) {
      switch (wsData.type) {
        case 'metrics':
          setMetrics(wsData.data);
          break;
        case 'anomaly':
          setAnomalies(prev => [...prev, wsData.data]);
          break;
        case 'revenue':
          setRevenueByPlan(wsData.data);
          break;
        case 'cohort':
          setCohortData(wsData.data);
          break;
        case 'funnel':
          setFunnelData(wsData.data);
          break;
      }
    }
  }, [wsData]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      message.error('Failed to fetch companies');
    }
  };

  const fetchCurrentMetrics = async () => {
    try {
      const url = selectedCompany
        ? `/api/analytics/metrics/current?companyId=${selectedCompany}`
        : '/api/analytics/metrics/current';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      message.error('Failed to fetch metrics');
    }
  };

  const fetchHistoricalMetrics = async () => {
    if (!dateRange) return;
    try {
      const url = selectedCompany
        ? `/api/analytics/metrics/range?startDate=${dateRange[0]}&endDate=${dateRange[1]}`
        : `/api/analytics/metrics/range?startDate=${dateRange[0]}&endDate=${dateRange[1]}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch historical metrics');
      const data = await response.json();
      setHistoricalMetrics(data);
    } catch (error) {
      message.error('Failed to fetch historical metrics');
    }
  };

  const fetchRevenueByPlan = async () => {
    if (!dateRange) return;
    try {
      const url = selectedCompany
        ? `/api/analytics/revenue/plans?startDate=${dateRange[0]}&endDate=${dateRange[1]}`
        : `/api/analytics/revenue/plans?startDate=${dateRange[0]}&endDate=${dateRange[1]}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch revenue by plan');
      const data = await response.json();
      setRevenueByPlan(data);
    } catch (error) {
      message.error('Failed to fetch revenue by plan');
    }
  };

  const fetchCohortAnalysis = async () => {
    try {
      const url = selectedCompany
        ? `/api/analytics/cohorts?companyId=${selectedCompany}`
        : '/api/analytics/cohorts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cohort analysis');
      const data = await response.json();
      setCohortData(data);
    } catch (error) {
      message.error('Failed to fetch cohort analysis');
    }
  };

  const fetchConversionFunnel = async () => {
    try {
      const url = selectedCompany
        ? `/api/analytics/funnel?companyId=${selectedCompany}`
        : '/api/analytics/funnel';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch conversion funnel');
      const data = await response.json();
      setFunnelData(data);
    } catch (error) {
      message.error('Failed to fetch conversion funnel');
    }
  };

  const generateMonthlyReport = async () => {
    setLoading(true);
    try {
      const url = selectedCompany
        ? `/api/analytics/report/monthly?companyId=${selectedCompany}`
        : '/api/analytics/report/monthly';
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate report');
      message.success('Monthly report generated successfully');
    } catch (error) {
      message.error('Failed to generate monthly report');
    } finally {
      setLoading(false);
    }
  };

  const revenueConfig = {
    data: historicalMetrics,
    xField: 'date',
    yField: 'totalRevenue',
    point: { size: 5, shape: 'diamond' },
    label: {
      style: { fill: '#aaa' },
    },
  };

  const cohortConfig = {
    data: cohortData,
    xField: 'cohortMonth',
    yField: 'retentionRate',
    seriesField: 'cohortMonth',
    isStack: true,
  };

  const funnelConfig = {
    data: funnelData,
    xField: 'stage',
    yField: 'count',
    conversionTag: {
      formatter: (datum: any) => {
        return ((datum.$$percentage$$ * 100).toFixed(2) + '%');
      },
    },
  };

  return (
    <div className={styles.dashboardContainer}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Select
            className={styles.selectCompany}
            value={selectedCompany}
            onChange={setSelectedCompany}
          >
            <Select.Option value="global">Global Analytics</Select.Option>
            {companies.map(company => (
              <Select.Option key={company.id} value={company.id}>
                {company.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      {anomalies.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert
              message="Anomalies Detected"
              description={
                <ul>
                  {anomalies.map((anomaly, index) => (
                    <li key={index}>
                      {anomaly.type}: {anomaly.message}
                    </li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
            />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} className={styles.metricsRow}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={metrics?.totalRevenue}
              formatter={value => formatCurrency(value as number)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Premium Users"
              value={metrics?.premiumUsers}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={metrics?.conversionRate}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="MRR"
              value={metrics?.mrr}
              formatter={value => formatCurrency(value as number)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Historical Revenue">
            <RangePicker
              onChange={(dates) => setDateRange(dates as [string, string])}
              className={styles.rangePicker}
            />
            <div className={styles.chartContainer}>
              <Line {...revenueConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Cohort Analysis">
            <Bar {...cohortConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Conversion Funnel">
            <Funnel {...funnelConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Revenue by Plan">
            <Table
              dataSource={revenueByPlan}
              columns={[
                {
                  title: 'Plan Type',
                  dataIndex: 'planType',
                  key: 'planType',
                },
                {
                  title: 'Revenue',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  render: (value) => formatCurrency(value),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <button
              onClick={generateMonthlyReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Monthly Report'}
            </button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard; 