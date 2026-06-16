# Digitzs Solutions, Inc. - Technology Stack & Partner Ecosystem

**Document Version:** 1.0
**Last Updated:** March 30, 2026
**Based on:** Starlio.tech V3 Technology Audit (May 29, 2025)

---

## Executive Summary

Digitzs Solutions operates a PCI DSS Level 1 compliant payment processing platform built on modern cloud infrastructure. This document provides a comprehensive overview of our technology stack, infrastructure partners, third-party integrations, and business model as assessed prior to V3 production readiness.

---

## 1. Technology Stack Overview

### 1.1 Frontend Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18.3.1 | Modern UI component library |
| **Server-Side Rendering** | Next.js | SEO optimization and performance |
| **Backend Framework** | NestJS | Structured Node.js API framework |
| **Build Tool** | Vite | Fast development and build processes |
| **ORM** | TypeORM | Database object-relational mapping |
| **Language** | JavaScript/TypeScript | Type-safe development |
| **UI Components** | Lucide React | Icon library |

**Key Vulnerabilities Identified:**
- 15 vulnerabilities (2 low, 7 moderate, 3 high, 3 critical)
- Requires npm audit fix and dependency updates

### 1.2 Backend Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary Backend** | NestJS (Node.js) | API services and business logic |
| **Data Processing** | Python | ETL for Propay report data ingestion |
| **CMS Backend** | PHP (WordPress) | Content management |
| **API Documentation** | Swagger/OpenAPI | API specification and testing |

**Key Vulnerabilities Identified:**
- 26 vulnerabilities (3 low, 11 moderate, 11 high, 1 critical)
- Requires comprehensive security patching

### 1.3 Database & Storage

| Component | Technology | Specifications |
|-----------|-----------|----------------|
| **Primary Database** | Amazon RDS Aurora Serverless MySQL | Version 5.7 (requires upgrade to 8.4) |
| **Database Mode** | Serverless | Auto-scaling based on demand |
| **Regions** | us-west-1, us-west-2 | Multi-region deployment |
| **Data Storage** | Amazon S3 | File and document storage |

**Critical Security Issues:**
- Aurora V3 is publicly exposed to the Internet
- Security groups allow all inbound connections (HIGH RISK)
- MySQL 5.7 is on RDS Extended Support (increased costs)

---

## 2. Cloud Infrastructure & Partners

### 2.1 Amazon Web Services (AWS)

**Primary Infrastructure Provider**

| Service | Usage | Account Details |
|---------|-------|-----------------|
| **AWS Account** | 3370-2264-7633 | Primary production account |
| **Regions** | us-west-1, us-west-2 | Multi-region deployment |
| **VPC** | vpc-080aec4827a1eed7 | Isolated network environment |

#### Core AWS Services in Use

**Compute & Orchestration:**
- **Amazon ECS (Elastic Container Service)** - Container orchestration for backend services
- **AWS Lambda** - Serverless functions (V2 architecture)
- **EC2 (T3 instances)** - 172.17.2.4 instance identified

**Database:**
- **Amazon Aurora Serverless MySQL** - Primary data storage
- **RDS Cluster** (digitzs-rds-cluster) - Managed database service

**Networking & Content Delivery:**
- **Amazon CloudFront** - CDN for frontend distribution
- **Application Load Balancer** (digitzs-load-balancer) - Traffic distribution
- **VPC** - Network isolation and security

**Security:**
- **AWS WAF** (production-waf-acl) - Web Application Firewall
- **AWS Security Groups** - Network access control
- **AWS IAM** - Identity and access management

**Storage:**
- **Amazon S3** - Object storage for files and static content
- **EBS Volumes** - Block storage for EC2 instances

**Monitoring & Logging (Recommended):**
- AWS CloudWatch - Monitoring and alerting
- AWS CloudTrail - API activity logging
- VPC Flow Logs - Network traffic analysis
- AWS GuardDuty - Threat detection
- AWS Config - Resource compliance tracking
- AWS Security Hub - Centralized security management

### 2.2 Infrastructure Cost Optimization Opportunities

**Identified Savings:**
- Potential $200/month savings through resource optimization
- MySQL 5.7 Extended Support penalty costs
- Right-sizing ECS instances and EBS volumes

