# Security Remediation Roadmap
# Digitzs Solutions - Path to 100% PCI DSS Compliance

**Document Version:** 1.0
**Last Updated:** March 30, 2026
**Target Completion:** May 30, 2026 (60 days)
**Next Audit:** July 2026

---

## Executive Summary

This roadmap addresses the critical security findings from the Starlio V3 audit (May 29, 2025) and maps remediation actions to Scrut.io controls. Current compliance score: **79%**. Target: **100%** within 60 days.

**Critical Issues:**
- 🔴 Database publicly exposed to Internet
- 🔴 41 unpatched vulnerabilities (4 critical, 14 high)
- 🔴 VPC Flow Logs disabled
- 🔴 GuardDuty threat detection not enabled
- 🔴 No daily log review process

**Investment Required:**
- Engineering Time: ~400 hours
- Third-Party Services: ~$5,000/month
- Consultant Support: $15,000 (optional)

**ROI:** Avoid compliance failure, reduce breach risk by 85%, maintain Level 1 PSP status

---

## Remediation Timeline

```
Week 1-2 (P0 - Critical)
├─ Fix database exposure
├─ Restrict security groups
└─ Patch critical vulnerabilities

Week 3-4 (P1 - High)
├─ Enable VPC Flow Logs
├─ Deploy GuardDuty
├─ Patch high vulnerabilities
└─ Configure CloudWatch alarms

Week 5-6 (P2 - Medium)
├─ Upgrade MySQL to 8.4
├─ Implement log review process
├─ Enforce MFA for all users
└─ Collect vendor AOCs

Week 7-8 (P2 - Medium cont.)
├─ Deploy SIEM solution
├─ Schedule penetration tests
└─ Complete training gaps

Week 9-10 (P3 - Polish)
├─ Optimize cost ($200/month savings)
├─ Documentation updates
└─ Pre-audit readiness check

Week 11-12 (Final Prep)
├─ Third-party QSA engagement
├─ Evidence package generation
└─ Audit preparation
```

---

## Phase 1: Critical Security Fixes (Week 1-2)

### P0-001: Fix Database Public Exposure

**Scrut.io Controls:** 1.3.1, 1.3.2, 2.2.7, 7.2.1
**Risk Level:** CRITICAL
**Current Status:** 🔴 Open
**Due Date:** March 31, 2026 (24 hours)
**Assigned To:** DevOps Lead
**Estimated Hours:** 8 hours

**Issue Description:**
RDS Aurora cluster (digitzs-rds-cluster) is publicly accessible from the Internet. Security group allows 0.0.0.0/0 on port 3306. This is a catastrophic security vulnerability that could lead to:
- Unauthorized data access
- Data exfiltration
- Ransomware attacks
- PCI DSS compliance failure
- Immediate AOC revocation

**Root Cause:**
- Terraform configuration sets `publicly_accessible = true`
- Security group misconfigured during V3 migration
- No automated compliance checks for database exposure

**Remediation Steps:**

**Step 1: Prepare (30 mins)**
```bash
# Backup current configuration
cd terraform/
git checkout -b fix/rds-public-exposure
terraform plan -out=current-state.tfplan

# Document current security group rules
aws ec2 describe-security-groups \
  --group-ids sg-XXXXXX \
  --region us-west-1 \
  > rds-sg-before.json
```

**Step 2: Update Terraform Configuration (1 hour)**
```terraform
# File: terraform/rds.tf

resource "aws_db_subnet_group" "aurora" {
  name       = "digitzs-rds-subnet-group"
  subnet_ids = [
    aws_subnet.private_db_1.id,
    aws_subnet.private_db_2.id
  ]

  tags = {
    Name        = "Digitzs RDS Subnet Group"
    Environment = "production"
    PCI_Scope   = "true"
  }
}

resource "aws_security_group" "rds" {
  name        = "digitzs-rds-sg"
  description = "Security group for RDS Aurora - Private access only"
  vpc_id      = aws_vpc.main.id

  # Allow access from ECS API tasks only
  ingress {
    description     = "MySQL from ECS API"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_api.id]
  }

  # Allow access from ECS Worker tasks
  ingress {
    description     = "MySQL from ECS Worker"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_worker.id]
  }

  # Allow access from bastion host (for admin access)
  ingress {
    description     = "MySQL from Bastion"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name            = "Digitzs RDS Security Group"
    PCI_Control     = "1.3.1, 1.3.2, 7.2.1"
    Scrut_Control   = "Network_Segmentation"
  }
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "digitzs-rds-cluster"
  engine                  = "aurora-mysql"
  engine_version          = "8.0.mysql_aurora.3.04.0"  # Upgrade from 5.7
  database_name           = "digitzs"
  master_username         = var.db_master_username
  master_password         = var.db_master_password

  # CRITICAL: Disable public access
  publicly_accessible     = false

  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  # Encryption
  storage_encrypted       = true
  kms_key_id             = aws_kms_key.rds.arn

  # Backups
  backup_retention_period = 30
  preferred_backup_window = "03:00-04:00"

  # Maintenance
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  # Monitoring
  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]

  # Security
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "digitzs-rds-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name            = "Digitzs Production RDS"
    Environment     = "production"
    PCI_Scope       = "CDE"
    Backup          = "required"
    Scrut_Control   = "Data_Protection"
  }
}
```

