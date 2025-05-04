# Panduan Kickoff: Sistem Rekomendasi Pekerjaan InfoPekerjaan.id

## 🚀 Quick Start Guide

Dokumen ini menyediakan langkah-langkah praktis untuk memulai pengembangan Sistem Rekomendasi Pekerjaan berbasis aktivitas. Panduan ini melengkapi blueprint teknis lengkap yang sudah tersedia di `job_recommendation_system_blueprint.md`.

## 🏁 Persiapan Project

### 1. Setup Project Board

```
Project Name: Recommendation System
Key: RECJOB
```

**Epic:** Sistem Rekomendasi Pekerjaan Berbasis Aktivitas

**Project Board Columns:**
- Backlog
- Sprint Planning
- In Progress
- Code Review
- QA
- Done

### 2. Team Structure & Responsibilities

| Role | Responsibilities | Skills Required |
|------|-----------------|----------------|
| Tech Lead | Arsitektur sistem, code reviews, performance optimization | System design, algorithm development |
| Backend Developer | API endpoints, database schema, rekomendasi engine | Node.js, PostgreSQL, algorithm implementation |
| Frontend Developer | UI components, user interactions tracking | React, TanStack Query, responsive design |
| QA Engineer | Test plan, scenarios testing, performance validation | API testing, usability testing |
| Product Manager | Requirements, stakeholder communication, prioritization | Data analysis, product metrics |
| Data Analyst | Analytics implementation, dashboard setup | SQL, data visualization |

## 📋 Prioritized Tasks untuk Sprint 1

### Schema & Database (Backend)

1. **Setup Schema Interaksi Pengguna**
   - Implementasi tabel `user_job_interactions`
   - Indeks dan constraint optimasi
   - Migrasi database
   
   ```sql
   -- Contoh migration script
   CREATE TABLE user_job_interactions (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL REFERENCES users(id),
     job_id INTEGER NOT NULL REFERENCES jobs(id),
     interaction_type VARCHAR(50) NOT NULL, -- view, click, save, apply, reject
     timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
     duration_seconds INTEGER, -- untuk view/baca
     source VARCHAR(50), -- search, browse, recommendation, email
     device_type VARCHAR(50), -- mobile, desktop, tablet
     session_id VARCHAR(100),
     context_data JSONB -- data tambahan sesuai interaction_type
   );

   CREATE INDEX idx_user_job_interactions_user_id ON user_job_interactions(user_id);
   CREATE INDEX idx_user_job_interactions_job_id ON user_job_interactions(job_id);
   CREATE INDEX idx_user_job_interactions_type ON user_job_interactions(interaction_type);
   ```

2. **InteractionService Implementation**
   - Metode CRUD untuk interaksi
   - Batch processing untuk kinerja

   ```typescript
   // server/interaction-service.ts
   
   export class InteractionService {
     async logInteraction(interaction: Omit<InsertUserJobInteraction, 'id'>) {
       // Implementation
     }
     
     async getUserInteractions(userId: number, options?: {
       limit?: number;
       offset?: number;
       interactionTypes?: InteractionType[];
       startDate?: Date;
       endDate?: Date;
     }) {
       // Implementation
     }
     
     async getJobInteractions(jobId: number, options?: {
       // Similar to above
     }) {
       // Implementation
     }
   }
   ```

### API Endpoints (Backend)

3. **Implementasi Endpoints Interaksi**
   - POST endpoint untuk mencatat interaksi
   - GET endpoint untuk melihat interaksi sebelumnya

   ```typescript
   // server/routes/interaction-routes.ts
   
   export function registerInteractionRoutes(app: Express) {
     app.post('/api/jobs/:jobId/interactions', isAuthenticated, async (req, res) => {
       try {
         const jobId = parseInt(req.params.jobId);
         const userId = req.user!.id;
         
         const interaction = {
           userId,
           jobId,
           interactionType: req.body.interactionType,
           durationSeconds: req.body.durationSeconds,
           source: req.body.source,
           deviceType: req.body.deviceType,
           sessionId: req.body.sessionId || req.sessionID,
           contextData: req.body.contextData
         };
         
         const result = await interactionService.logInteraction(interaction);
         res.status(201).json({
           success: true,
           interactionId: result.id
         });
       } catch (error) {
         console.error('Failed to log interaction:', error);
         res.status(500).json({ error: 'Failed to log interaction' });
       }
     });
     
     // GET endpoint implementation
   }
   ```

### Frontend Integration (Frontend)

4. **Hooks untuk Tracking Interaksi**
   - useJobInteractions hook
   - Integrasi ke komponen yang sudah ada

   ```typescript
   // client/src/hooks/use-job-interactions.ts
   
   export function useJobInteractions() {
     const queryClient = useQueryClient();
     
     const trackInteractionMutation = useMutation({
       mutationFn: async ({
         jobId,
         interactionType,
         durationSeconds,
         contextData
       }: TrackInteractionParams) => {
         const deviceType = getDeviceType();
         const source = getCurrentPageSource();
         
         return await apiRequest('POST', `/api/jobs/${jobId}/interactions`, {
           interactionType,
           durationSeconds,
           source,
           deviceType,
           contextData
         });
       }
     });
     
     const trackInteraction = useCallback((
       jobId: number,
       interactionType: InteractionType,
       durationSeconds?: number,
       contextData?: Record<string, any>
     ) => {
       trackInteractionMutation.mutate({
         jobId,
         interactionType,
         durationSeconds,
         contextData
       });
     }, [trackInteractionMutation]);
     
     // Additional methods like trackView, trackApply, etc.
     
     return {
       trackInteraction,
       trackView,
       trackClick,
       trackSave,
       trackApply,
       trackReject,
       isTracking: trackInteractionMutation.isPending
     };
   }
   ```