---

## 3. Payment Processing Partners

### 3.1 TokenEx

**Service:** Payment tokenization and secure card data handling

**Integration Details:**
- **Token Count:** 6,912 active tokens
- **Implementation:** iFrame-based checkout
- **Purpose:** PCI DSS scope reduction through tokenization
- **Recommendation:** Delete inactive users to optimize costs

### 3.2 Kount (Fraud Prevention)

**Service:** Real-time fraud detection and prevention

**Integration Details:**
- **Session Management:** Session ID tracking in registrations table
- **Implementation Status:** Active
- **User Management:** Requires cleanup of inactive users
- **Database Field:** kount_session_id in registrations table

### 3.3 Payment Processors

#### ProPay
- **Transaction Tracking:** propay_transaction_id field
- **Data Ingestion:** Python ETL for report processing
- **Integration Type:** Direct API integration

#### NMI (Network Merchants Inc.)
- **Integration:** NMI Collect for secure payment collection
- **Security Key:** Direct integration with Digitzs security key
- **Documentation:** NMI_COLLECT_SETUP.md available

#### PayVia
- **Service Type:** Payment gateway wrapper/aggregator
- **Version:** V4 API integration
- **Documentation:** Multiple integration guides available
- **Purpose:** Processor switching and multi-processor support

---

## 4. Third-Party Service Partners

### 4.1 Identity Provider

**Cognito IDP (MyIQ User Provider)**
- **AWS Account:** digitzs-primary
- **Purpose:** User authentication and management
- **Integration:** V2 environment hosted service

### 4.2 Ticketing & Events

**TicketSocket**
- **Integration:** Event management and ticketing
- **Database Fields:** ticketsocket_event_id, ticketsocket_order_id
- **API Type:** RESTful API integration
- **Edge Function:** Dedicated Supabase function for integration

### 4.3 Development & Operations Tools

| Tool | Purpose | Provider |
|------|---------|----------|
| **GitHub** | Source code repository | GitHub, Inc. |
| **GitHub Actions** | CI/CD pipelines | GitHub, Inc. |
| **Terraform** | Infrastructure as Code | HashiCorp |
| **Slack** | Team communication | Salesforce |
| **Jira** | Project management | Atlassian |
| **Confluence** | Documentation | Atlassian |
| **NewRelic** | Application monitoring (adapter found, likely disabled) | New Relic |

### 4.4 Development Monitoring (Recommended)

- **SonarQube** - SAST/DAST code security scanning
- **Trivy** - Container vulnerability scanning
- **AWS Lambda Power Tuning** - Performance optimization

---

## 5. Application Architecture

### 5.1 V3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TokenEx iFrame                           │
│              (Static HTML/CSS/JS on Checkout)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Customer Browser                          │
│          (ISV Checkout Page via CloudFront)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           AWS Account 3370-2264-7633 (Terraform)            │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  CloudFront (TF)                    │    │
│  └────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────┬──────────────────────────┐    │
│  │   digitzs-frontend      │    digitzs-worker        │    │
│  │   (ECS Service)         │    (ECS Service)         │    │
│  └─────────────────────────┴──────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐    │
│  │              digitzs-api (ECS Service)              │    │
│  │         digitzs-load-balancer (ALB)                │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐    │
│  │      digitzs-rds-cluster (Aurora MySQL)            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          V2 Environment (digitzs-primary AWS)               │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ V2 Payment   │  Cognito IDP  │ V2 Create Merchant │    │
│  │  (TokenEx)   │   (MyIQ)      │    (Lambda)        │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│                  MyIQ UI (S3)                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Component Details

**digitzs-worker (Background Services):**
- Asynchronous task processing
- Background job execution
- Deployed in private subnets
- ECS tasks or EC2 instances

**digitzs-frontend (Web Application):**
- React/Next.js application
- Served via CloudFront CDN
- Static assets on S3
- Dynamic content via load balancer

**digitzs-api (Backend API):**
- NestJS containerized services
- Exposed through ALB
- Handles business logic
- Integrates with payment partners

**digitzs-rds-cluster (Database):**
- Aurora Serverless MySQL 5.7
- Auto-scaling capacity
- High availability
- **Security Issue:** Publicly exposed

