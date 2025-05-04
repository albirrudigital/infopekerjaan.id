# Tambahan Pra-Kickoff: Sistem Rekomendasi Pekerjaan

## 1️⃣ Skema Fallback Rekomendasi untuk Cold Start Users

### Latar Belakang
Cold start problem merupakan tantangan umum pada sistem rekomendasi ketika pengguna baru belum memiliki data interaksi yang cukup untuk memberikan rekomendasi personal yang relevan. Strategi fallback diperlukan untuk memastikan pengguna tetap mendapatkan rekomendasi yang bernilai meskipun data interaksi mereka terbatas.

### Strategi Fallback

#### 1. Rekomendasi Berbasis Popularitas
```typescript
// Pseudocode implementasi
async function getPopularJobRecommendations(limit: number = 10): Promise<Job[]> {
  // Query jobs dengan jumlah view/apply terbanyak dalam 7 hari terakhir
  const popularJobs = await db.query(`
    SELECT j.*, 
           COUNT(DISTINCT i.user_id) as unique_views
    FROM jobs j
    JOIN user_job_interactions i ON j.id = i.job_id
    WHERE i.interaction_type IN ('view', 'apply')
      AND i.timestamp > NOW() - INTERVAL '7 days'
      AND j.is_active = true
      AND j.expires_at > NOW()
    GROUP BY j.id
    ORDER BY unique_views DESC
    LIMIT $1
  `, [limit]);
  
  return popularJobs;
}
```

#### 2. Rekomendasi Berbasis Lokasi
```typescript
// Pseudocode implementasi
async function getLocationBasedRecommendations(
  userId: number, 
  limit: number = 10
): Promise<Job[]> {
  // Dapatkan lokasi pengguna dari profil atau IP
  const userLocation = await getUserLocation(userId);
  
  // Query jobs berdasarkan lokasi yang sama atau dekat
  const nearbyJobs = await db.query(`
    SELECT j.*, 
           calculate_distance(j.location_lat, j.location_lng, $1, $2) as distance
    FROM jobs j
    WHERE j.is_active = true
      AND j.expires_at > NOW()
      AND calculate_distance(j.location_lat, j.location_lng, $1, $2) < 50 -- 50km radius
    ORDER BY distance ASC, j.created_at DESC
    LIMIT $3
  `, [userLocation.lat, userLocation.lng, limit]);
  
  return nearbyJobs;
}
```

#### 3. Rekomendasi Berbasis Profil Dasar
```typescript
// Pseudocode implementasi
async function getProfileBasedRecommendations(
  userId: number, 
  limit: number = 10
): Promise<Job[]> {
  // Dapatkan data profil user (skill, industri, level)
  const userProfile = await getUserProfile(userId);
  
  // Query jobs berdasarkan kecocokan profil dasar
  const matchingJobs = await db.query(`
    SELECT j.*,
           similarity_score(j.required_skills, $1) as skill_match
    FROM jobs j
    WHERE j.is_active = true
      AND j.expires_at > NOW()
      AND (
        j.industry = ANY($2)
        OR j.experience_level = $3
        OR similarity_score(j.required_skills, $1) > 0.3
      )
    ORDER BY 
      CASE WHEN j.industry = ANY($2) THEN 3 ELSE 0 END +
      CASE WHEN j.experience_level = $3 THEN 2 ELSE 0 END +
      (similarity_score(j.required_skills, $1) * 5) DESC,
      j.created_at DESC
    LIMIT $4
  `, [userProfile.skills, userProfile.preferredIndustries, userProfile.experienceLevel, limit]);
  
  return matchingJobs;
}
```

#### 4. Rekomendasi Berbasis Demografis
```typescript
// Pseudocode implementasi
async function getDemographicRecommendations(
  userId: number, 
  limit: number = 10
): Promise<Job[]> {
  // Dapatkan segmen demografis pengguna
  const userDemographic = await getUserDemographic(userId);
  
  // Query jobs yang populer di segmen demografis yang sama
  const demographicJobs = await db.query(`
    SELECT j.*,
           COUNT(DISTINCT i.user_id) as segment_popularity
    FROM jobs j
    JOIN user_job_interactions i ON j.id = i.job_id
    JOIN users u ON i.user_id = u.id
    WHERE i.interaction_type IN ('view', 'apply')
      AND i.timestamp > NOW() - INTERVAL '30 days'
      AND j.is_active = true
      AND j.expires_at > NOW()
      AND u.age_group = $1
      AND u.education_level = $2
      AND (u.gender = $3 OR $3 IS NULL)
    GROUP BY j.id
    ORDER BY segment_popularity DESC, j.created_at DESC
    LIMIT $4
  `, [userDemographic.ageGroup, userDemographic.educationLevel, 
      userDemographic.gender, limit]);
  
  return demographicJobs;
}
```

### Implementasi Fallback Chain

