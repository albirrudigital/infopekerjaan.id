import React, { useState } from 'react';
import { Input, List, Card, Typography, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './Chatbot.module.css';

const { Text } = Typography;

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setLoading(true);
    try {
      const response = await fetch('/api/chatbot/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: input })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <Card className={styles.chatbotCard}>
      <div className={styles.chatHeader}>Analytics Chatbot</div>
      <div className={styles.chatBody}>
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item className={msg.sender === 'user' ? styles.userMsg : styles.botMsg}>
              <Text>{msg.text}</Text>
            </List.Item>
          )}
        />
      </div>
      <div className={styles.chatFooter}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={handleSend}
          disabled={loading}
          className={styles.inputBox}
          placeholder="Type a command..."
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          className={styles.sendBtn}
        />
      </div>
    </Card>
  );
};

export default Chatbot; 