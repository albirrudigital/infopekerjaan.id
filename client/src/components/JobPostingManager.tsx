import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, List, Typography, Modal, Select, DatePicker, Tag, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface JobPosting {
  id: number;
  perusahaan: string;
  posisi: string;
  lokasi: string;
  deskripsi: string;
  kualifikasi: string;
  batas_lamaran: string;
  status: 'active' | 'expired' | 'draft';
  created_at: string;
  views: number;
  applications: number;
}

interface PremiumFeature {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const JobPostingManager: React.FC = () => {
  const { user } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, featuresRes] = await Promise.all([
        fetch('/api/job-postings'),
        fetch('/api/premium-features')
      ]);

      const [jobsData, featuresData] = await Promise.all([
        jobsRes.json(),
        featuresRes.json()
      ]);

      if (jobsData.success) setJobPostings(jobsData.data);
      if (featuresData.success) setPremiumFeatures(featuresData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (values: any) => {
    try {
      const response = await fetch('/api/job-postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('Job posting created successfully');
        fetchData();
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      message.error('Failed to create job posting');
    }
  };

  const handleUpdateJob = async (values: any) => {
    if (!editingJob) return;

    try {
      const response = await fetch(`/api/job-postings/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('Job posting updated successfully');
        fetchData();
        setIsModalVisible(false);
        setEditingJob(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error updating job posting:', error);
      message.error('Failed to update job posting');
    }
  };

  const handleDeleteJob = async (id: number) => {
    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        message.success('Job posting deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting job posting:', error);
      message.error('Failed to delete job posting');
    }
  };

  const handlePublishJob = async (id: number) => {
    try {
      const response = await fetch(`/api/job-postings/${id}/publish`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        message.success('Job posting published successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error publishing job posting:', error);
      message.error('Failed to publish job posting');
    }
  };

  const handleUnpublishJob = async (id: number) => {
    try {
      const response = await fetch(`/api/job-postings/${id}/unpublish`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        message.success('Job posting unpublished successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error unpublishing job posting:', error);
      message.error('Failed to unpublish job posting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'draft':
        return 'orange';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Card 
        title="Job Postings" 
        loading={loading}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingJob(null);
              setIsModalVisible(true);
            }}
          >
            Create New Job Posting
          </Button>
        }
      >
        <List
          dataSource={jobPostings}
          renderItem={(job) => (
            <List.Item
              actions={[
                <Tooltip title="View Details">
                  <Button type="text" icon={<EyeOutlined />} />
                </Tooltip>,
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingJob(job);
                      form.setFieldsValue({
                        ...job,
                        batas_lamaran: moment(job.batas_lamaran)
                      });
                      setIsModalVisible(true);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteJob(job.id)}
                  />
                </Tooltip>,
                job.status === 'draft' ? (
                  <Button type="primary" onClick={() => handlePublishJob(job.id)}>
                    Publish
                  </Button>
                ) : (
                  <Button onClick={() => handleUnpublishJob(job.id)}>
                    Unpublish
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{job.posisi}</Text>
                    <Tag color={getStatusColor(job.status)}>{job.status}</Tag>
                  </Space>
                }
                description={
                  <>
                    <Text>{job.perusahaan}</Text>
                    <br />
                    <Text type="secondary">{job.lokasi}</Text>
                    <br />
                    <Space>
                      <Text type="secondary">
                        <EyeOutlined /> {job.views} views
                      </Text>
                      <Text type="secondary">
                        <PlusOutlined /> {job.applications} applications
                      </Text>
                    </Space>
                    <br />
                    <Text type="secondary">
                      Posted on {new Date(job.created_at).toLocaleDateString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingJob(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingJob ? handleUpdateJob : handleCreateJob}
        >
          <Form.Item
            name="perusahaan"
            label="Company Name"
            rules={[{ required: true, message: 'Please input company name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="posisi"
            label="Position"
            rules={[{ required: true, message: 'Please input position!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lokasi"
            label="Location"
            rules={[{ required: true, message: 'Please input location!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="deskripsi"
            label="Job Description"
            rules={[{ required: true, message: 'Please input job description!' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="kualifikasi"
            label="Qualifications"
            rules={[{ required: true, message: 'Please input qualifications!' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="batas_lamaran"
            label="Application Deadline"
            rules={[{ required: true, message: 'Please select application deadline!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingJob ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {premiumFeatures.length > 0 && (
        <Card title="Premium Features" style={{ marginTop: 24 }}>
          <List
            dataSource={premiumFeatures}
            renderItem={(feature) => (
              <List.Item>
                <List.Item.Meta
                  title={feature.name}
                  description={feature.description}
                />
                <Tag color={feature.is_active ? 'green' : 'red'}>
                  {feature.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default JobPostingManager; 