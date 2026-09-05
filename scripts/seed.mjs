import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [k, ...v] = trimmed.split('=')
    if (k && v.length > 0) {
      process.env[k.trim()] = v.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey || !supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-supabase-url')) {
  console.log('⚠️  Please configure valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before seeding.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const initialProjects = [
  {
    slug: 'arventa-pms',
    title: 'ARVENTRA — Property Management System',
    subtitle: 'Enterprise SaaS Platform for Rental & Tenant Automation',
    badge: 'Fullstack / Enterprise',
    description: 'Enterprise multi-tenant property management system for managing rental portfolios, recurring billing, maintenance scheduling, and lease agreements with real-time audit logging and analytics.',
    overview: 'ARVENTRA transforms traditional property management workflows into a centralized, automated digital platform. It eliminates manual spreadsheet tracking, reduces tenant payment delays via automated invoice dispatch, and delivers real-time portfolio occupancy and yield metrics.',
    background: 'Managing tens to hundreds of tenant units across multiple building locations causes frequent reconciliation errors, missed late-fee assessments, and untracked repair tickets. ARVENTRA was built from the ground up as a cloud-native SaaS to provide institutional property managers complete visibility and granular operational control.',
    image_url: '/assets/projects/arventa.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 1,
    featured: true,
    published: true,
    tags: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker'],
    technologies: [
      { name: 'Next.js 15', slug: 'nextdotjs', color: '000000' },
      { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
      { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
      { name: 'Prisma ORM', slug: 'prisma', color: '2D3748' },
      { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4' },
      { name: 'Docker', slug: 'docker', color: '2496ED' }
    ],
    objectives: [
      'Automate monthly rent invoice generation and reconciliation across 500+ rental units.',
      'Provide instant tenant issue ticketing with status tracking and SLA notifications.',
      'Centralize legal lease documents with digital signature status tracking.',
      'Deliver real-time financial dashboards reporting gross yields, vacancy rates, and delinquency.'
    ],
    solutions: [
      'Engineered an automated billing engine running scheduled cron routines with dispute protection.',
      'Built a granular role-based access control (RBAC) supporting Super Admins, Property Managers, and Tenants.',
      'Developed a responsive tenant portal for submitting maintenance work orders with photo attachments.',
      'Integrated real-time notification webhooks for overdue payments and urgent facility tickets.'
    ],
    architecture: [
      {
        layer: 'Frontend & UI Layer',
        tech: ['Next.js 15 (App Router)', 'TypeScript', 'Tailwind CSS', 'Radix UI'],
        description: 'Server Components for high-performance dashboard streaming and interactive Client Components for dynamic tenant filtering and forms.'
      },
      {
        layer: 'Application & API Layer',
        tech: ['Node.js', 'Next.js Route Handlers', 'Zod Validation', 'Jose JWT'],
        description: 'RESTful API with strict runtime request schema validation, tokenized session verification, and standardized response envelopes.'
      },
      {
        layer: 'Database & Storage Layer',
        tech: ['PostgreSQL', 'Prisma ORM', 'Supabase Storage'],
        description: 'Relational data schema with foreign key constraints, automated migration tracking, and secure asset hosting for lease PDF agreements and tenant documents.'
      }
    ],
    challenges: [
      {
        title: 'High-Volume Recurring Billing Concurrency',
        problem: 'Triggering monthly invoices simultaneously across hundreds of units caused database lock contention and sporadic duplicate invoice creation.',
        solution: 'Implemented idempotency keys and database-level transaction locks with batched background worker queues, guaranteeing zero duplicate billing entries.'
      },
      {
        title: 'Multi-Tenant Data Isolation',
        problem: 'Ensuring strict data segregation between different property management organizations sharing the same database infrastructure.',
        solution: 'Configured row-level tenant filtering integrated directly into Prisma middleware, automatically appending company ID constraints to all query operations.'
      }
    ],
    lessons_learned: [
      'Early architecture decisions around multi-tenancy and data segregation dramatically simplify future enterprise feature rollouts.',
      'Robust audit logging is not just a compliance requirement—it serves as the fastest debugging tool during dispute resolution.',
      'Client-side optimistic updates significantly elevate user perception of software responsiveness in data-heavy enterprise portals.'
    ],
    gallery: [
      {
        id: 'arventa-analytics',
        title: 'Portfolio Performance & Revenue Analytics',
        caption: 'Interactive charts tracking monthly revenue collections, occupancy ratios, and outstanding tenant balances.',
        image_url: '/assets/projects/arventa_analytics.jpg'
      },
      {
        id: 'arventa-tenants',
        title: 'Tenant Directory & Active Lease Directory',
        caption: 'Central directory for searching active tenant profiles, lease expiration alerts, and payment statuses.',
        image_url: '/assets/projects/arventa_tenants.jpg'
      }
    ]
  },
  {
    slug: 'ckd-predict',
    title: 'CKD Early Risk Prediction & Health Analytics',
    subtitle: 'Machine Learning Clinical Diagnostic Support System',
    badge: 'Machine Learning / Health',
    description: 'An explainable machine learning predictive platform analyzing biomedical blood markers and patient clinical histories to identify early-stage Chronic Kidney Disease (CKD).',
    overview: 'This diagnostic support system empowers healthcare clinicians to identify early-stage CKD before irreversible renal damage occurs.',
    background: 'Chronic Kidney Disease often progresses asymptomatically until advanced stages. Early diagnosis dramatically improves patient outcomes and reduces dialysis dependency.',
    image_url: '/assets/projects/ckd.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 2,
    featured: true,
    published: true,
    tags: ['Python', 'Scikit-Learn', 'FastAPI', 'XGBoost', 'SHAP', 'Streamlit'],
    technologies: [
      { name: 'Python', slug: 'python', color: '3776AB' },
      { name: 'Scikit-Learn', slug: 'scikitlearn', color: 'F7931E' },
      { name: 'FastAPI', slug: 'fastapi', color: '009688' },
      { name: 'XGBoost', slug: 'xgboost', color: '159957' },
      { name: 'SHAP', slug: 'python', color: 'FF4154' }
    ],
    objectives: [
      'Achieve clinical-grade classification accuracy (>96%) on multi-attribute patient datasets.',
      'Generate SHAP explainability waterfall plots for individual prediction interpretability.',
      'Deploy low-latency REST inference microservice capable of sub-100ms response times.'
    ],
    solutions: [
      'Applied robust imputation and SMOTE oversampling to rectify clinical data class imbalances.',
      'Benchmarked ensemble classifiers and tuned XGBoost hyperparameters via 10-fold cross validation.',
      'Packaged inference pipeline into a lightweight FastAPI service with interactive documentation.'
    ],
    architecture: [
      {
        layer: 'Data & Model Layer',
        tech: ['Pandas', 'Scikit-Learn', 'XGBoost', 'Joblib'],
        description: 'Feature normalization, recursive feature elimination, and serialized model artifacts.'
      },
      {
        layer: 'API & Serving Layer',
        tech: ['FastAPI', 'Uvicorn', 'Pydantic'],
        description: 'Input validation and real-time clinical probability scoring with SHAP force values.'
      }
    ],
    challenges: [
      {
        title: 'Missing Lab Value Handling',
        problem: 'Real-world clinical datasets feature significant rates of uncollected lab tests.',
        solution: 'Implemented iterative multivariate imputation (MICE) preserving underlying biometric correlations.'
      }
    ],
    lessons_learned: [
      'Model interpretability and transparency are just as critical as raw accuracy metrics in clinical healthcare tools.'
    ],
    gallery: [
      {
        id: 'ckd-analytics',
        title: 'Biomarker Correlation & Risk Matrix',
        caption: 'Heatmap visualization identifying critical blood serum indicators impacting model predictions.',
        image_url: '/assets/projects/ckd_analytics.jpg'
      }
    ]
  },
  {
    slug: 'hdl-cardio',
    title: 'Cardiovascular Risk Stratification Engine',
    subtitle: 'Clinical Decision Support System via Machine Learning',
    badge: 'Machine Learning / Healthcare',
    description: 'Predictive health analytics engine evaluating cardiovascular event risks using physiological markers, lipid profiles, and patient lifestyle indicators.',
    overview: 'Clinical decision-support tool helping preventative cardiologists prioritize patient intervention schedules.',
    background: 'Cardiovascular diseases remain the leading cause of global mortality. Stratifying risk profiles allows targeted early intervention.',
    image_url: '/assets/projects/hdl.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 3,
    featured: true,
    published: true,
    tags: ['Python', 'Pandas', 'LightGBM', 'FastAPI', 'Docker'],
    technologies: [
      { name: 'Python', slug: 'python', color: '3776AB' },
      { name: 'LightGBM', slug: 'lightgbm', color: 'FF8000' },
      { name: 'FastAPI', slug: 'fastapi', color: '009688' },
      { name: 'Docker', slug: 'docker', color: '2496ED' }
    ],
    objectives: [
      'Evaluate cardiovascular risk probabilities across heterogeneous patient populations.',
      'Provide intuitive visual feature importance rankings for practitioner consultation.'
    ],
    solutions: [
      'Trained high-efficiency LightGBM tree models achieving 0.94 ROC-AUC score.',
      'Designed patient risk report generation module with actionable health metric recommendations.'
    ],
    architecture: [
      {
        layer: 'Predictive Core',
        tech: ['LightGBM', 'Python', 'NumPy'],
        description: 'Optimized gradient boosted trees with early stopping.'
      }
    ],
    challenges: [
      {
        title: 'High Variance across Demographic Groups',
        problem: 'Model performance degraded on underrepresented age brackets.',
        solution: 'Balanced demographic representations through stratified sampling and fairness-aware threshold tuning.'
      }
    ],
    lessons_learned: [
      'Rigorous stratified sampling prevents bias propagation across health analytics models.'
    ],
    gallery: [
      {
        id: 'hdl-shap',
        title: 'SHAP Individual Feature Impact Analysis',
        caption: 'Waterfall plot explaining risk contribution factors for an individual clinical patient.',
        image_url: '/assets/projects/hdl_shap.jpg'
      }
    ]
  },
  {
    slug: 'sentivox-nlp',
    title: 'SentiVox — Indonesian Public Sentiment NLP',
    subtitle: 'Aspect-Based Sentiment Mining on Social & News Feeds',
    badge: 'NLP / Deep Learning',
    description: 'Natural language processing platform analyzing Indonesian social discussions, news articles, and citizen feedback with aspect-level sentiment categorization.',
    overview: 'SentiVox provides real-time monitoring and sentiment classification for Indonesian textual conversations.',
    background: 'Indonesian language processing entails complex colloquialisms, slang, and code-mixing that standard English NLP models fail to parse.',
    image_url: '/assets/projects/sentivox.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 4,
    featured: false,
    published: true,
    tags: ['Python', 'IndoBERT', 'PyTorch', 'HuggingFace', 'FastAPI'],
    technologies: [
      { name: 'Python', slug: 'python', color: '3776AB' },
      { name: 'IndoBERT', slug: 'huggingface', color: 'FFD21E' },
      { name: 'PyTorch', slug: 'pytorch', color: 'EE4C2C' }
    ],
    objectives: [
      'Extract sentiment polarities from informal Indonesian social commentary.',
      'Achieve >91% macro F1-score across positive, neutral, and negative categories.'
    ],
    solutions: [
      'Fine-tuned IndoBERT transformer on domain-specific Indonesian social corpus.',
      'Constructed automated slang normalization dictionary and emoji sentiment translation layer.'
    ],
    architecture: [
      {
        layer: 'NLP Processing Pipeline',
        tech: ['IndoBERT', 'HuggingFace Transformers', 'TorchScript'],
        description: 'Tokenization, aspect extraction, and sentiment inference.'
      }
    ],
    challenges: [
      {
        title: 'Slang and Dialect Inconsistencies',
        problem: 'Extreme variation in informal text phrasing reduced base model accuracy.',
        solution: 'Developed custom rule-based preprocessor mapping Indonesian slang to standard root words.'
      }
    ],
    lessons_learned: [
      'Domain-specific text normalization is paramount when dealing with informal regional languages.'
    ],
    gallery: []
  },
  {
    slug: 'kmeans-clustering',
    title: 'Customer Segmentation & Behavior Clustering',
    subtitle: 'Unsupervised Machine Learning for Retail Analytics',
    badge: 'Data Science / Analytics',
    description: 'Unsupervised clustering platform analyzing multi-dimensional retail customer purchasing behaviors, RFM indicators, and lifetime value segments.',
    overview: 'Interactive customer analytics workspace discovering latent client cohorts to optimize marketing campaigns.',
    background: 'Retail operations struggle to personalize promotions without clear behavioral clustering of customer transaction patterns.',
    image_url: '/assets/projects/clustering.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 5,
    featured: false,
    published: true,
    tags: ['Python', 'Scikit-Learn', 'PCA', 'Seaborn', 'RFM Analysis'],
    technologies: [
      { name: 'Python', slug: 'python', color: '3776AB' },
      { name: 'Scikit-Learn', slug: 'scikitlearn', color: 'F7931E' },
      { name: 'Pandas', slug: 'pandas', color: '150458' }
    ],
    objectives: [
      'Identify distinct customer value segments based on Recency, Frequency, and Monetary metrics.',
      'Provide 3D cluster visualizations through Principal Component Analysis (PCA).'
    ],
    solutions: [
      'Computed optimal cluster counts using Silhouette analysis and Elbow curve evaluation.',
      'Constructed actionable persona summaries for each identified customer cohort.'
    ],
    architecture: [
      {
        layer: 'Analytics Pipeline',
        tech: ['Python', 'Scikit-Learn', 'Matplotlib'],
        description: 'Data transformation, PCA dimension reduction, and K-Means clustering.'
      }
    ],
    challenges: [
      {
        title: 'Outlier Skewing Centroid Placement',
        problem: 'High-value wholesale purchases skewed cluster centers.',
        solution: 'Applied log transforms and robust scaling to stabilize variance across purchase values.'
      }
    ],
    lessons_learned: [
      'Unsupervised model validation requires combining mathematical metrics with practical business interpretability.'
    ],
    gallery: []
  },
  {
    slug: 'ims-kominfo',
    title: 'Inventory & Asset Management System',
    subtitle: 'Internal Government Asset Tracking & Disposal Auditing',
    badge: 'Fullstack / Web App',
    description: 'Full-stack government asset lifecycle management platform automating hardware allocations, department transfers, routine maintenance schedules, and disposal reporting.',
    overview: 'Centralized government asset directory eliminating paper logbooks and maintaining verifiable audit records.',
    background: 'Government agency departments require rigorous verification for hardware lifecycles and asset custodianship.',
    image_url: '/assets/projects/ims.png',
    github_url: 'https://github.com/yacobusdaeli',
    demo_url: 'https://yd.vercel.app',
    order_index: 6,
    featured: false,
    published: true,
    tags: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'DataTables'],
    technologies: [
      { name: 'Laravel', slug: 'laravel', color: 'FF2D20' },
      { name: 'PHP', slug: 'php', color: '777BB4' },
      { name: 'MySQL', slug: 'mysql', color: '4479A1' }
    ],
    objectives: [
      'Track lifecycle states for over 2,000 public IT hardware assets.',
      'Generate automated PDF handover receipts and disposal certification documents.'
    ],
    solutions: [
      'Implemented QR-code scanning integration for rapid inventory audit checks.',
      'Built multi-level department approval workflows for asset transfer requests.'
    ],
    architecture: [
      {
        layer: 'Fullstack Monolith',
        tech: ['Laravel', 'Blade', 'MySQL'],
        description: 'MVC architecture with Eloquent ORM relationships and automated migrations.'
      }
    ],
    challenges: [
      {
        title: 'Legacy Data Migration',
        problem: 'Existing inventory existed in disparate non-standardized spreadsheet files.',
        solution: 'Built robust CSV migration parser with validation error logs and duplicate resolution.'
      }
    ],
    lessons_learned: [
      'Strict input validation at data ingestion saves weeks of subsequent data sanitization.'
    ],
    gallery: []
  }
]

async function seed() {
  console.log(`Starting seed of ${initialProjects.length} projects...`)
  for (const project of initialProjects) {
    console.log(`Upserting project: ${project.slug}`)
    const { error } = await supabase
      .from('projects')
      .upsert(project, { onConflict: 'slug' })

    if (error) {
      console.error(`Failed to upsert ${project.slug}:`, error.message)
    } else {
      console.log(`Seeded ${project.slug}`)
    }
  }
  console.log('Seed completed!')
}

seed().catch(err => {
  console.error('Seed script error:', err)
  process.exit(1)
})