```typescript
// Pseudocode implementasi
async function getRecommendations(userId: number, limit: number = 10): Promise<Job[]> {
  // 1. Coba dapatkan rekomendasi personal berbasis interaksi
  let recommendations = await getPersonalizedRecommendations(userId, limit);
  
  // 2. Jika tidak cukup, tambahkan rekomendasi berbasis profil
  if (recommendations.length < limit) {
    const remainingSlots = limit - recommendations.length;
    const profileRecs = await getProfileBasedRecommendations(userId, remainingSlots);
    recommendations = [...recommendations, ...profileRecs];
  }
  
  // 3. Jika masih tidak cukup, tambahkan rekomendasi berbasis lokasi
  if (recommendations.length < limit) {
    const remainingSlots = limit - recommendations.length;
    const locationRecs = await getLocationBasedRecommendations(userId, remainingSlots);
    // Filter untuk menghindari duplikasi
    const newLocationRecs = locationRecs.filter(job => 
      !recommendations.some(rec => rec.id === job.id)
    );
    recommendations = [...recommendations, ...newLocationRecs];
  }
  
  // 4. Fallback terakhir: rekomendasi populer
  if (recommendations.length < limit) {
    const remainingSlots = limit - recommendations.length;
    const popularRecs = await getPopularJobRecommendations(remainingSlots);
    // Filter untuk menghindari duplikasi
    const newPopularRecs = popularRecs.filter(job => 
      !recommendations.some(rec => rec.id === job.id)
    );
    recommendations = [...recommendations, ...newPopularRecs];
  }
  
  return recommendations;
}
```

### Monitoring & Improvement
- Track sumber rekomendasi (personalized vs. fallback)
- Analisis performa masing-masing strategi fallback (CTR, conversion)
- Iteratif meningkatkan kualitas fallback berdasarkan data

## 2️⃣ Contoh Data Dummy untuk Testing Lokal

**Format ini harus digunakan untuk testing lokal oleh developer untuk validasi algoritma rekomendasi, bukan untuk produksi.**

### 1. Contoh Data Users

```json
[
  {
    "id": 1001,
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "profile": {
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": 5,
      "education": "S1 Teknik Informatika",
      "preferredLocations": ["Jakarta", "Remote"],
      "preferredIndustries": ["Technology", "E-commerce"],
      "preferredSalary": { "min": 15000000, "max": 25000000 }
    }
  },
  {
    "id": 1002,
    "username": "janesmith",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "profile": {
      "skills": ["Product Management", "UI/UX", "Agile"],
      "experience": 7,
      "education": "S2 Business",
      "preferredLocations": ["Bandung", "Jakarta"],
      "preferredIndustries": ["Technology", "Consulting"],
      "preferredSalary": { "min": 20000000, "max": 35000000 }
    }
  },
  {
    "id": 1003,
    "username": "bobmartin",
    "fullName": "Bob Martin",
    "email": "bob.martin@example.com",
    "profile": {
      "skills": ["Java", "Spring", "Microservices"],
      "experience": 10,
      "education": "S1 Computer Science",
      "preferredLocations": ["Jakarta", "Surabaya"],
      "preferredIndustries": ["Banking", "Technology"],
      "preferredSalary": { "min": 25000000, "max": 40000000 }
    }
  },
  {
    "id": 1004,
    "username": "alicewong",
    "fullName": "Alice Wong",
    "email": "alice.wong@example.com",
    "profile": {
      "skills": ["Data Analysis", "Python", "SQL"],
      "experience": 3,
      "education": "S1 Statistics",
      "preferredLocations": ["Jakarta", "Remote"],
      "preferredIndustries": ["E-commerce", "Finance"],
      "preferredSalary": { "min": 12000000, "max": 20000000 }
    }
  },
  {
    "id": 1005,
    "username": "davidlee",
    "fullName": "David Lee",
    "email": "david.lee@example.com",
    "profile": {
      "skills": ["Marketing", "Social Media", "Content Creation"],
      "experience": 4,
      "education": "S1 Marketing",
      "preferredLocations": ["Jakarta", "Yogyakarta"],
      "preferredIndustries": ["Media", "FMCG"],
      "preferredSalary": { "min": 10000000, "max": 18000000 }
    }
  },
  {
    "id": 1006,
    "username": "sarahjohnson",
    "fullName": "Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "profile": {
      "skills": ["HR Management", "Recruitment", "People Operations"],
      "experience": 6,
      "education": "S1 Psychology",
      "preferredLocations": ["Jakarta", "Tangerang"],
      "preferredIndustries": ["Healthcare", "Education"],
      "preferredSalary": { "min": 15000000, "max": 25000000 }
    }
  },
  {
    "id": 1007,
    "username": "michaeltan",
    "fullName": "Michael Tan",
    "email": "michael.tan@example.com",
    "profile": {
      "skills": ["Sales", "Account Management", "Negotiation"],
      "experience": 8,
      "education": "S1 Business Administration",
      "preferredLocations": ["Jakarta", "Surabaya"],
      "preferredIndustries": ["Real Estate", "Insurance"],
      "preferredSalary": { "min": 18000000, "max": 30000000 }
    }
  },
  {
    "id": 1008,
    "username": "lisaputri",
    "fullName": "Lisa Putri",
    "email": "lisa.putri@example.com",
    "profile": {
      "skills": ["Graphic Design", "Adobe Creative Suite", "UI Design"],
      "experience": 2,
      "education": "S1 Design",
      "preferredLocations": ["Bandung", "Remote"],
      "preferredIndustries": ["Creative Agency", "Technology"],
      "preferredSalary": { "min": 8000000, "max": 15000000 }
    }
  },
  {
    "id": 1009,
    "username": "kevinwilson",
    "fullName": "Kevin Wilson",
    "email": "kevin.wilson@example.com",
    "profile": {
      "skills": ["Financial Analysis", "Investment", "Modeling"],
      "experience": 9,
      "education": "S2 Finance",
      "preferredLocations": ["Jakarta"],
      "preferredIndustries": ["Banking", "Investment"],
      "preferredSalary": { "min": 30000000, "max": 50000000 }
    }
  },
  {
    "id": 1010,
    "username": "ameliachen",
    "fullName": "Amelia Chen",
    "email": "amelia.chen@example.com",
    "profile": {
      "skills": ["Customer Service", "Communication", "Problem Solving"],
      "experience": 1,
      "education": "D3 Business Administration",
      "preferredLocations": ["Jakarta", "Bekasi"],
      "preferredIndustries": ["Retail", "Hospitality"],
      "preferredSalary": { "min": 5000000, "max": 8000000 }
    }
  }
]
```

