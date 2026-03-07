# Terraform GitHub Actions Automation Guide

This guide explains how to automate your Terraform infrastructure deployment using GitHub Actions with Workload Identity Federation.

## Overview

With this setup, your infrastructure is fully automated:
- **Pull Requests**: Automatically runs `terraform plan` and comments the results
- **Push to main**: Automatically runs `terraform apply` to update infrastructure
- **Manual triggers**: Run plan, apply, or destroy on-demand

## Architecture

```
GitHub Actions (OIDC) 
    ↓
Workload Identity Pool
    ↓
Service Account (with Terraform permissions)
    ↓
GCP Resources (Cloud Run, Artifact Registry, etc.)
```

## Prerequisites

Before starting, ensure you have:
- [x] GCP project with billing enabled
- [x] `gcloud` CLI authenticated locally
- [x] Terraform installed locally
- [x] GitHub repository created

## Step 1: Bootstrap Process

### 1.1 Configure Local Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
project_id              = "your-gcp-project-id"
region                  = "us-central1"
service_name            = "data-impact-website"
artifact_registry_name  = "data-impact-images"
image_name              = "womens-day-website"
image_tag               = "latest"
github_repository       = "your-username/your-repo"  # CRITICAL: Must match exactly!
```

### 1.2 Initialize and Create State Bucket

```bash
# Initialize Terraform
terraform init

# Create only the state bucket first
terraform apply -target=google_storage_bucket.terraform_state

# Note the bucket name from output
```

### 1.3 Migrate to Remote State

1. Edit `main.tf` and uncomment the backend block:

```hcl
backend "gcs" {
  bucket = "your-project-id-terraform-state"  # Use your actual project ID
  prefix = "terraform/state"
}
```

2. Migrate the state:

```bash
terraform init -migrate-state
```

3. When prompted, type "yes" to migrate

4. Verify migration:

```bash
# Check that state is now in GCS
gsutil ls gs://your-project-id-terraform-state/terraform/state/

# You can now delete local state file
rm terraform.tfstate terraform.tfstate.backup
```

### 1.4 Apply Full Infrastructure

```bash
# Apply all remaining resources
terraform apply
```

**IMPORTANT**: Note these outputs - you'll need them for GitHub secrets:

```bash
terraform output workload_identity_provider
terraform output service_account_email
```

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `my-project-123` |
| `GCP_REGION` | Your GCP region | `us-central1` |
| `CLOUD_RUN_SERVICE_NAME` | Cloud Run service name | `data-impact-website` |
| `ARTIFACT_REGISTRY_NAME` | Artifact Registry name | `data-impact-images` |
| `WIF_PROVIDER` | Workload Identity Provider (from terraform output) | `projects/123.../providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | Service account email (from terraform output) | `github-actions-sa@project.iam.gserviceaccount.com` |

### Getting Terraform Outputs

```bash
cd terraform

# Get Workload Identity Provider
terraform output -raw workload_identity_provider

# Get Service Account Email
terraform output -raw service_account_email
```

## Step 3: Push to GitHub

```bash
# From project root
git add .
git commit -m "Add Terraform automation with GitHub Actions"
git push origin main
```

## Step 4: Verify Workflows

### Terraform Workflow

The Terraform workflow automatically:

1. **On Pull Request**:
   - Runs `terraform fmt` check
   - Runs `terraform validate`
   - Runs `terraform plan`
   - Comments the plan on the PR

2. **On Push to main**:
   - Runs all checks
   - Runs `terraform plan`
   - Runs `terraform apply` (auto-approved)
   - Shows outputs

3. **Manual Dispatch**:
   - Choose action: plan, apply, or destroy
   - Runs selected action

### Application Deployment Workflow

After infrastructure is ready, the deployment workflow:
- Builds Docker image
- Pushes to Artifact Registry
- Deploys to Cloud Run

## Workflow Files

### `.github/workflows/terraform.yml`
Manages infrastructure deployment

### `.github/workflows/deploy.yml`
Manages application deployment

## Usage Examples

