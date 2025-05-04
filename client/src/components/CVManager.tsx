import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, List, Typography, Modal, Select, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Job } from '../types';
import styles from './CVManager.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CVProfile {
  id: number;
  title: string;
  summary?: string;
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
  is_default: boolean;
}

interface Document {
  id: number;
  type: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_public: boolean;
  created_at: string;
}

interface Application {
  id: number;
  job_id: number;
  cv_profile_id: number;
  cover_letter: string;
  status: string;
  created_at: string;
  job: Job;
  cv_profile: CVProfile;
  documents: {
    document: Document;
  }[];
}

const CVManager: React.FC = () => {
  const { user } = useAuth();
  const [cvProfiles, setCVProfiles] = useState<CVProfile[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CVProfile | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, docsRes, appsRes] = await Promise.all([
        fetch('/api/cv-profiles'),
        fetch('/api/documents'),
        fetch('/api/applications')
      ]);

      const [profilesData, docsData, appsData] = await Promise.all([
        profilesRes.json(),
        docsRes.json(),
        appsRes.json()
      ]);

      if (profilesData.success) setCVProfiles(profilesData.data);
      if (docsData.success) setDocuments(docsData.data);
      if (appsData.success) setApplications(appsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCV = async (values: any) => {
    try {
      const response = await fetch('/api/cv-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('CV profile created successfully');
        fetchData();
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error creating CV profile:', error);
      message.error('Failed to create CV profile');
    }
  };

  const handleUpdateCV = async (values: any) => {
    if (!editingProfile) return;

    try {
      const response = await fetch(`/api/cv-profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('CV profile updated successfully');
        fetchData();
        setIsModalVisible(false);
        setEditingProfile(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error updating CV profile:', error);
      message.error('Failed to update CV profile');
    }
  };

  const handleDeleteCV = async (id: number) => {
    try {
      const response = await fetch(`/api/cv-profiles/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        message.success('CV profile deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting CV profile:', error);
      message.error('Failed to delete CV profile');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch(`/api/cv-profiles/${id}/set-default`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        message.success('Default CV profile set successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error setting default CV profile:', error);
      message.error('Failed to set default CV profile');
    }
  };

  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cv');
    formData.append('isPublic', 'false');

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        message.success('Document uploaded successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      message.error('Failed to upload document');
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        message.success('Document deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Failed to delete document');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      message.error('Failed to download document');
    }
  };

  return (
    <div className={styles.cvContainer}>
      <Card className={styles.profileCard} title="CV Profiles" loading={loading}>
        <Button
          type="primary"
          onClick={() => {
            setEditingProfile(null);
            setIsModalVisible(true);
          }}
          className={styles.uploadBtn}
        >
          Create New CV Profile
        </Button>

        <List
          dataSource={cvProfiles}
          renderItem={(profile) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingProfile(profile);
                    form.setFieldsValue(profile);
                    setIsModalVisible(true);
                  }}
                />,
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteCV(profile.id)}
                />,
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleSetDefault(profile.id)}
                  disabled={profile.is_default}
                />
              ]}
            >
              <List.Item.Meta
                title={
                  <>
                    <Text strong>{profile.title}</Text>
                    {profile.is_default && (
                      <Tag color="green" style={{ marginLeft: 8 }}>Default</Tag>
                    )}
                  </>
                }
                description={
                  <>
                    <Text>{profile.summary}</Text>
                    <br />
                    <Text type="secondary">
                      {profile.experience.length} experiences • {profile.education.length} education • {profile.skills.length} skills
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card className={styles.profileCard} title="Documents" loading={loading} style={{ marginTop: 24 }}>
        <Upload
          customRequest={({ file }) => handleUpload(file)}
          showUploadList={false}
          beforeUpload={(file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error('File must be smaller than 5MB!');
            }
            return isLt5M;
          }}
        >
          <Button icon={<UploadOutlined />} className={styles.uploadBtn}>Upload Document</Button>
        </Upload>

        <List
          dataSource={documents}
          renderItem={(document) => (
            <List.Item
              actions={[
                <Button type="text" onClick={() => handleDownload(document)}>
                  Download
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteDocument(document.id)}
                />
              ]}
            >
              <List.Item.Meta
                title={document.file_name}
                description={
                  <>
                    <Text type="secondary">{document.file_type}</Text>
                    <br />
                    <Text type="secondary">
                      {(document.file_size / 1024).toFixed(2)} KB • {new Date(document.created_at).toLocaleDateString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card className={styles.profileCard} title="Job Applications" loading={loading} style={{ marginTop: 24 }}>
        <List
          dataSource={applications}
          renderItem={(application) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <>
                    <Text strong>{application.job.title}</Text>
                    <Tag color={getStatusColor(application.status)} style={{ marginLeft: 8 }}>
                      {application.status}
                    </Tag>
                  </>
                }
                description={
                  <>
                    <Text>{application.job.company}</Text>
                    <br />
                    <Text type="secondary">
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </Text>
                    <br />
                    <Text>Cover Letter: {application.cover_letter}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        className={styles.cvModal}
        title={editingProfile ? 'Edit CV Profile' : 'Create CV Profile'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProfile(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingProfile ? handleUpdateCV : handleCreateCV}
          className={styles.cvForm}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input CV title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="summary"
            label="Summary"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="experience"
            label="Experience"
            rules={[{ required: true, message: 'Please input experience!' }]}
          >
            <Form.List name="experience">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className={styles.marginBottom16}>
                      <Form.Item
                        {...field}
                        label={`Experience ${index + 1}`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Experience
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="education"
            label="Education"
            rules={[{ required: true, message: 'Please input education!' }]}
          >
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className={styles.marginBottom16}>
                      <Form.Item
                        {...field}
                        label={`Education ${index + 1}`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Education
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="skills"
            label="Skills"
            rules={[{ required: true, message: 'Please input skills!' }]}
          >
            <Select mode="tags" className={styles.fullWidth} placeholder="Add skills" />
          </Form.Item>

          <Form.Item
            name="languages"
            label="Languages"
          >
            <Form.List name="languages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className={styles.marginBottom16}>
                      <Form.Item
                        {...field}
                        label={`Language ${index + 1}`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Language
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="certifications"
            label="Certifications"
          >
            <Form.List name="certifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className={styles.marginBottom16}>
                      <Form.Item
                        {...field}
                        label={`Certification ${index + 1}`}
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Certification
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className={styles.submitBtn}>
              {editingProfile ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'reviewed':
      return 'blue';
    case 'shortlisted':
      return 'green';
    case 'rejected':
      return 'red';
    case 'hired':
      return 'purple';
    default:
      return 'default';
  }
};

export default CVManager; 