### 2. Contoh Data Jobs

```json
[
  {
    "id": 2001,
    "title": "Senior Frontend Developer",
    "company": "Tech Solutions Indonesia",
    "location": "Jakarta",
    "description": "Developing modern web applications using React and related technologies",
    "requirements": {
      "requiredSkills": ["JavaScript", "React", "CSS", "HTML"],
      "preferredSkills": ["TypeScript", "Redux", "NextJS"],
      "experienceYears": 3,
      "education": "S1 Teknik Informatika"
    },
    "salary": { "min": 18000000, "max": 28000000 },
    "industry": "Technology",
    "jobType": "Full-time",
    "isFeatured": true,
    "postedDate": "2025-04-10T00:00:00Z"
  },
  {
    "id": 2002,
    "title": "Product Manager",
    "company": "E-Commerce Giant",
    "location": "Jakarta",
    "description": "Leading product development initiatives for our marketplace platform",
    "requirements": {
      "requiredSkills": ["Product Management", "Agile", "User Research"],
      "preferredSkills": ["UI/UX", "Data Analysis", "Technical Background"],
      "experienceYears": 5,
      "education": "S1 any field"
    },
    "salary": { "min": 25000000, "max": 35000000 },
    "industry": "E-commerce",
    "jobType": "Full-time",
    "isFeatured": true,
    "postedDate": "2025-04-15T00:00:00Z"
  },
  {
    "id": 2003,
    "title": "Java Backend Developer",
    "company": "FinTech Innovations",
    "location": "Jakarta",
    "description": "Developing robust backend systems using Java and Spring",
    "requirements": {
      "requiredSkills": ["Java", "Spring", "SQL"],
      "preferredSkills": ["Microservices", "Docker", "Kubernetes"],
      "experienceYears": 4,
      "education": "S1 Computer Science"
    },
    "salary": { "min": 20000000, "max": 30000000 },
    "industry": "Banking",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-08T00:00:00Z"
  },
  {
    "id": 2004,
    "title": "Data Analyst",
    "company": "Big Data Corp",
    "location": "Jakarta",
    "description": "Analyzing complex datasets to provide business insights",
    "requirements": {
      "requiredSkills": ["SQL", "Excel", "Data Visualization"],
      "preferredSkills": ["Python", "R", "Tableau"],
      "experienceYears": 2,
      "education": "S1 Statistics or related"
    },
    "salary": { "min": 15000000, "max": 22000000 },
    "industry": "E-commerce",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-18T00:00:00Z"
  },
  {
    "id": 2005,
    "title": "Digital Marketing Specialist",
    "company": "Brand Promoters",
    "location": "Jakarta",
    "description": "Planning and executing digital marketing campaigns",
    "requirements": {
      "requiredSkills": ["Social Media Marketing", "Content Creation", "SEO"],
      "preferredSkills": ["Google Analytics", "Facebook Ads", "Email Marketing"],
      "experienceYears": 3,
      "education": "S1 Marketing"
    },
    "salary": { "min": 12000000, "max": 18000000 },
    "industry": "Media",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-12T00:00:00Z"
  },
  {
    "id": 2006,
    "title": "HR Manager",
    "company": "Healthcare Indonesia",
    "location": "Jakarta",
    "description": "Managing recruitment and HR operations",
    "requirements": {
      "requiredSkills": ["Recruitment", "HR Management", "Employee Relations"],
      "preferredSkills": ["HRIS", "People Analytics", "Compensation & Benefits"],
      "experienceYears": 5,
      "education": "S1 HR Management or related"
    },
    "salary": { "min": 20000000, "max": 30000000 },
    "industry": "Healthcare",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-05T00:00:00Z"
  },
  {
    "id": 2007,
    "title": "Sales Executive",
    "company": "Property Developers",
    "location": "Jakarta",
    "description": "Selling premium real estate properties to clients",
    "requirements": {
      "requiredSkills": ["Sales", "Negotiation", "Client Management"],
      "preferredSkills": ["Real Estate Knowledge", "CRM Systems", "Market Analysis"],
      "experienceYears": 2,
      "education": "S1 any field"
    },
    "salary": { "min": 7000000, "max": 15000000 },
    "industry": "Real Estate",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-20T00:00:00Z"
  },
  {
    "id": 2008,
    "title": "UI/UX Designer",
    "company": "Creative Digital",
    "location": "Bandung",
    "description": "Creating stunning user interfaces and experiences",
    "requirements": {
      "requiredSkills": ["UI Design", "Figma", "User Research"],
      "preferredSkills": ["Adobe Creative Suite", "Prototyping", "Design Systems"],
      "experienceYears": 2,
      "education": "S1 Design or related"
    },
    "salary": { "min": 10000000, "max": 18000000 },
    "industry": "Creative Agency",
    "jobType": "Full-time",
    "isFeatured": true,
    "postedDate": "2025-04-16T00:00:00Z"
  },
  {
    "id": 2009,
    "title": "Financial Analyst",
    "company": "Investment Bank",
    "location": "Jakarta",
    "description": "Analyzing financial data and preparing reports",
    "requirements": {
      "requiredSkills": ["Financial Analysis", "Excel", "Modeling"],
      "preferredSkills": ["Bloomberg Terminal", "VBA", "CFA"],
      "experienceYears": 4,
      "education": "S1 Finance or Accounting"
    },
    "salary": { "min": 25000000, "max": 40000000 },
    "industry": "Banking",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-07T00:00:00Z"
  },
  {
    "id": 2010,
    "title": "Customer Service Representative",
    "company": "Luxury Retail",
    "location": "Jakarta",
    "description": "Providing excellent customer service to high-end clients",
    "requirements": {
      "requiredSkills": ["Customer Service", "Communication", "Problem Solving"],
      "preferredSkills": ["Retail Experience", "CRM Systems", "English Fluency"],
      "experienceYears": 1,
      "education": "D3 any field"
    },
    "salary": { "min": 5000000, "max": 8000000 },
    "industry": "Retail",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-22T00:00:00Z"
  },
  {
    "id": 2011,
    "title": "Full Stack Developer",
    "company": "Startup Hub",
    "location": "Jakarta",
    "description": "Building end-to-end web applications for various clients",
    "requirements": {
      "requiredSkills": ["JavaScript", "Node.js", "React", "MongoDB"],
      "preferredSkills": ["TypeScript", "AWS", "GraphQL"],
      "experienceYears": 3,
      "education": "S1 Computer Science or related"
    },
    "salary": { "min": 15000000, "max": 25000000 },
    "industry": "Technology",
    "jobType": "Full-time",
    "isFeatured": true,
    "postedDate": "2025-04-14T00:00:00Z"
  },
  {
    "id": 2012,
    "title": "Content Writer",
    "company": "Media Group",
    "location": "Remote",
    "description": "Creating engaging content for digital platforms",
    "requirements": {
      "requiredSkills": ["Content Writing", "Copywriting", "SEO"],
      "preferredSkills": ["WordPress", "Social Media", "Content Strategy"],
      "experienceYears": 2,
      "education": "S1 Communications or related"
    },
    "salary": { "min": 8000000, "max": 12000000 },
    "industry": "Media",
    "jobType": "Remote",
    "isFeatured": false,
    "postedDate": "2025-04-19T00:00:00Z"
  },
  {
    "id": 2013,
    "title": "DevOps Engineer",
    "company": "Cloud Solutions",
    "location": "Jakarta",
    "description": "Managing and automating infrastructure and deployment",
    "requirements": {
      "requiredSkills": ["Linux", "Docker", "Kubernetes", "CI/CD"],
      "preferredSkills": ["AWS", "Terraform", "Python"],
      "experienceYears": 4,
      "education": "S1 Computer Science or related"
    },
    "salary": { "min": 22000000, "max": 35000000 },
    "industry": "Technology",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-09T00:00:00Z"
  },
  {
    "id": 2014,
    "title": "Business Analyst",
    "company": "Consulting Firm",
    "location": "Jakarta",
    "description": "Analyzing business processes and recommending improvements",
    "requirements": {
      "requiredSkills": ["Business Analysis", "Process Mapping", "Requirements Gathering"],
      "preferredSkills": ["SQL", "Tableau", "Project Management"],
      "experienceYears": 3,
      "education": "S1 Business or related"
    },
    "salary": { "min": 15000000, "max": 25000000 },
    "industry": "Consulting",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-17T00:00:00Z"
  },
  {
    "id": 2015,
    "title": "Mobile App Developer",
    "company": "App Factory",
    "location": "Bandung",
    "description": "Developing native and cross-platform mobile applications",
    "requirements": {
      "requiredSkills": ["Android", "Kotlin", "Swift", "iOS"],
      "preferredSkills": ["React Native", "Flutter", "Firebase"],
      "experienceYears": 3,
      "education": "S1 Computer Science or related"
    },
    "salary": { "min": 15000000, "max": 25000000 },
    "industry": "Technology",
    "jobType": "Full-time",
    "isFeatured": true,
    "postedDate": "2025-04-13T00:00:00Z"
  },
  {
    "id": 2016,
    "title": "Office Manager",
    "company": "Corporate Services",
    "location": "Jakarta",
    "description": "Managing office operations and administrative staff",
    "requirements": {
      "requiredSkills": ["Office Administration", "Staff Management", "Budget Planning"],
      "preferredSkills": ["Procurement", "Vendor Management", "Event Planning"],
      "experienceYears": 5,
      "education": "S1 Business Administration or related"
    },
    "salary": { "min": 12000000, "max": 18000000 },
    "industry": "Corporate Services",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-11T00:00:00Z"
  },
  {
    "id": 2017,
    "title": "Accounting Manager",
    "company": "Financial Services",
    "location": "Jakarta",
    "description": "Managing accounting operations and financial reporting",
    "requirements": {
      "requiredSkills": ["Accounting", "Financial Reporting", "Budgeting"],
      "preferredSkills": ["Taxation", "Audit", "ERP Systems"],
      "experienceYears": 6,
      "education": "S1 Accounting"
    },
    "salary": { "min": 20000000, "max": 30000000 },
    "industry": "Financial Services",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-06T00:00:00Z"
  },
  {
    "id": 2018,
    "title": "Supply Chain Analyst",
    "company": "Logistics Company",
    "location": "Surabaya",
    "description": "Analyzing and optimizing supply chain operations",
    "requirements": {
      "requiredSkills": ["Supply Chain Management", "Data Analysis", "Inventory Management"],
      "preferredSkills": ["ERP Systems", "Process Improvement", "Forecasting"],
      "experienceYears": 3,
      "education": "S1 Supply Chain or related"
    },
    "salary": { "min": 12000000, "max": 18000000 },
    "industry": "Logistics",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-15T00:00:00Z"
  },
  {
    "id": 2019,
    "title": "QA Engineer",
    "company": "Software Testing",
    "location": "Jakarta",
    "description": "Ensuring software quality through comprehensive testing",
    "requirements": {
      "requiredSkills": ["Manual Testing", "Test Planning", "Bug Tracking"],
      "preferredSkills": ["Automated Testing", "Selenium", "API Testing"],
      "experienceYears": 2,
      "education": "S1 Computer Science or related"
    },
    "salary": { "min": 10000000, "max": 18000000 },
    "industry": "Technology",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-18T00:00:00Z"
  },
  {
    "id": 2020,
    "title": "Legal Counsel",
    "company": "Corporate Law",
    "location": "Jakarta",
    "description": "Providing legal advice and ensuring regulatory compliance",
    "requirements": {
      "requiredSkills": ["Corporate Law", "Contract Review", "Legal Research"],
      "preferredSkills": ["Intellectual Property", "Compliance", "Regulatory Affairs"],
      "experienceYears": 5,
      "education": "S1 Law"
    },
    "salary": { "min": 25000000, "max": 40000000 },
    "industry": "Legal Services",
    "jobType": "Full-time",
    "isFeatured": false,
    "postedDate": "2025-04-10T00:00:00Z"
  }
]
```