### Making Infrastructure Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/update-infrastructure
   ```

2. Modify Terraform files (e.g., increase Cloud Run memory)

3. Commit and push:
   ```bash
   git add terraform/
   git commit -m "Increase Cloud Run memory to 512Mi"
   git push origin feature/update-infrastructure
   ```

4. Create a Pull Request on GitHub

5. GitHub Actions will automatically:
   - Run `terraform plan`
   - Comment the plan on your PR

6. Review the plan in the PR comment

7. Merge the PR:
   - GitHub Actions automatically runs `terraform apply`
   - Infrastructure is updated

### Manual Terraform Operations

Go to GitHub: **Actions → Terraform Infrastructure → Run workflow**

Select action:
- **plan**: See what changes would be made
- **apply**: Apply changes manually
- **destroy**: Destroy all infrastructure (⚠️ use with caution!)

### Deploying Application Changes

1. Modify website files (`index.html`, `style.css`, `script.js`)

2. Push to main:
   ```bash
   git add .
   git commit -m "Update website content"
   git push origin main
   ```

3. GitHub Actions automatically:
   - Builds new Docker image
   - Pushes to Artifact Registry
   - Deploys to Cloud Run

## Understanding Permissions

The GitHub Actions service account has these roles for Terraform automation:

| Role | Purpose |
|------|---------|
| `roles/iam.serviceAccountAdmin` | Create and manage service accounts |
| `roles/iam.securityAdmin` | Manage IAM policies and bindings |
| `roles/serviceusage.serviceUsageAdmin` | Enable/disable GCP APIs |
| `roles/run.admin` | Manage Cloud Run services |
| `roles/artifactregistry.admin` | Manage Artifact Registry repositories |
| `roles/storage.admin` | Manage GCS buckets (for Terraform state) |

These are **project-level** roles that allow full infrastructure management via Terraform.

## Security Best Practices

✅ **Workload Identity Federation**: No service account keys stored anywhere  
✅ **Short-lived tokens**: Authentication tokens expire automatically  
✅ **Repository-scoped**: Only your specific GitHub repo can authenticate  
✅ **Branch protection**: Require PR reviews before merging to main  
✅ **State encryption**: GCS encrypts Terraform state at rest  
✅ **State versioning**: Previous state versions kept for rollback  
✅ **Audit logging**: All actions logged in GCP Cloud Audit Logs  

## Troubleshooting

### Error: "Backend configuration changed"

```bash
# Re-initialize Terraform
terraform init -reconfigure
```

### Error: "Error acquiring the state lock"

Someone else is running Terraform. Wait for them to finish, or if the lock is stale:

```bash
# Force unlock (use with caution!)
terraform force-unlock LOCK_ID
```

### Error: "Permission denied" in GitHub Actions

1. Verify GitHub secrets are set correctly
2. Check service account has required roles:
   ```bash
   gcloud projects get-iam-policy PROJECT_ID \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:github-actions-sa@*"
   ```

### Error: "Repository not allowed to authenticate"

The `github_repository` variable must match your GitHub repo exactly:
- Format: `owner/repo-name`
- Example: `dataimpact/womens-day-website`

Check your `terraform.tfvars`:
```hcl
github_repository = "your-github-username/your-repo-name"
```

### Workflow doesn't trigger

1. Check workflow files are in `.github/workflows/`
2. Verify GitHub Actions is enabled: **Settings → Actions → General**
3. Check branch name is `main` (not `master`)
4. For Terraform workflow, ensure you modified files in `terraform/` directory

### State file conflicts

If you get state conflicts:

```bash
# Pull latest state
terraform init

# If needed, refresh state
terraform refresh

# Resolve conflicts
terraform plan
```

## Advanced Configuration

### Custom Terraform Variables

Add more variables to `terraform.tfvars` and reference them in `variables.tf`:

```hcl
# variables.tf
variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
  default     = 0
}

# terraform.tfvars
min_instances = 1
```

### Multi-Environment Setup

Create separate workspaces or directories:

```bash
terraform/
  ├── environments/
  │   ├── dev/
  │   ├── staging/
  │   └── prod/
  └── modules/
      └── cloud-run/
```

### State Locking

GCS automatically provides state locking. No additional configuration needed!

### Terraform Cloud Integration

To use Terraform Cloud instead of GCS:

1. Create workspace in Terraform Cloud
2. Update backend in `main.tf`:

```hcl
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "womens-day-website"
    }
  }
}
```

## Monitoring and Observability

### View Terraform Apply History

**GitHub**: Actions tab → Select workflow run → View logs

**GCP**: Cloud Logging → Filter by service account

### View Infrastructure Changes

```bash
# Show current state
terraform show

# Show specific resource
terraform state show google_cloud_run_service.website

# List all resources
terraform state list
```

### Rollback Infrastructure

1. Find previous successful workflow run
2. Re-run that workflow
3. Or manually checkout old commit and apply

## Cost Optimization

The automated workflows use:
- **GitHub Actions**: 2,000 free minutes/month for public repos
- **Cloud Run**: Pay per request (very cheap for low traffic)
- **Artifact Registry**: $0.10/GB/month storage
- **GCS**: $0.020/GB/month (state file is tiny)

**Estimated monthly cost**: < $5 for low-traffic websites

## Next Steps

1. ✅ Set up branch protection rules
2. ✅ Require PR reviews for infrastructure changes
3. ✅ Add Terraform fmt check to pre-commit hooks
4. ✅ Monitor Cloud Run metrics
5. ✅ Set up alerting for failed deployments

## Additional Resources

- [Terraform GCS Backend Documentation](https://www.terraform.io/docs/backends/types/gcs.html)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Workload Identity Federation Best Practices](https://cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Cloud Run IAM Roles](https://cloud.google.com/run/docs/reference/iam/roles)