---

## 6. Implemented Functionality

### 6.1 Backend Services

**Core Services:**
- Affiliates management
- Checkout processing
  - Payments
  - Embedded payments
  - Token management
- Background jobs (currently disabled)
- Email sender
- Events management
- Files management
- Marketing Ads
- Merchant management
  - Bank account handling
  - Card details
  - Merchant of record
  - Transaction data
- Payment links management
- User management
  - User creation
  - Login
  - Password management
- Responsible beneficial owner
- Sales copy record
- Taxpayer receiving income

**V2 Support Services:**
- Merchant management
- Partner management
- Processor management
- User management
- DynamoDB data storage

**Incomplete Services:**
- Webhook for Kount (not implemented)

### 6.2 Frontend Functionality

**User-Facing Features:**
- Deposit management
- Document management
- Payment links management
- Payment receipt management
- Merchant management
  - Onboarding
  - Transaction viewing
- Taxpayer management
- Embedded checkout

### 6.3 Monitoring & Observability

**Current State:**
- NewRelic adapter found but likely disabled
- No comprehensive monitoring solution active
- Logs stored in CloudWatch (review shows no significant issues)

**Recommended:**
- Enable CloudWatch dashboards
- Configure critical alarms
- Implement centralized logging (SIEM)
- Set up distributed tracing

---

## 7. PCI DSS Compliance Infrastructure

### 7.1 Current Compliance Status

**Level:** PCI DSS Level 1 (Payment Service Provider)
**Attestation Date:** July 31, 2025
**Assessor:** Third-party QSA

### 7.2 Security Infrastructure

**Implemented:**
- AWS WAF (production-waf-acl)
- Security Groups
- VPC isolation
- CloudFront distribution
- TokenEx tokenization (scope reduction)

**Critical Gaps:**
- Database publicly exposed
- Security groups too permissive
- Missing encryption at rest verification
- No VPC Flow Logs enabled
- No GuardDuty threat detection
- Limited logging and monitoring

### 7.3 PCI Compliance Requirements (Outstanding)

1. **Data Encryption:** At rest and in transit validation
2. **Vulnerability Management:** Formal processes needed
3. **CDE Isolation:** Cardholder Data Environment segmentation
4. **Security Policies:** PCI-specific documentation
5. **Quarterly Scanning:** ASV scans and remediation
6. **Annual Penetration Testing:** Third-party assessment
7. **Change Management:** Formalized procedures
8. **Incident Response Plan:** Payment card data specific

---

## 8. Architecture Evolution: V2 vs V3

### 8.1 V2 Architecture (Serverless)

**Components:**
- AWS API Gateway
- AWS Lambda functions
- DynamoDB (NoSQL)
- S3 for static content

**Advantages:**
- Fully managed by AWS
- Smaller PCI scope
- Automatic scaling
- Pay-per-request pricing
- Easier compliance

**Disadvantages:**
- Less infrastructure control
- Cold start latency
- Lambda execution limits

### 8.2 V3 Architecture (Container-Based)

**Components:**
- Amazon ECS
- Application Load Balancer
- CloudFront CDN
- Aurora MySQL

**Advantages:**
- Full infrastructure control
- Docker container support
- Predictable costs for high traffic
- Better for steady workloads

**Disadvantages:**
- Higher maintenance burden
- Larger PCI scope
- Manual scaling configuration
- OS and container management

### 8.3 Recommendation

**For PCI Compliance:** V2 Serverless architecture is simpler and more secure
**For Flexibility:** V3 ECS architecture offers more control at cost of added responsibility

---

## 9. Repository Structure

**GitHub Repository:** https://github.com/digitzs-solutions/digitzs

### 9.1 Key Directories

```
digitzs/
├── services/
│   ├── api/              # Backend API services
│   ├── frontend/         # React/Next.js frontend
│   └── worker/           # Background job processor
├── .github/
│   └── workflows/        # CI/CD pipelines
├── terraform/            # Infrastructure as Code
├── node_modules/         # Dependencies
├── public/               # Static assets
└── src/
    ├── app/
    ├── components/
    ├── constants/
    ├── data/
    ├── helpers/
    ├── hooks/
    ├── pages/
    ├── providers/
    └── services/
```