### 3. Contoh Data Interaksi

```json
[
  {"userId": 1001, "jobId": 2001, "interactionType": "view", "timestamp": "2025-04-20T10:15:00Z", "durationSeconds": 120, "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2001, "interactionType": "save", "timestamp": "2025-04-20T10:17:00Z", "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2011, "interactionType": "view", "timestamp": "2025-04-20T10:20:00Z", "durationSeconds": 90, "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2013, "interactionType": "view", "timestamp": "2025-04-20T10:25:00Z", "durationSeconds": 60, "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2015, "interactionType": "view", "timestamp": "2025-04-20T10:30:00Z", "durationSeconds": 180, "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2015, "interactionType": "save", "timestamp": "2025-04-20T10:33:00Z", "source": "search", "deviceType": "desktop"},
  {"userId": 1001, "jobId": 2001, "interactionType": "apply", "timestamp": "2025-04-21T14:20:00Z", "source": "saved", "deviceType": "desktop"},

  {"userId": 1002, "jobId": 2002, "interactionType": "view", "timestamp": "2025-04-19T09:10:00Z", "durationSeconds": 150, "source": "search", "deviceType": "mobile"},
  {"userId": 1002, "jobId": 2002, "interactionType": "save", "timestamp": "2025-04-19T09:13:00Z", "source": "search", "deviceType": "mobile"},
  {"userId": 1002, "jobId": 2014, "interactionType": "view", "timestamp": "2025-04-19T09:20:00Z", "durationSeconds": 120, "source": "search", "deviceType": "mobile"},
  {"userId": 1002, "jobId": 2014, "interactionType": "save", "timestamp": "2025-04-19T09:22:00Z", "source": "search", "deviceType": "mobile"},
  {"userId": 1002, "jobId": 2002, "interactionType": "apply", "timestamp": "2025-04-20T16:30:00Z", "source": "saved", "deviceType": "desktop"},

  {"userId": 1003, "jobId": 2003, "interactionType": "view", "timestamp": "2025-04-18T11:05:00Z", "durationSeconds": 200, "source": "email", "deviceType": "desktop"},
  {"userId": 1003, "jobId": 2003, "interactionType": "save", "timestamp": "2025-04-18T11:08:00Z", "source": "email", "deviceType": "desktop"},
  {"userId": 1003, "jobId": 2009, "interactionType": "view", "timestamp": "2025-04-18T11:15:00Z", "durationSeconds": 90, "source": "search", "deviceType": "desktop"},
  {"userId": 1003, "jobId": 2013, "interactionType": "view", "timestamp": "2025-04-18T11:20:00Z", "durationSeconds": 150, "source": "search", "deviceType": "desktop"},
  {"userId": 1003, "jobId": 2013, "interactionType": "save", "timestamp": "2025-04-18T11:23:00Z", "source": "search", "deviceType": "desktop"},
  {"userId": 1003, "jobId": 2003, "interactionType": "apply", "timestamp": "2025-04-19T10:15:00Z", "source": "saved", "deviceType": "desktop"},

  {"userId": 1004, "jobId": 2004, "interactionType": "view", "timestamp": "2025-04-17T14:30:00Z", "durationSeconds": 180, "source": "search", "deviceType": "tablet"},
  {"userId": 1004, "jobId": 2004, "interactionType": "save", "timestamp": "2025-04-17T14:33:00Z", "source": "search", "deviceType": "tablet"},
  {"userId": 1004, "jobId": 2014, "interactionType": "view", "timestamp": "2025-04-17T14:40:00Z", "durationSeconds": 120, "source": "search", "deviceType": "tablet"},
  {"userId": 1004, "jobId": 2004, "interactionType": "apply", "timestamp": "2025-04-18T09:20:00Z", "source": "saved", "deviceType": "desktop"},

  {"userId": 1005, "jobId": 2005, "interactionType": "view", "timestamp": "2025-04-16T13:15:00Z", "durationSeconds": 150, "source": "search", "deviceType": "mobile"},
  {"userId": 1005, "jobId": 2012, "interactionType": "view", "timestamp": "2025-04-16T13:20:00Z", "durationSeconds": 210, "source": "search", "deviceType": "mobile"},
  {"userId": 1005, "jobId": 2012, "interactionType": "save", "timestamp": "2025-04-16T13:24:00Z", "source": "search", "deviceType": "mobile"},
  {"userId": 1005, "jobId": 2005, "interactionType": "view", "timestamp": "2025-04-17T10:10:00Z", "durationSeconds": 180, "source": "search", "deviceType": "desktop"},
  {"userId": 1005, "jobId": 2005, "interactionType": "save", "timestamp": "2025-04-17T10:13:00Z", "source": "search", "deviceType": "desktop"},
  {"userId": 1005, "jobId": 2005, "interactionType": "apply", "timestamp": "2025-04-17T18:30:00Z", "source": "saved", "deviceType": "desktop"},
  {"userId": 1005, "jobId": 2012, "interactionType": "apply", "timestamp": "2025-04-18T11:45:00Z", "source": "saved", "deviceType": "desktop"}
]
```