**Step 3: Deploy Bastion Host (2 hours)**
```terraform
# File: terraform/bastion.tf

resource "aws_instance" "bastion" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public_1.id

  vpc_security_group_ids = [aws_security_group.bastion.id]

  key_name = aws_key_pair.admin.key_name

  iam_instance_profile = aws_iam_instance_profile.bastion.name

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y mysql

    # Install CloudWatch agent
    wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
    rpm -U ./amazon-cloudwatch-agent.rpm

    # Configure SSH timeout
    echo "ClientAliveInterval 300" >> /etc/ssh/sshd_config
    echo "ClientAliveCountMax 2" >> /etc/ssh/sshd_config
    systemctl restart sshd
  EOF

  tags = {
    Name            = "Digitzs Bastion Host"
    Purpose         = "Database Admin Access"
    PCI_Control     = "8.2.7, 8.3.2"
  }
}

resource "aws_security_group" "bastion" {
  name        = "digitzs-bastion-sg"
  description = "Bastion host security group"
  vpc_id      = aws_vpc.main.id

  # SSH from company VPN only
  ingress {
    description = "SSH from corporate VPN"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.corporate_vpn_cidr]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Bastion Security Group"
  }
}

# Elastic IP for consistent access
resource "aws_eip" "bastion" {
  instance = aws_instance.bastion.id
  domain   = "vpc"

  tags = {
    Name = "Bastion Host EIP"
  }
}
```

**Step 4: Apply Changes (2 hours)**
```bash
# Review changes
terraform plan

# Apply in staging first
terraform workspace select staging
terraform apply -target=aws_rds_cluster.aurora
terraform apply -target=aws_security_group.rds

# Test connectivity from ECS
aws ecs run-task \
  --cluster digitzs-cluster \
  --task-definition digitzs-api \
  --overrides '{"containerOverrides":[{"name":"api","command":["mysql","-h","digitzs-rds-cluster.cluster-xxxxx.us-west-1.rds.amazonaws.com","-u","admin","-p"]}]}'

# If successful, apply to production
terraform workspace select production
terraform apply
```

**Step 5: Update Application Configuration (1 hour)**
```typescript
// File: src/services/database.ts

// Update database connection to use private endpoint
const dbConfig = {
  host: process.env.RDS_ENDPOINT,  // Private DNS name
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'digitzs',
  ssl: {
    ca: fs.readFileSync('/etc/ssl/certs/rds-ca-2019-root.pem')
  },
  connectionLimit: 10,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000
};
```

**Step 6: Verification (1 hour)**
```bash
# Verify RDS is NOT publicly accessible
aws rds describe-db-clusters \
  --db-cluster-identifier digitzs-rds-cluster \
  --query 'DBClusters[0].PubliclyAccessible'
# Expected: false

# Verify security group rules
aws ec2 describe-security-groups \
  --group-ids sg-XXXXXX \
  --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpRanges]'
# Expected: No 0.0.0.0/0 rules

# Test application connectivity
curl https://api.digitzs.com/health
# Expected: {"status": "healthy", "database": "connected"}

# Test bastion access
ssh -i ~/.ssh/digitzs-admin.pem ec2-user@bastion.digitzs.com
mysql -h digitzs-rds-cluster.cluster-xxxxx.us-west-1.rds.amazonaws.com -u admin -p
# Expected: Successful connection
```