### 9.2 Configuration Files

- TypeScript configuration (tsconfig.json)
- NestJS framework setup
- TypeORM database configuration
- Vite build configuration

---

## 10. Business Model & Service Delivery

### 10.1 Core Business

**Service Type:** Payment Service Provider (PSP)
**Market Position:** Payment gateway aggregation and processor switching
**Value Proposition:** PCI DSS Level 1 compliant payment processing with processor flexibility

### 10.2 Revenue Streams

1. **Transaction Processing Fees**
   - Per-transaction charges
   - Percentage of transaction volume

2. **Platform Subscriptions**
   - Merchant onboarding
   - Payment link services
   - Embedded checkout solutions

3. **Affiliate Program**
   - Partner referral commissions
   - Revenue sharing models

### 10.3 Customer Segments

**Primary Customers:**
- Independent Software Vendors (ISVs)
- Merchants requiring payment processing
- Affiliates and partners
- Event organizers (via TicketSocket integration)

**V2 Support:**
- Legacy merchant accounts
- Partner integrations
- Existing user base migration

---

## 11. Production Readiness Assessment

### 11.1 Must Have Requirements (Pre-Launch)

**Infrastructure:**
- ✅ Multi-AZ deployment for critical services
- ✅ Auto-scaling with health checks
- ✅ Security group rules with least privilege
- ⚠️ CloudWatch dashboards and alarms (needs configuration)
- ⚠️ Service-level objectives (SLOs) definition

**Security:**
- ❌ Fix database public exposure (CRITICAL)
- ❌ Upgrade MySQL 5.7 to 8.4
- ⚠️ Configure security group rules properly

**CI/CD:**
- ✅ Security scanning in pipelines
- ✅ SAST/DAST with SonarQube
- ✅ Container vulnerability scanning (Trivy)
- ✅ Automated rollback mechanisms
- ✅ SLO monitoring

**Data Protection:**
- ⚠️ Backup policies for critical data
- ⚠️ RDS automated backups
- ⚠️ Cross-region backup vault
- ⚠️ Data lifecycle policies

**Incident Response:**
- ⚠️ Incident response plan documentation
- ⚠️ Slack alerts via AWS Chatbot
- ⚠️ AWS Incident Manager / PagerDuty setup
- ⚠️ AWS Health Dashboard integration
- ⚠️ Runbooks for common issues

**Documentation:**
- ⚠️ Runbooks and procedures
- ⚠️ Knowledge base setup
- ⚠️ Operational metrics dashboard
- ⚠️ Backup and restore procedures

**Testing:**
- ⚠️ Test rollback procedures
- ⚠️ Validate monitoring and alerting
- ⚠️ Test access controls

### 11.2 Nice to Have Enhancements

**Infrastructure:**
- VPC Flow Logs
- Strict Network ACLs

**Security:**
- AWS WAF / CloudFlare DDoS protection
- AWS GuardDuty threat detection
- AWS Config resource tracking
- AWS Security Hub

**Monitoring:**
- Centralized logging (SIEM)
- Custom business KPIs
- Anomaly detection

**CI/CD:**
- Deployment verification tests

**Data Protection:**
- Data classification and tagging

**Incident Response:**
- Automated incident response
- Runbooks for common issues
- On-call rotation (24/7)
- Post-incident review process

**Performance:**
- Database read replicas
- AWS Compute Optimizer
- AWS Trusted Advisor checks

**Testing:**
- Penetration testing
- Load testing
- Failover procedure testing
- Disaster recovery drills

---

## 12. Cost Optimization Roadmap

### 12.1 Immediate Savings

**Identified Opportunities:**
- ~$200/month through resource right-sizing
- MySQL Extended Support penalty elimination (upgrade to 8.4)
- ECS instance optimization
- EBS volume right-sizing

### 12.2 Long-Term Optimization

**Strategies:**
- Implement AWS Cost Explorer
- Configure AWS Budgets with alerts
- Use AWS Lambda Power Tuning
- Consider ElastiCache for MySQL optimization
- Evaluate Serverless vs. ECS cost trade-offs

### 12.3 Budget Planning Requirements