### Panduan Penggunaan Data Dummy untuk Local Testing

1. **Setup Database Testing**
   ```typescript
   // scripts/setup-test-data.ts
   
   async function seedTestData() {
     // Clear existing test data
     await db.execute(`TRUNCATE TABLE user_job_interactions CASCADE`);
     
     // Insert test users (simplified - in real implementation use actual user creation flow)
     for (const user of testUsers) {
       // Insert user and profile
     }
     
     // Insert test jobs
     for (const job of testJobs) {
       // Insert job details
     }
     
     // Insert test interactions
     for (const interaction of testInteractions) {
       await db.execute(`
         INSERT INTO user_job_interactions (
           user_id, job_id, interaction_type, timestamp, 
           duration_seconds, source, device_type
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       `, [
         interaction.userId,
         interaction.jobId,
         interaction.interactionType,
         interaction.timestamp,
         interaction.durationSeconds || null,
         interaction.source,
         interaction.deviceType
       ]);
     }
     
     console.log('Test data seeded successfully');
   }
   ```

2. **Menjalankan Algoritma dengan Data Dummy**
   ```typescript
   // Contoh penggunaan untuk testing rekomendasi
   
   // Uji rekomendasi untuk user yang memiliki interaksi
   const recommendations1 = await getRecommendations(1001);
   console.log('Recommendations for user with interactions:', recommendations1);
   
   // Uji rekomendasi untuk user yang memiliki sedikit interaksi
   const recommendations2 = await getRecommendations(1008);
   console.log('Recommendations for user with minimal interactions:', recommendations2);
   
   // Uji fallback untuk user baru tanpa interaksi
   const recommendations3 = await getRecommendations(1010);
   console.log('Recommendations for new user:', recommendations3);
   ```

3. **Visualisasi Hasil Rekomendasi**
   ```typescript
   // Utility untuk validasi visual
   
   function evaluateRecommendationQuality(userId, recommendations) {
     // Display simple analytics about the recommendations
     console.log(`Evaluation for User ID: ${userId}`);
     console.log(`Total recommendations: ${recommendations.length}`);
     
     // Check skill match
     const user = testUsers.find(u => u.id === userId);
     const skillMatchCount = recommendations.filter(job => {
       const testJob = testJobs.find(j => j.id === job.id);
       return testJob.requirements.requiredSkills.some(skill => 
         user.profile.skills.includes(skill)
       );
     }).length;
     
     console.log(`Recommendations with skill match: ${skillMatchCount} (${Math.round(skillMatchCount/recommendations.length*100)}%)`);
     
     // Check industry match
     const industryMatchCount = recommendations.filter(job => {
       const testJob = testJobs.find(j => j.id === job.id);
       return user.profile.preferredIndustries.includes(testJob.industry);
     }).length;
     
     console.log(`Recommendations with industry match: ${industryMatchCount} (${Math.round(industryMatchCount/recommendations.length*100)}%)`);
     
     // etc.
   }
   ```

## 3️⃣ Checklist QA Testing untuk Fitur Rekomendasi

### Pengujian Fungsional

#### 1. Interaksi User & Data Collection

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-INT-01 | Tracking view interaksi | 1. Login sebagai user test<br>2. Lihat detail lowongan<br>3. Cek database | Interaksi "view" terekam dengan timestamp, duration, device, source | High |
| TC-INT-02 | Tracking save interaksi | 1. Login sebagai user test<br>2. Simpan lowongan<br>3. Cek database | Interaksi "save" terekam dengan timestamp, device, source | High |
| TC-INT-03 | Tracking apply interaksi | 1. Login sebagai user test<br>2. Apply ke lowongan<br>3. Cek database | Interaksi "apply" terekam dengan timestamp, device, source | High |
| TC-INT-04 | Tracking pada multiple devices | 1. Login di mobile & desktop<br>2. Interaksi di kedua device | Device type tercatat dengan benar | Medium |
| TC-INT-05 | Tracking source attribution | 1. Akses lowongan dari search, email, browse<br>2. Interaksi dengan lowongan<br>3. Cek database | Source atribusi tercatat dengan benar | Medium |

#### 2. Rekomendasi Job

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-REC-01 | Rekomendasi untuk user dengan riwayat interaksi | 1. Login sebagai user dengan interaksi lengkap<br>2. Buka dashboard<br>3. Periksa rekomendasi | Rekomendasi muncul dan relevan dengan riwayat interaksi | High |
| TC-REC-02 | Rekomendasi untuk user baru | 1. Login sebagai user baru<br>2. Buka dashboard<br>3. Periksa rekomendasi | Rekomendasi fallback muncul (popular/location-based) | High |
| TC-REC-03 | Perubahan rekomendasi setelah interaksi | 1. Login sebagai user<br>2. Catat rekomendasi awal<br>3. Lakukan beberapa interaksi<br>4. Refresh & cek rekomendasi | Rekomendasi berubah berdasarkan interaksi baru | High |
| TC-REC-04 | Filtering rekomendasi | 1. Login & buka halaman rekomendasi<br>2. Gunakan filter (lokasi, jenis, dll)<br>3. Periksa hasil | Hasil rekomendasi difilter dengan benar | Medium |
| TC-REC-05 | Pagination rekomendasi | 1. Login & buka halaman rekomendasi<br>2. Scroll ke bawah / klik halaman berikutnya | Rekomendasi tambahan dimuat dengan benar | Medium |
| TC-REC-06 | Match score accuracy | 1. Login & buka rekomendasi<br>2. Periksa score vs profil user<br>3. Bandingkan dengan persyaratan lowongan | Match score mencerminkan kecocokan nyata | High |
| TC-REC-07 | Konsistensi rekomendasi | 1. Login & catat rekomendasi<br>2. Logout & login lagi<br>3. Bandingkan rekomendasi | Rekomendasi konsisten antara sesi (dengan variasi minor) | Medium |
| TC-REC-08 | Dampak setelah apply | 1. Login & catat rekomendasi<br>2. Apply ke salah satu lowongan<br>3. Refresh & cek rekomendasi | Lowongan yang di-apply tidak muncul lagi di rekomendasi | Medium |

#### 3. UI & UX 

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-UI-01 | Tampilan carousel rekomendasi | 1. Login & buka dashboard<br>2. Periksa carousel "Rekomendasi untuk Anda" | Carousel tampil dengan benar, dapat di-scroll, menampilkan 5-7 rekomendasi | High |
| TC-UI-02 | Tampilan Match Score | 1. Login & lihat rekomendasi<br>2. Periksa visual match score | Score bar ditampilkan dengan warna & persentase yang sesuai | High |
| TC-UI-03 | Tooltip alasan rekomendasi | 1. Login & lihat rekomendasi<br>2. Hover/klik ikon info di samping match score | Tooltip muncul dengan alasan rekomendasi yang jelas | Medium |
| TC-UI-04 | Responsivitas UI | 1. Akses dari desktop, tablet, mobile<br>2. Periksa tampilan di setiap device | UI responsif & dapat digunakan dengan baik di semua device | High |
| TC-UI-05 | Loading states | 1. Login dengan koneksi lambat<br>2. Buka halaman rekomendasi | Skeleton loader atau loading indicator muncul | Medium |
| TC-UI-06 | Empty states | 1. Login dengan user tanpa rekomendasi<br>2. Buka halaman rekomendasi | Pesan "Belum ada rekomendasi" yang informatif | Low |
| TC-UI-07 | Error states | 1. Simulasikan error API<br>2. Buka halaman rekomendasi | Pesan error yang user-friendly | Medium |

### Pengujian Non-Fungsional

#### 1. Performance

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-PERF-01 | Response time API rekomendasi | 1. Ukur waktu respons API<br>2. Test dengan user data berbeda | Response time < 500ms untuk 90% request | High |
| TC-PERF-02 | Skalabilitas data | 1. Test dengan dataset besar<br>2. 1000+ lowongan, 100+ interaksi per user | Performa tetap stabil | Medium |
| TC-PERF-03 | Client-side rendering | 1. Ukur waktu render komponen rekomendasi<br>2. Test di berbagai device | Render time < 300ms | Medium |

#### 2. Security & Privacy

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-SEC-01 | Authorization API rekomendasi | 1. Akses API tanpa token<br>2. Akses dengan token user lain | Request ditolak dengan 401/403 | High |
| TC-SEC-02 | Data privacy | 1. Periksa data yang disimpan<br>2. Verifikasi tidak ada PII dalam log | Tidak ada informasi sensitif terekspos | High |

#### 3. Usability

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-USA-01 | Clarity alasan rekomendasi | 1. Tunjukkan rekomendasi ke user<br>2. Tanyakan apakah mereka memahami alasan | User memahami mengapa job direkomendasikan untuk mereka | Medium |
| TC-USA-02 | Perceived relevance | 1. Tunjukkan rekomendasi ke user<br>2. Tanyakan seberapa relevan rekomendasi | User menilai rekomendasi relevan (skor > 7/10) | High |

### Pengujian A/B Testing

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-AB-01 | Variant assignment | 1. Login multiple users<br>2. Periksa variant ID di cookie/storage | Users tersebar merata di antara variants | High |
| TC-AB-02 | Variant persistence | 1. Login user<br>2. Catat variant<br>3. Logout & login lagi | User mendapat variant yang sama | High |
| TC-AB-03 | Metric collection | 1. Lakukan interaksi di tiap variant<br>2. Periksa data analytics | Metrics terekam dengan label variant yang benar | High |

### Template Test Report

```markdown
# QA Test Report: Sistem Rekomendasi Pekerjaan

## Test Summary

| Test Type | Total Cases | Passed | Failed | Blocked | Not Run |
|-----------|-------------|--------|--------|---------|---------|
| Functional | 21 | | | | |
| Non-Functional | 6 | | | | |
| A/B Testing | 3 | | | | |
| **Total** | **30** | | | | |

## Defects Found

| ID | Severity | Description | Reproducible | Status |
|----|----------|-------------|--------------|--------|
| | | | | |

## Test Environment

- Server Environment: 
- Browsers tested:
- Devices tested: 

## Recommendations

[Recommendations based on test results]

## Sign-off

**Tester**: [Name]  
**Date**: [Date]  
**Release Approval**: [Approved/Rejected]
```

---

**Tanggal Dokumen**: April 2025  
**Tim**: Product Development InfoPekerjaan.id  
**Status**: Draft for Review