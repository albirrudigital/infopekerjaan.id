import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Progress, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { Job } from '../types';
import styles from './JobRecommendations.module.css';

const { Title, Text } = Typography;

interface Recommendation {
  jobId: number;
  score: number;
  matchDetails: {
    skills: number;
    location: number;
    salary: number;
  };
}

const JobRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations');
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
        // Fetch job details for each recommendation
        const jobIds = data.data.map((r: Recommendation) => r.jobId);
        const jobsResponse = await fetch(`/api/jobs?ids=${jobIds.join(',')}`);
        const jobsData = await jobsResponse.json();
        
        if (jobsData.success) {
          const jobsMap = jobsData.data.reduce((acc: Record<number, Job>, job: Job) => {
            acc[job.id] = job;
            return acc;
          }, {});
          setJobs(jobsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      message.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return '#52c41a';
    if (score >= 0.6) return '#1890ff';
    if (score >= 0.4) return '#faad14';
    return '#f5222d';
  };

  return (
    <Card title="Job Recommendations" loading={loading}>
      <List
        dataSource={recommendations}
        renderItem={(recommendation) => {
          const job = jobs[recommendation.jobId];
          if (!job) return null;

          const jobUrl = `https://yourdomain.com/jobs/${job.id}`;

          return (
            <List.Item
              actions={[
                <Button type="primary" href={`/jobs/${job.id}`}>
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<Title level={4}>{job.title}</Title>}
                description={
                  <>
                    <Text>{job.company}</Text>
                    <br />
                    <Text type="secondary">{job.location}</Text>
                    <br />
                    <Tag color={job.remote ? 'green' : 'blue'}>
                      {job.remote ? 'Remote' : 'On-site'}
                    </Tag>
                    <Tag color="purple">{job.type}</Tag>
                  </>
                }
              />
              <div className={styles.recommendationBox}>
                <div className={styles.marginBottom8}>
                  <Text>Overall Match: {Math.round(recommendation.score * 100)}%</Text>
                  <Progress
                    percent={Math.round(recommendation.score * 100)}
                    strokeColor={getMatchColor(recommendation.score)}
                  />
                </div>
                <div className={styles.marginBottom8}>
                  <Text>Skills Match: {Math.round(recommendation.matchDetails.skills * 100)}%</Text>
                  <Progress
                    percent={Math.round(recommendation.matchDetails.skills * 100)}
                    strokeColor={getMatchColor(recommendation.matchDetails.skills)}
                  />
                </div>
                <div className={styles.marginBottom8}>
                  <Text>Location Match: {Math.round(recommendation.matchDetails.location * 100)}%</Text>
                  <Progress
                    percent={Math.round(recommendation.matchDetails.location * 100)}
                    strokeColor={getMatchColor(recommendation.matchDetails.location)}
                  />
                </div>
                <div>
                  <Text>Salary Match: {Math.round(recommendation.matchDetails.salary * 100)}%</Text>
                  <Progress
                    percent={Math.round(recommendation.matchDetails.salary * 100)}
                    strokeColor={getMatchColor(recommendation.matchDetails.salary)}
                  />
                </div>
              </div>
              <Button href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(jobUrl)}`}>Share to LinkedIn</Button>
              <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`}>Share to Facebook</Button>
              <Button href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}`}>Share to Twitter</Button>
            </List.Item>
          );
        }}
      />
      <Button href="/api/auth/google">Login with Google</Button>
      <Button href="/api/auth/facebook">Login with Facebook</Button>
      <Button href="/api/auth/linkedin">Login with LinkedIn</Button>
      <Button href="/api/report/users" target="_blank">Export Users (CSV)</Button>
      <Button href="/api/report/jobs" target="_blank">Export Jobs (CSV)</Button>
    </Card>
  );
};

export default JobRecommendations; 