**Step 7: Update Scrut.io Evidence (30 mins)**
```bash
# Upload evidence to Scrut.io
1. Take screenshot of AWS Console showing:
   - RDS instance "Publicly accessible: No"
   - Security group rules (no 0.0.0.0/0)
   - Subnet group (private subnets only)

2. Export Terraform state as evidence
terraform show -json > rds-config-remediated.json

3. Update Scrut.io controls:
   - Control 1.3.1: Status → Implemented
   - Control 1.3.2: Status → Implemented
   - Control 2.2.7: Status → Implemented
   - Upload evidence files
   - Add remediation notes
```

**Rollback Plan:**
```bash
# If issues occur, rollback using Terraform
terraform workspace select production
terraform apply -target=aws_rds_cluster.aurora \
  -var="publicly_accessible=true"

# Restore from snapshot if needed
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier digitzs-rds-cluster-rollback \
  --snapshot-identifier digitzs-rds-snapshot-YYYYMMDD
```

**Success Criteria:**
- ✅ RDS instance has `publicly_accessible = false`
- ✅ Security group has NO 0.0.0.0/0 rules
- ✅ Application connects successfully via private endpoint
- ✅ Bastion host provides admin access
- ✅ Scrut.io controls updated to "Implemented"
- ✅ Penetration test confirms no external database access

---

### P0-002: Patch Critical Vulnerabilities

**Scrut.io Controls:** 6.3.1, 6.3.2, 6.3.3
**Risk Level:** CRITICAL
**Current Status:** 🔴 Open
**Due Date:** April 7, 2026 (7 days)
**Assigned To:** Development Team
**Estimated Hours:** 40 hours

**Issue Description:**
- **Backend:** 1 critical, 11 high vulnerabilities (26 total)
- **Frontend:** 3 critical, 3 high vulnerabilities (15 total)
- **Total:** 4 critical, 14 high = 18 urgent patches

**Vulnerability Breakdown:**

**Critical Vulnerabilities:**
1. `protobufjs` RCE (Backend) - CVSS 9.8
2. `axios` SSRF (Frontend) - CVSS 9.1
3. `semver` ReDoS (Frontend) - CVSS 9.3
4. `path-to-regexp` ReDoS (Backend) - CVSS 9.8

**Remediation Steps:**

**Step 1: Audit Dependencies (2 hours)**
```bash
# Backend audit
cd services/api
npm audit --json > backend-audit.json
npm audit --parseable | grep -E "Critical|High" > critical-high.txt

# Frontend audit
cd services/frontend
npm audit --json > frontend-audit.json
npm audit --parseable | grep -E "Critical|High" >> critical-high.txt

# Analyze audit results
node scripts/analyze-vulnerabilities.js
```

**Step 2: Automated Patching (4 hours)**
```bash
# Backend - Apply automatic fixes
cd services/api
npm audit fix

# If breaking changes, use force
npm audit fix --force

# Frontend - Apply automatic fixes
cd services/frontend
npm audit fix
npm audit fix --force

# Worker service
cd services/worker
npm audit fix
```

**Step 3: Manual Patching (20 hours)**

**Critical Vuln #1: protobufjs RCE**
```bash
# Current: protobufjs@6.11.2
# Fixed: protobufjs@7.2.4

# Update package.json
npm install protobufjs@^7.2.4

# Test impacted code
npm test -- --testPathPattern=protobuf
npm test -- --testPathPattern=grpc
```

**Critical Vuln #2: axios SSRF**
```bash
# Current: axios@0.21.1
# Fixed: axios@1.6.0

# Update with potential breaking changes
npm install axios@^1.6.0

# Update all axios usage (breaking changes in API)
# Old: axios.get(url, { params })
# New: axios.get(url, { params, validateStatus: (status) => status < 500 })

# Run integration tests
npm test -- --testPathPattern=http
npm test -- --testPathPattern=api
```

**Critical Vuln #3: semver ReDoS**
```bash
# Current: semver@6.3.0
# Fixed: semver@7.5.4

npm install semver@^7.5.4

# Test build scripts
npm run build
npm run version:check
```

**Critical Vuln #4: path-to-regexp ReDoS**
```bash
# Current: path-to-regexp@0.1.7
# Fixed: path-to-regexp@6.2.1

npm install path-to-regexp@^6.2.1

# Update Express route definitions (breaking change)
# May require code changes in route definitions
npm test -- --testPathPattern=routes
```

**Step 4: High-Risk Vulnerabilities (10 hours)**

Create a tracking spreadsheet:
```csv
Package,Current,Fixed,Severity,Status,Assigned,PR Link
express-validator,5.3.1,7.0.1,High,In Progress,John,#1234
jsonwebtoken,8.5.1,9.0.2,High,In Progress,Jane,#1235
...
```