**Data Needed:**
1. CPU/memory requirements
2. Expected request volume
3. Data transfer estimates
4. Regional traffic distribution
5. Auto-scaling parameters
6. Backup retention requirements
7. Security service scope
8. Development environment allocation

---

## 13. Partner Engagement: Starlio.tech

### 13.1 Audit Summary

**Engagement Date:** May 29, 2025
**Audit Type:** Infrastructure and Application Architecture Assessment
**Scope:** V3 Pre-Production Readiness

**Key Findings:**
- 26 backend vulnerabilities (1 critical)
- 15 frontend vulnerabilities (3 critical)
- Critical database security issues
- Missing production readiness controls
- PCI compliance gaps

### 13.2 Starlio.tech Capabilities

**Company Profile:**
- 3+ years of establishment
- 30+ employees
- 25+ completed projects
- 3+ delivery locations

**Service Models:**
1. Consulting Services
2. Managed Services
3. Staff Augmentation

**Technology Expertise:**
- Web Development
- Mobile Development
- DevOps
- IoT
- AI Technologies

**Fintech Experience:**
- Founder has fintech background
- Data security expertise
- Payment industry knowledge
- PCI DSS compliance experience

### 13.3 Proposed Next Steps

1. Analyze audit findings
2. Review business requirements
3. Define implementation scope
4. Execute remediation work
5. Conduct end-to-end testing
6. Launch V3 production

---

## 14. Critical Action Items

### 14.1 Security (URGENT)

| Priority | Action | Timeline | Owner |
|----------|--------|----------|-------|
| P0 | Fix database public exposure | Immediate | DevOps |
| P0 | Restrict security group rules | Immediate | DevOps |
| P0 | Fix critical vulnerabilities (4 total) | 1 week | Development |
| P1 | Upgrade MySQL 5.7 to 8.4 | 2 weeks | DevOps + DBA |
| P1 | Fix high vulnerabilities (14 total) | 2 weeks | Development |

### 14.2 Infrastructure (HIGH)

| Priority | Action | Timeline | Owner |
|----------|--------|----------|-------|
| P1 | Implement multi-AZ deployment | 1 week | DevOps |
| P1 | Configure auto-scaling | 1 week | DevOps |
| P1 | Set up CloudWatch monitoring | 1 week | DevOps |
| P2 | Enable VPC Flow Logs | 2 weeks | DevOps |
| P2 | Configure AWS WAF rules | 2 weeks | Security |

### 14.3 Compliance (HIGH)

| Priority | Action | Timeline | Owner |
|----------|--------|----------|-------|
| P1 | Document incident response plan | 1 week | Security + Ops |
| P1 | Establish backup procedures | 1 week | DevOps |
| P2 | Implement data encryption validation | 2 weeks | Security |
| P2 | Enable GuardDuty | 2 weeks | Security |
| P2 | Configure AWS Config rules | 2 weeks | Compliance |

---

## 15. Conclusion

Digitzs Solutions operates a modern, cloud-based payment processing platform with strong partnerships across payment processors, fraud prevention, and tokenization providers. The V3 architecture represents a shift from serverless to container-based infrastructure, offering greater control at the cost of increased operational complexity.

**Strengths:**
- PCI DSS Level 1 compliance achieved
- Strong technology partnerships (TokenEx, Kount, multiple processors)
- Modern tech stack (React, NestJS, AWS)
- Multi-processor support via PayVia
- Comprehensive payment functionality

**Critical Gaps:**
- Database security exposure (public access)
- Outdated MySQL version (cost penalty)
- Missing production monitoring
- Incomplete incident response procedures
- Security vulnerabilities in dependencies

**Recommended Path Forward:**
1. Immediately address critical security issues
2. Implement must-have production readiness requirements
3. Upgrade database infrastructure
4. Establish comprehensive monitoring
5. Complete PCI compliance gap remediation
6. Consider V2 Serverless architecture benefits vs. V3 complexity

With proper remediation of identified issues and implementation of production readiness requirements, the V3 platform can successfully support Digitzs' growth while maintaining PCI DSS Level 1 compliance.

---

**Document Status:** Draft for Review
**Next Review Date:** Upon completion of critical security remediation
**Distribution:** Internal - Executive Team, Engineering, Compliance

