# Roadmap Pengembangan Lanjutan Fitur Leaderboard InfoPekerjaan.id

## Pendahuluan

Dokumen ini menyajikan roadmap pengembangan lanjutan untuk sistem Leaderboard InfoPekerjaan.id setelah peluncuran utama. Tujuan utamanya adalah meningkatkan engagement pengguna, memberikan insight yang lebih baik bagi tim internal, dan memastikan keberlanjutan fitur melalui dokumentasi yang lengkap.

## Overview Prioritas Pengembangan

| Prioritas | Fitur | Dampak | Kompleksitas | Timeline Estimasi |
|-----------|-------|--------|--------------|-------------------|
| 1 | Sistem Notifikasi Real-Time | Tinggi | Sedang | 2-3 Sprint |
| 2 | Dashboard Admin Metrik | Sedang | Rendah-Sedang | 1-2 Sprint |
| 3 | Knowledge Base Internal | Sedang | Rendah | 1 Sprint |

## 1. Sistem Notifikasi Real-Time

### Deskripsi
Sistem yang memberi tahu pengguna secara langsung ketika terjadi perubahan pada status atau peringkat mereka di leaderboard. Hal ini akan secara signifikan meningkatkan keterlibatan pengguna dan mendorong interaksi berulang dengan platform.

### Fitur Utama

#### 1.1 Notifikasi In-App
- **Trigger Events**:
  - Pengguna naik/turun peringkat secara signifikan (misalnya 5+ posisi)
  - Pengguna masuk/keluar dari Top 10
  - Pengguna meraih achievement baru
  - Pengguna dilewati oleh teman/koneksi
  - Periode leaderboard baru dimulai
  - Pengumuman pemenang periode

- **Implementasi Teknis**:
  ```typescript
  // server/notification-service.ts
  
  export class NotificationService {
    async createLeaderboardNotification(
      userId: number,
      type: "rank_change" | "achievement" | "top_10" | "new_period" | "winner",
      metadata: {
        oldRank?: number;
        newRank?: number;
        achievementId?: number;
        leaderboardId: number;
        message: string;
      }
    ) {
      // Implementasi pembuatan notifikasi
    }
    
    async getUserNotifications(userId: number, filter?: {
      read?: boolean,
      type?: string,
      limit?: number
    }) {
      // Implementasi query notifikasi
    }
    
    async markNotificationAsRead(notificationId: number) {
      // Implementasi mark as read
    }
  }
  ```

- **UI Component**:
  ```tsx
  // client/src/components/notifications/leaderboard-notification.tsx
  
  export const LeaderboardNotification = ({ 
    type, 
    message, 
    metadata, 
    timestamp 
  }: NotificationProps) => {
    // Implementasi UI notifikasi dengan ikon yang sesuai tipe
    const getIcon = () => {
      switch(type) {
        case 'rank_change': return <TrendingUp />;
        case 'achievement': return <Award />;
        case 'top_10': return <Star />;
        // dll
      }
    };
    
    return (
      <div className="notification-item">
        <div className="notification-icon">{getIcon()}</div>
        <div className="notification-content">
          <p className="notification-message">{message}</p>
          <p className="notification-time">{formatRelativeTime(timestamp)}</p>
        </div>
      </div>
    );
  };
  ```

#### 1.2 WebSocket Implementation
- **Setup Backend**:
  ```typescript
  // server/routes.ts (tambahan)
  
  import { WebSocketServer } from 'ws';
  
  export function registerRoutes(app: Express): Server {
    // Setup existing routes
    
    const httpServer = createServer(app);
    
    // WebSocket Server untuk notifikasi real-time
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    wss.on('connection', (ws, req) => {
      // Extract user ID dari req (melalui cookie session)
      const userId = extractUserIdFromRequest(req);
      
      if (!userId) {
        ws.close();
        return;
      }
      
      // Map koneksi ke user ID
      connectionManager.registerConnection(userId, ws);
      
      ws.on('close', () => {
        connectionManager.removeConnection(userId, ws);
      });
    });
    
    return httpServer;
  }
  
  // Utility untuk mengirim notifikasi
  class ConnectionManager {
    private connections: Map<number, Set<WebSocket>> = new Map();
    
    registerConnection(userId: number, ws: WebSocket) {
      if (!this.connections.has(userId)) {
        this.connections.set(userId, new Set());
      }
      this.connections.get(userId)!.add(ws);
    }
    
    removeConnection(userId: number, ws: WebSocket) {
      const userConnections = this.connections.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          this.connections.delete(userId);
        }
      }
    }
    
    sendNotification(userId: number, data: any) {
      const userConnections = this.connections.get(userId);
      if (userConnections) {
        const message = JSON.stringify(data);
        userConnections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    }
    
    broadcastToAll(data: any) {
      const message = JSON.stringify(data);
      this.connections.forEach((connections, userId) => {
        connections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      });
    }
  }
  
  export const connectionManager = new ConnectionManager();
  ```