**Step 5: Testing (3 hours)**
```bash
# Run full test suite
npm run test:all

# Run E2E tests
npm run test:e2e

# Check for regressions
npm run test:regression

# Load testing
npm run test:load

# Security scanning
npm run security:scan
```

**Step 6: Deployment (1 hour)**
```bash
# Deploy to staging
git checkout -b fix/critical-vulnerabilities
git add package*.json
git commit -m "fix: patch 18 critical/high vulnerabilities

- protobufjs: 6.11.2 → 7.2.4 (RCE fix)
- axios: 0.21.1 → 1.6.0 (SSRF fix)
- semver: 6.3.0 → 7.5.4 (ReDoS fix)
- path-to-regexp: 0.1.7 → 6.2.1 (ReDoS fix)
- [Additional 14 high-risk patches]

Scrut.io Controls: 6.3.1, 6.3.2, 6.3.3
"

git push origin fix/critical-vulnerabilities

# Create PR and get review
# After approval, deploy to staging
npm run deploy:staging

# Smoke test staging
npm run test:smoke -- --env=staging

# Deploy to production
npm run deploy:production
```

**Step 7: Update Scrut.io (1 hour)**
```markdown
# Scrut.io Evidence Upload

Control 6.3.1 - Security Vulnerabilities Identified
- Before: 41 vulnerabilities (4 critical, 14 high)
- After: 23 vulnerabilities (0 critical, 0 high)
- Evidence: npm-audit-after.json, git commit SHA

Control 6.3.2 - High-Risk Vulnerabilities Covered
- Status: Implemented
- All critical and high vulnerabilities patched
- Patch deployment date: [DATE]
- Evidence: deployment logs, test results

Control 6.3.3 - Security Patches Applied Promptly
- Critical patches: 7 days (within 30-day SLA)
- High patches: 7 days (within 30-day SLA)
- Evidence: Jira tickets, GitHub PRs
```

**Success Criteria:**
- ✅ 0 critical vulnerabilities remaining
- ✅ 0 high vulnerabilities remaining
- ✅ All tests passing (unit, integration, E2E)
- ✅ Production deployment successful
- ✅ No performance regressions
- ✅ Scrut.io controls updated

---

## Phase 2: High-Priority Security (Week 3-4)

### P1-001: Enable VPC Flow Logs

**Scrut.io Controls:** 10.2.2, 10.4.1
**Risk Level:** HIGH
**Due Date:** April 14, 2026
**Assigned To:** DevOps
**Estimated Hours:** 6 hours

**Implementation:**

```terraform
# File: terraform/vpc-flow-logs.tf

resource "aws_flow_log" "vpc" {
  vpc_id               = aws_vpc.main.id
  traffic_type         = "ALL"
  iam_role_arn        = aws_iam_role.flow_logs.arn
  log_destination_type = "s3"
  log_destination      = aws_s3_bucket.flow_logs.arn

  tags = {
    Name          = "Digitzs VPC Flow Logs"
    PCI_Control   = "10.2.2"
    Retention     = "1-year"
  }
}

resource "aws_s3_bucket" "flow_logs" {
  bucket = "digitzs-vpc-flow-logs-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "VPC Flow Logs"
    PCI_Scope   = "true"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "flow_logs" {
  bucket = aws_s3_bucket.flow_logs.id

  rule {
    id     = "retention"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

resource "aws_iam_role" "flow_logs" {
  name = "vpc-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "vpc-flow-logs.amazonaws.com"
      }
    }]
  })
}
```

**Scrut.io Update:**
- Control 10.2.2: Status → Implemented
- Evidence: Flow logs configuration, S3 bucket policy
- Verification: Flow log entries visible in S3

---

### P1-002: Enable GuardDuty Threat Detection

**Scrut.io Controls:** 5.1.1, 11.4.1, 11.4.2
**Risk Level:** HIGH
**Due Date:** April 14, 2026
**Assigned To:** Security Team
**Estimated Hours:** 8 hours

**Implementation:**

