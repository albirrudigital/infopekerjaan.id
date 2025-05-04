import React, { useEffect, useState } from 'react';
import { Card, Button, List, Typography, Space, Divider, Modal, Steps, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './PremiumFeatures.module.css';

const { Title, Text } = Typography;
const { Step } = Steps;

interface PremiumFeature {
  id: number;
  name: string;
  description: string;
  planType: string;
}

interface Subscription {
  planType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface PaymentStatus {
  status: string;
  paymentUrl: string;
  orderId: string;
}

const PremiumFeatures: React.FC = () => {
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetchPremiumData();
  }, []);

  const fetchPremiumData = async () => {
    try {
      const [featuresRes, subscriptionRes] = await Promise.all([
        fetch('/api/premium/features'),
        fetch('/api/premium/subscription')
      ]);

      const featuresData = await featuresRes.json();
      const subscriptionData = await subscriptionRes.json();

      setFeatures(featuresData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching premium data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: string) => {
    setSelectedPlan(planType);
    setPaymentModalVisible(true);
    setCurrentStep(0);

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          duration: 30 // 30 days
        }),
      });

      const data = await response.json();
      setPaymentStatus(data);
      setCurrentStep(1);

      // Open payment URL in new tab
      window.open(data.paymentUrl, '_blank');

      // Start polling payment status
      pollPaymentStatus(data.orderId);
    } catch (error) {
      message.error('Error creating payment transaction');
      setPaymentModalVisible(false);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
          clearInterval(interval);
          setCurrentStep(2);
          message.success('Payment successful!');
          setTimeout(() => {
            setPaymentModalVisible(false);
            fetchPremiumData();
          }, 2000);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          message.error('Payment failed or expired');
          setPaymentModalVisible(false);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 30 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (currentStep !== 2) {
        message.warning('Payment session expired');
        setPaymentModalVisible(false);
      }
    }, 30 * 60 * 1000);
  };

  const renderFeatureList = (planType: string) => {
    const planFeatures = features.filter(f => f.planType === planType);
    
    return (
      <List
        dataSource={planFeatures}
        renderItem={feature => (
          <List.Item>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>{feature.name}</Text>
            </Space>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className={styles.premiumContainer}>
      <Title level={2}>Premium Features</Title>
      
      {subscription && (
        <Card className={styles.subscriptionCard}>
          <Title level={4}>Current Subscription</Title>
          <Text>Plan: {subscription.planType}</Text>
          <br />
          <Text>Status: {subscription.status}</Text>
          <br />
          <Text>Valid until: {new Date(subscription.endDate).toLocaleDateString()}</Text>
        </Card>
      )}

      <Space direction="vertical" size="large" className={styles.fullWidth}>
        <Card title="Basic Plan">
          {renderFeatureList('basic')}
          <Divider />
          <Button type="primary" onClick={() => handleSubscribe('basic')} className={styles.fullWidth}>
            Subscribe Basic
          </Button>
        </Card>

        <Card title="Premium Plan">
          {renderFeatureList('premium')}
          <Divider />
          <Button type="primary" onClick={() => handleSubscribe('premium')} className={styles.fullWidth}>
            Subscribe Premium
          </Button>
        </Card>

        <Card title="Enterprise Plan">
          {renderFeatureList('enterprise')}
          <Divider />
          <Button type="primary" onClick={() => handleSubscribe('enterprise')} className={styles.fullWidth}>
            Subscribe Enterprise
          </Button>
        </Card>
      </Space>

      <Modal
        title="Payment Process"
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <Steps current={currentStep}>
          <Step title="Create Order" description="Creating payment order" />
          <Step title="Payment" description="Complete the payment" />
          <Step title="Success" description="Payment successful" />
        </Steps>

        <div className={styles.modalContent}>
          {currentStep === 0 && <LoadingOutlined />}
          {currentStep === 1 && (
            <div>
              <Text>Please complete the payment in the new tab.</Text>
              <br />
              <Text>This window will automatically update when payment is successful.</Text>
            </div>
          )}
          {currentStep === 2 && (
            <div className={styles.successContent}>
              <CheckCircleOutlined className={styles.successIcon} />
              <Title level={4}>Payment Successful!</Title>
              <Text>Your premium subscription has been activated.</Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PremiumFeatures; 