5. **Integrasi ke Existing Job Cards**
   - Menambahkan tracking ke komponen JobCard yang sudah ada
   - Utility untuk track view duration

   ```typescript
   // client/src/components/jobs/job-card.tsx
   
   export const JobCard = ({ job }: JobCardProps) => {
     const { trackInteraction, trackView } = useJobInteractions();
     const viewStartTimeRef = useRef<number>(Date.now());
     
     // Track view when component mounts
     useEffect(() => {
       trackView(job.id);
       
       return () => {
         // Track view duration when component unmounts
         const durationSeconds = Math.round((Date.now() - viewStartTimeRef.current) / 1000);
         if (durationSeconds >= 2) { // Only log if viewed for at least 2 seconds
           trackInteraction(job.id, 'view', durationSeconds);
         }
       };
     }, [job.id, trackInteraction, trackView]);
     
     const handleClick = () => {
       trackInteraction(job.id, 'click');
     };
     
     const handleSave = () => {
       trackInteraction(job.id, 'save');
     };
     
     const handleApply = () => {
       trackInteraction(job.id, 'apply');
     };
     
     // Rest of component implementation
   }
   ```

### Monitoring & Analytics (Data)

6. **Setup Analytics Dashboard MVP**
   - Dashboard dasar untuk memantau interaksi
   - Setup metrik dasar (top interacted jobs, top interactions per user)

   ```typescript
   // server/routes/admin-analytics-routes.ts
   
   app.get('/api/admin/analytics/interactions/overview', 
     isAdmin, 
     async (req, res) => {
       try {
         const startDate = req.query.startDate as string || getDefaultStartDate();
         const endDate = req.query.endDate as string || getDefaultEndDate();
         
         const [
           totalInteractions,
           interactionsByType,
           topInteractedJobs,
           topUsersByInteractions
         ] = await Promise.all([
           analyticsService.getTotalInteractions(startDate, endDate),
           analyticsService.getInteractionsByType(startDate, endDate),
           analyticsService.getTopInteractedJobs(startDate, endDate, 10),
           analyticsService.getTopUsersByInteractions(startDate, endDate, 10)
         ]);
         
         res.json({
           totalInteractions,
           interactionsByType,
           topInteractedJobs,
           topUsersByInteractions
         });
       } catch (error) {
         console.error('Failed to fetch analytics:', error);
         res.status(500).json({ error: 'Failed to fetch analytics data' });
       }
   });
   ```

## 🧪 Test Plan untuk Sprint 1

### Unit Tests

- InteractionService methods
- API endpoints validation
- Hook functionality

### Integration Tests

- End-to-end interaction tracking flow
- Database consistency checks

### Manual Test Scenarios

1. **Basic Interaction Tracking**
   - Browse job listings, click on job
   - Verify interaction is recorded with correct type and metadata

2. **Interaction Duration Tracking**
   - View job detail page for 30 seconds
   - Navigate away
   - Verify duration is recorded correctly

3. **Various Device Testing**
   - Test on desktop, tablet, mobile
   - Verify device_type is recorded correctly

4. **Source Attribution Testing**
   - Access jobs from different sources (search, browse, email)
   - Verify source is recorded correctly

## 📋 Definition of Done untuk Sprint 1

1. ✅ Schema database diimplementasikan dan dimigrasi
2. ✅ API endpoints interaksi berfungsi dan teruji
3. ✅ Frontend hooks terintegrasi ke minimal 2 komponen existing
4. ✅ Dashboard analytics dasar tersedia untuk admin
5. ✅ Dokumentasi API terbarui
6. ✅ Unit tests dan integration tests pass
7. ✅ Code review completed
8. ✅ Performance benchmark established

## 🗓️ Meeting & Checkpoint Schedule

| Meeting | Frequency | Participants | Agenda |
|---------|-----------|--------------|--------|
| Sprint Planning | Start of Sprint | All team | Task assignment, scope definition |
| Daily Standup | Daily | All team | Progress updates, blockers |
| Technical Sync | Bi-weekly | Tech team | Architecture discussions, technical decisions |
| Sprint Review | End of Sprint | All team + Stakeholders | Demo, feedback collection |
| Sprint Retrospective | End of Sprint | All team | Process improvements |

## 📚 Dokumentasi & Resources

### Setup & Onboarding
- [Main Technical Blueprint](job_recommendation_system_blueprint.md)
- [Development Environment Setup](link-to-setup-doc) - *To be created*
- [Database Schema Documentation](link-to-schema-doc) - *To be created*

### Contributing Guidelines
- Branching strategy: `feature/rec-{issue-number}-{short-description}`
- PR template includes checklist for tests, performance considerations
- Required reviewers: 1 peer + Tech Lead

### Resources & References
- [Similar systems research](link-to-research-doc) - *To be created*
- [Algorithm references](link-to-algorithm-doc) - *To be created*

## 🚀 Next Steps After Sprint 1

Once Sprint 1 is completed successfully, we'll have the foundation for tracking user interactions. Next steps will focus on:

1. Initial simple recommendation algorithm based on collected data
2. Basic UI components to display recommendations
3. A/B testing setup for algorithm variants

---

**Tanggal Dokumen**: April 2025  
**Tim**: Product Development InfoPekerjaan.id  
**Status**: Ready for Sprint 1 Kickoff