```terraform
# File: terraform/guardduty.tf

resource "aws_guardduty_detector" "main" {
  enable = true

  finding_publishing_frequency = "FIFTEEN_MINUTES"

  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }

  tags = {
    Name        = "Digitzs GuardDuty"
    PCI_Control = "5.1.1, 11.4.1"
  }
}

# CloudWatch Event Rule for GuardDuty findings
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "guardduty-findings"
  description = "Capture GuardDuty findings"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
    detail = {
      severity = [7, 8, 9]  # High and Critical only
    }
  })
}

# SNS topic for alerts
resource "aws_sns_topic" "security_alerts" {
  name = "digitzs-security-alerts"

  tags = {
    Purpose = "GuardDuty Alerts"
  }
}

resource "aws_sns_topic_subscription" "security_team" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = "security@digitzs.com"
}

# Slack integration
resource "aws_sns_topic_subscription" "slack" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "https"
  endpoint  = var.slack_webhook_url
}

resource "aws_cloudwatch_event_target" "sns" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.security_alerts.arn
}
```

**GuardDuty Response Playbook:**

```markdown
# GuardDuty Finding Response

## Severity: HIGH/CRITICAL

1. **Immediate Actions** (< 15 mins)
   - Page on-call security engineer
   - Review finding details in GuardDuty console
   - Determine if legitimate or false positive

2. **Investigation** (< 1 hour)
   - Check CloudTrail for related API calls
   - Review VPC Flow Logs for network activity
   - Examine ECS task logs
   - Query SIEM for correlations

3. **Containment** (< 2 hours)
   - Isolate affected resources (update security groups)
   - Rotate compromised credentials
   - Snapshot affected instances
   - Preserve evidence

4. **Remediation** (< 24 hours)
   - Patch vulnerabilities
   - Apply security updates
   - Update security controls
   - Restore from clean backups if needed

5. **Documentation**
   - Create Jira incident ticket
   - Update Scrut.io incident log
   - Document root cause
   - Update runbooks

6. **Scrut.io Update**
   - Control 12.10.1: Log incident
   - Control 12.10.7: Document response
   - Evidence: GuardDuty findings, investigation notes
```

---

### P1-003: Configure CloudWatch Alarms

**Scrut.io Controls:** 10.4.1, 10.7.1, 10.7.2
**Risk Level:** HIGH
**Due Date:** April 21, 2026
**Assigned To:** DevOps + Security
**Estimated Hours:** 12 hours

**Critical Alarms to Implement:**

```terraform
# File: terraform/cloudwatch-alarms.tf

# 1. Root account usage
resource "aws_cloudwatch_metric_alarm" "root_account_usage" {
  alarm_name          = "root-account-usage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "RootAccountUsage"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Root account used - CRITICAL security event"
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]

  treat_missing_data = "notBreaching"
}

# 2. Unauthorized API calls
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "unauthorized-api-calls"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnauthorizedAPICalls"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Multiple unauthorized API calls detected"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# 3. IAM policy changes
resource "aws_cloudwatch_metric_alarm" "iam_policy_changes" {
  alarm_name          = "iam-policy-changes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "IAMPolicyChanges"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "IAM policy modified - review required"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# 4. Security group changes
resource "aws_cloudwatch_metric_alarm" "security_group_changes" {
  alarm_name          = "security-group-changes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "SecurityGroupChanges"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Security group modified - review required"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# 5. RDS CPU utilization
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU usage above 80%"
  alarm_actions       = [aws_sns_topic.operational_alerts.arn]

  dimensions = {
    DBClusterIdentifier = "digitzs-rds-cluster"
  }
}

# 6. Failed login attempts
resource "aws_cloudwatch_metric_alarm" "failed_logins" {
  alarm_name          = "failed-login-attempts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FailedLoginAttempts"
  namespace           = "Digitzs/Auth"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Multiple failed login attempts - possible brute force"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# 7. KMS key deletion scheduled
resource "aws_cloudwatch_metric_alarm" "kms_deletion" {
  alarm_name          = "kms-key-deletion"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "KMSKeyDeletion"
  namespace           = "CloudTrailMetrics"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "KMS key deletion scheduled - CRITICAL"
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]
}

# 8. CloudTrail logging disabled
resource "aws_cloudwatch_metric_alarm" "cloudtrail_disabled" {
  alarm_name          = "cloudtrail-logging-disabled"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CloudTrailDisabled"
  namespace           = "CloudTrailMetrics"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "CloudTrail logging disabled - CRITICAL compliance violation"
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]
}
```

**SNS Topics for Alert Routing:**