- **Frontend Integration**:
  ```typescript
  // client/src/hooks/use-real-time-notifications.ts
  
  export function useRealTimeNotifications() {
    const { user } = useAuth();
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    
    useEffect(() => {
      if (!user) return;
      
      // Setup WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setConnected(true);
        console.log('Connected to notification service');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'leaderboard_notification') {
            setNotifications(prev => [data.notification, ...prev]);
            // Trigger sound jika diaktifkan pengguna
            if (data.notification.importance === 'high') {
              playNotificationSound();
            }
          }
        } catch (e) {
          console.error('Failed to parse notification', e);
        }
      };
      
      socket.onclose = () => {
        setConnected(false);
        console.log('Disconnected from notification service');
      };
      
      return () => {
        socket.close();
      };
    }, [user]);
    
    // Method untuk mark as read
    const markAsRead = useCallback(async (notificationId: number) => {
      // Implementasi
    }, []);
    
    return { connected, notifications, markAsRead };
  }
  ```

#### 1.3 Email/WhatsApp Notifications (Opsional)
- Integrasi dengan SendGrid untuk email
- Setup throttling untuk mencegah spam
- Preferensi pengguna untuk frekuensi notifikasi

### Diagram Arsitektur

```
+----------------+    +----------------+    +---------------+
| Database Event |    | Scheduled Task |    | User Action   |
+-------+--------+    +-------+--------+    +-------+-------+
        |                     |                     |
        v                     v                     v
+-------+---------------------+---------------------+-------+
|                   Notification Service                    |
+-----------------------------+----------------------------+
                              |
           +------------------+------------------+
           |                                     |
           v                                     v
+----------+-----------+            +-----------+----------+
| WebSocket Connection |            | Email/WhatsApp Queue |
+----------------------+            +----------------------+
           |                                     |
           v                                     v
+----------+-----------+            +-----------+----------+
| In-App Notification  |            | External Notification|
+----------------------+            +----------------------+
```

### Metrik Keberhasilan
- Peningkatan Daily Active Users (DAU) pada fitur leaderboard
- Peningkatan interaksi dengan fitur leaderboard
- Peningkatan retention rate pengguna setelah menerima notifikasi

## 2. Dashboard Admin Metrik Leaderboard

### Deskripsi
Dashboard internal yang memungkinkan tim produk dan manajemen untuk memantau performa fitur Leaderboard, menganalisis tren engagement, dan membuat keputusan berbasis data untuk pengembangan lebih lanjut.

### Fitur Utama

#### 2.1 Overview Dashboard
- **Metrik Utama**:
  - Total pengguna aktif leaderboard
  - Persentase user yang mengakses leaderboard dari total user aktif
  - Waktu rata-rata yang dihabiskan di halaman leaderboard
  - Jumlah share per platform (WhatsApp, Twitter, dll)
  - Top achievement categories

- **Implementasi Frontend**:
  ```tsx
  // client/src/pages/admin/leaderboard-analytics.tsx
  
  export const LeaderboardAnalytics = () => {
    const { data: overviewData, isLoading } = useQuery({
      queryKey: ['/api/admin/analytics/leaderboard/overview'],
    });
    
    const { data: timeSeriesData } = useQuery({
      queryKey: ['/api/admin/analytics/leaderboard/timeseries'],
    });
    
    // ... implementasi komponen
    
    return (
      <div className="analytics-dashboard">
        <h1>Leaderboard Analytics Dashboard</h1>
        
        <div className="metrics-grid">
          <MetricCard 
            title="Total Active Users" 
            value={overviewData?.totalActiveUsers} 
            change={overviewData?.userChangePercentage}
            trend={overviewData?.userTrend}
          />
          {/* More metric cards */}
        </div>
        
        <div className="chart-container">
          <h2>Daily Active Users</h2>
          <LineChart data={timeSeriesData?.dailyActiveUsers} />
        </div>
        
        {/* More charts and visualizations */}
      </div>
    );
  };
  ```

