# GitHub Actions Setup Guide

This guide will help you set up GitHub Actions to automatically build and deploy your Docker image to GCP using **Workload Identity Federation** (no service account keys required!).

> 📖 **Looking to automate Terraform infrastructure deployment too?**  
> See [TERRAFORM_AUTOMATION.md](TERRAFORM_AUTOMATION.md) for complete Terraform automation with GitHub Actions.

## Prerequisites

- GCP project with billing enabled
- GitHub repository for your code
- `gcloud` CLI installed and authenticated
- Terraform installed

## Step 1: Update Terraform Variables

1. Copy the example variables file:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` and fill in your values:
   ```hcl
   project_id              = "your-gcp-project-id"
   region                  = "us-central1"
   service_name            = "data-impact-website"
   artifact_registry_name  = "data-impact-images"
   image_name              = "womens-day-website"
   image_tag               = "latest"
   github_repository       = "your-github-username/your-repo-name"  # e.g., "octocat/my-repo"
   ```

## Step 2: Apply Terraform Configuration

Run Terraform to create all infrastructure including Workload Identity Federation:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

After successful apply, note the following outputs:
- `workload_identity_provider` - You'll need this for GitHub secrets
- `service_account_email` - You'll need this for GitHub secrets
- `cloud_run_url` - Your deployed application URL

## Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

### Navigate to: Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | How to get it |
|------------|-------|---------------|
| `GCP_PROJECT_ID` | Your GCP project ID | From `terraform.tfvars` |
| `GCP_REGION` | Your GCP region | From `terraform.tfvars` (e.g., `us-central1`) |
| `CLOUD_RUN_SERVICE_NAME` | Your Cloud Run service name | From `terraform.tfvars` (e.g., `data-impact-website`) |
| `ARTIFACT_REGISTRY_NAME` | Your Artifact Registry name | From `terraform.tfvars` (e.g., `data-impact-images`) |
| `WIF_PROVIDER` | Workload Identity Provider | From `terraform output workload_identity_provider` |
| `WIF_SERVICE_ACCOUNT` | Service account email | From `terraform output service_account_email` |

### Getting the Terraform outputs:

```bash
cd terraform
terraform output workload_identity_provider
terraform output service_account_email
```

## Step 4: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit with CI/CD setup"
   ```

2. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Step 5: Verify Deployment

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. You should see the workflow running
4. Once completed, visit the Cloud Run URL from the terraform output

## How It Works

### Workload Identity Federation (No Keys!)

Instead of using service account keys, GitHub Actions authenticates to GCP using:

1. **GitHub generates an OIDC token** for your workflow
2. **GCP verifies the token** against the Workload Identity Pool
3. **GitHub Actions impersonates the service account** temporarily
4. **No long-lived credentials** are stored anywhere

### Workflow Triggers

The workflow runs on:
- Every push to the `main` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

### What the Workflow Does

1. ✅ Checks out your code
2. ✅ Authenticates to GCP (keyless)
3. ✅ Builds Docker image
4. ✅ Pushes image to Artifact Registry
5. ✅ Deploys to Cloud Run
6. ✅ Shows deployment URL

## Troubleshooting

### Error: "Permission denied on Artifact Registry"

Check that the service account has the `artifactregistry.writer` role:
```bash
gcloud artifacts repositories get-iam-policy data-impact-images --location=us-central1
```

### Error: "Workload Identity Pool not found"

Ensure the IAM API is enabled:
```bash
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com
```

### Error: "Repository not allowed"

Verify the `github_repository` variable in `terraform.tfvars` matches your GitHub repository exactly (format: `owner/repo`).

### Workflow doesn't trigger

1. Ensure the workflow file is in `.github/workflows/` directory
2. Check that you've pushed to the `main` branch
3. Verify GitHub Actions is enabled in your repository settings

## Local Development

To test the Docker image locally:

```bash
docker build -t womens-day-website:local .
docker run -p 8080:8080 womens-day-website:local
```

Visit: http://localhost:8080

## Security Best Practices

✅ **Using Workload Identity Federation** - No service account keys
✅ **Least privilege** - Service account has only required permissions
✅ **Repository-scoped** - Only your specific GitHub repo can authenticate
✅ **Short-lived tokens** - Authentication tokens expire automatically
✅ **Audit logs** - All actions are logged in GCP

## Additional Resources

- [Workload Identity Federation for GitHub Actions](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