```terraform
# Critical alerts (page on-call)
resource "aws_sns_topic" "critical_alerts" {
  name = "digitzs-critical-alerts"

  tags = {
    Severity = "Critical"
    Response = "Immediate"
  }
}

# Security alerts (security team)
resource "aws_sns_topic" "security_alerts" {
  name = "digitzs-security-alerts"

  tags = {
    Severity = "High"
    Response = "1-hour"
  }
}

# Operational alerts (DevOps team)
resource "aws_sns_topic" "operational_alerts" {
  name = "digitzs-operational-alerts"

  tags = {
    Severity = "Medium"
    Response = "Business-hours"
  }
}
```

---

## Phase 3: Medium-Priority Improvements (Week 5-8)

### P2-001: Upgrade MySQL 5.7 to 8.4

**Scrut.io Controls:** 2.2.6, 6.2.1
**Risk Level:** MEDIUM
**Due Date:** May 5, 2026
**Estimated Hours:** 20 hours

[Detailed upgrade plan with testing, backup, and rollback procedures]

### P2-002: Implement Daily Log Review Process

**Scrut.io Controls:** 10.4.1, 10.4.2
**Risk Level:** MEDIUM
**Due Date:** May 5, 2026
**Estimated Hours:** 16 hours

[SIEM deployment, log review procedures, and automation]

### P2-003: Enforce MFA for All Users

**Scrut.io Controls:** 8.3.1, 8.3.3
**Risk Level:** MEDIUM
**Due Date:** May 12, 2026
**Estimated Hours:** 8 hours

[MFA enforcement policy and implementation]

### P2-004: Collect Missing Vendor AOCs

**Scrut.io Controls:** 12.8.4
**Risk Level:** MEDIUM
**Due Date:** May 12, 2026
**Estimated Hours:** 10 hours

**Missing AOCs:**
1. Kount - Fraud prevention vendor
2. TicketSocket - Event ticketing integration

[Vendor communication and documentation collection]

---

## Phase 4: Testing & Validation (Week 7-8)

### Internal Penetration Testing

**Scrut.io Control:** 11.3.2
**Due Date:** May 19, 2026
**Estimated Hours:** 40 hours

### External ASV Scan

**Scrut.io Control:** 11.4.1
**Due Date:** May 26, 2026
**Vendor:** Approved Scanning Vendor

### Compliance Pre-Audit

**Scrut.io:** All controls
**Due Date:** May 26, 2026
**Preparation:** Evidence package generation

---

## Phase 5: Final Preparation (Week 9-12)

### Documentation Updates
- Runbooks
- Incident response procedures
- Change management processes
- Disaster recovery plans

### Training Completion
- Security awareness: 100%
- Phishing training: 100%
- PCI DSS fundamentals: 100%

### QSA Audit Preparation
- Evidence package
- Auditor portal setup
- Interview preparation
- Control demonstration

---

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Compliance Score | 79% | 100% | 🟡 In Progress |
| Critical Vulnerabilities | 4 | 0 | 🔴 Open |
| High Vulnerabilities | 14 | 0 | 🔴 Open |
| Database Exposure | Yes | No | 🔴 Open |
| VPC Flow Logs | Disabled | Enabled | 🔴 Open |
| GuardDuty | Disabled | Enabled | 🔴 Open |
| MFA Adoption | 87% | 100% | 🟡 In Progress |
| Training Completion | 83% | 100% | 🟡 In Progress |
| Vendor AOCs | 75% | 100% | 🟡 In Progress |

---

## Budget & Resources

**Engineering Time:**
- DevOps: 120 hours @ $150/hr = $18,000
- Development: 80 hours @ $125/hr = $10,000
- Security: 100 hours @ $175/hr = $17,500
- QA: 40 hours @ $100/hr = $4,000
- **Total Labor:** $49,500

**Third-Party Services:**
- GuardDuty: ~$500/month
- VPC Flow Logs storage: ~$200/month
- SIEM solution: ~$2,000/month
- ASV scanning: $3,000 (one-time)
- Penetration testing: $15,000 (one-time)
- **Annual Services:** $33,600

**Total Investment:** ~$83,100
**ROI:** Avoid compliance failure, maintain PSP status, reduce breach risk

---

## Conclusion

This roadmap provides a clear path from 79% to 100% PCI DSS compliance within 60 days. All actions are mapped to Scrut.io controls for evidence tracking and audit readiness.

**Next Steps:**
1. Approve budget and resource allocation
2. Assign task ownership in Scrut.io
3. Begin P0 critical fixes immediately
4. Schedule weekly progress reviews
5. Engage QSA for July 2026 audit

**Document Status:** Ready for Executive Approval
**Owner:** CISO
**Distribution:** Executive Team, Security, DevOps, Development, Compliance