#### 2.2 Heatmap Aktivitas
- Visualisasi jam tersibuk untuk akses leaderboard
- Filter berdasarkan hari dalam seminggu
- Segmentasi berdasarkan tipe pengguna

#### 2.3 API Endpoints untuk Analytics
```typescript
// server/routes/admin-analytics-routes.ts

export function registerAdminAnalyticsRoutes(app: Express) {
  // Pastikan hanya admin yang bisa mengakses
  app.get('/api/admin/analytics/leaderboard/overview', 
    isAdmin, 
    async (req, res) => {
      try {
        const startDate = req.query.startDate as string || getDefaultStartDate();
        const endDate = req.query.endDate as string || getDefaultEndDate();
        
        const data = await analyticsService.getLeaderboardOverview(startDate, endDate);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics data' });
      }
  });
  
  app.get('/api/admin/analytics/leaderboard/timeseries',
    isAdmin,
    async (req, res) => {
      // Implementasi endpoint
    }
  );
  
  app.get('/api/admin/analytics/leaderboard/heatmap',
    isAdmin,
    async (req, res) => {
      // Implementasi endpoint
    }
  );
  
  // Endpoints lainnya
}
```

#### 2.4 Export Data dan Reporting
- Export ke CSV/Excel
- Scheduled reports via email
- Custom date range filtering

### Diagram UI Dashboard

```
+--------------------------------------------------+
| Leaderboard Analytics                          ⟳ |
+--------------------------------------------------+
| Date Range: [Last 7 Days ▼]       Export ▼  Print|
+--------+--------+---------+--------+-------------+
| Active | Shares | Avg Time| Top    | Achievements|
| Users  |        | on Page | Users  | Completed   |
| 1,234  | 567    | 3m 45s  | 100    | 789         |
| +12%   | +8%    | +5%     | +0%    | +15%        |
+--------+--------+---------+--------+-------------+
|                                                  |
| [Line Chart: Daily Active Users Over Time]       |
|                                                  |
+--------------------------------------------------+
|                                                  |
| [Heatmap: Activity by Hour and Day]              |
|                                                  |
+--------------------------------------------------+
|                  |                               |
| [Leaderboard     | [Achievement                  |
|  Category        |  Distribution                 |
|  Distribution]   |  by User Type]                |
|                  |                               |
+------------------+-------------------------------+
```

### Metrik Keberhasilan
- Peningkatan frekuensi pengambilan keputusan berbasis data
- Penurunan waktu identifikasi masalah pada fitur leaderboard
- Peningkatan akurasi dalam perencanaan fitur

## 3. Knowledge Base Internal + Dokumentasi Produk

### Deskripsi
Membuat knowledge base internal yang komprehensif untuk mendokumentasikan semua aspek fitur Leaderboard, memfasilitasi onboarding anggota tim baru, dan menyimpan keputusan penting serta pembelajaran selama proses pengembangan.

### Fitur Utama

#### 3.1 Dokumentasi Teknis
- **Struktur Sistem**:
  - Arsitektur sistem
  - Data model dan relasi
  - API endpoints dan payload examples
  - Sequence diagrams untuk flow utama

- **Template Dokumen**:
  ```markdown
  # Leaderboard Technical Documentation
  
  ## Architecture Overview
  
  [Diagram arsitektur]
  
  The Leaderboard feature follows a layered architecture:
  - Frontend Layer: React components with TanStack Query for data fetching
  - API Layer: Express routes with validation
  - Service Layer: Business logic implementation
  - Data Layer: Drizzle ORM with PostgreSQL
  
  ## Data Model
  
  ### Main Tables
  
  #### leaderboards
  | Column | Type | Description |
  |--------|------|-------------|
  | id | serial | Primary key |
  | name | text | Leaderboard name |
  | ... | ... | ... |
  
  #### leaderboard_entries
  | Column | Type | Description |
  |--------|------|-------------|
  | leaderboard_id | integer | Foreign key to leaderboards |
  | user_id | integer | Foreign key to users |
  | ... | ... | ... |
  
  ## API Documentation
  
  ### GET /api/leaderboards
  
  Returns a list of available leaderboards.
  
  **Response**
  ```json
  {
    "leaderboards": [
      {
        "id": 1,
        "name": "Achievement Points",
        "description": "...",
        "period": "monthly"
      }
    ]
  }
  ```
  
  ### GET /api/leaderboards/:id/entries
  
  Returns entries for a specific leaderboard.
  
  **Parameters**
  - `id`: Leaderboard ID
  
  **Query Parameters**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `filter`: Filter criteria (optional)
  
  **Response**
  ```json
  {
    "entries": [
      {
        "rank": 1,
        "userId": 123,
        "username": "user1",
        "score": 1500,
        "change": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200
    }
  }
  ```
  
  ## Implementation Details
  
  ### Ranking Algorithm
  
  The ranking is calculated using the following algorithm:
  
  ```typescript
  // Pseudocode for ranking calculation
  function calculateRanks(entries) {
    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);
    
    // Assign ranks (handling ties)
    let currentRank = 1;
    let previousScore = null;
    
    entries.forEach((entry, index) => {
      if (previousScore !== null && entry.score < previousScore) {
        currentRank = index + 1;
      }
      
      entry.rank = currentRank;
      previousScore = entry.score;
    });
    
    return entries;
  }
  ```
  ```

#### 3.2 Panduan Operasional
- Troubleshooting guide
- Deployment checklist
- Common issues dan solusinya
- Monitoring procedures

#### 3.3 Dokumentasi Produk
- User journeys dan use cases
- Keputusan desain dan rationale
- Feedback collection dan learnings
- Roadmap pengembangan

#### 3.4 Onboarding Guide
- Quick start guide untuk developer baru
- Environmental setup
- Coding conventions
- Recommended resources

### Struktur Knowledge Base

```
/knowledge-base
├── /technical
│   ├── architecture.md
│   ├── data-model.md
│   ├── api-documentation.md
│   ├── frontend-components.md
│   └── /diagrams
│       ├── system-overview.png
│       ├── data-flow.png
│       └── ...
├── /operational
│   ├── deployment-guide.md
│   ├── monitoring.md
│   ├── troubleshooting.md
│   └── incident-response.md
├── /product
│   ├── feature-overview.md
│   ├── user-journeys.md
│   ├── design-decisions.md
│   └── roadmap.md
└── /onboarding
    ├── quick-start.md
    ├── development-environment.md
    ├── coding-standards.md
    └── useful-resources.md
```

### Metrik Keberhasilan
- Pengurangan waktu onboarding untuk anggota tim baru
- Penurunan frekuensi pertanyaan berulang tentang fitur
- Peningkatan kualitas kode dan konsistensi implementasi

## Timeline Implementasi

### Fase 1: Persiapan dan Planning (1 Sprint)
- Finalisasi requirement detail untuk ketiga enhancement
- Setup project structure dan database changes
- Prioritisasi task berdasarkan impact dan effort

### Fase 2: Sistem Notifikasi Real-Time (2-3 Sprint)
- Sprint 1: Database schema, backend services, WebSocket setup
- Sprint 2: Frontend integration, notification component, testing
- Sprint 3 (Optional): Email/WhatsApp integration

### Fase 3: Dashboard Admin Metrik (1-2 Sprint)
- Sprint 1: Backend endpoints, data aggregation, basic UI
- Sprint 2: Advanced visualizations, export functionality, testing

### Fase 4: Knowledge Base (1 Sprint)
- Dokumentasi arsitektur dan technical implementation
- Operational guides dan product documentation
- Finalisasi dan review

## Kesimpulan

Ketiga enhancement ini akan meningkatkan nilai fitur Leaderboard InfoPekerjaan.id secara signifikan, baik dari sisi pengguna (melalui notifikasi real-time) maupun dari sisi internal (melalui dashboard metrik dan knowledge base). Implementasi dapat dilakukan secara paralel atau berurutan tergantung pada resource yang tersedia dan prioritas bisnis.

Rekomendasi pendekatan:
1. Mulai dengan Knowledge Base untuk dokumentasi fitur yang sudah ada
2. Implementasikan Dashboard Admin Metrik untuk mulai mengumpulkan insight
3. Kembangkan Sistem Notifikasi Real-Time sebagai enhancement utama untuk pengguna

**Tanggal Dokumen**: April 2025  
**Tim**: Product Development InfoPekerjaan.id