# Data Impact - Women's Day Website 🌸

A lightweight, attractive, and fun static website celebrating International Women's Day, hosted on Google Cloud Platform (GCP).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [GCP Setup](#gcp-setup)
- [GitHub Actions Setup](#github-actions-setup)
- [Deployment](#deployment)
- [Terraform Infrastructure](#terraform-infrastructure)
- [Docker Container](#docker-container)
- [Troubleshooting](#troubleshooting)
- [Cost Considerations](#cost-considerations)

## 🎯 Overview

This project demonstrates deploying a static website to GCP Cloud Run using:
- **Vanilla HTML5, CSS, and JavaScript** for the website
- **Docker** for containerization
- **Terraform** for infrastructure as code
- **GitHub Actions** for CI/CD pipelines

Target audience: BrSE, Comtor, and Sales teams at Data Impact.

## ✨ Features

- 🎨 Modern, responsive design
- 🌺 Interactive flower animations
- 💝 Random appreciation message generator
- 🎉 Confetti effects
- 📱 Mobile-friendly
- ⚡ Lightweight and fast
- 🔒 HTTPS enabled by default (via Cloud Run)

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Web Server**: Nginx (Alpine)
- **Container**: Docker
- **Infrastructure**: Terraform
- **Cloud Platform**: Google Cloud Platform (Cloud Run, Artifact Registry)
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
CloudDemo/
├── index.html                         # Main HTML file
├── style.css                          # Stylesheet
├── script.js                          # JavaScript functionality
├── Dockerfile                         # Docker configuration
├── README.md                          # This file
├── GITHUB_ACTIONS_SETUP.md           # 📖 Application deployment guide
├── TERRAFORM_AUTOMATION.md           # 📖 Infrastructure automation guide
├── terraform/                         # Terraform configurations
│   ├── main.tf                       # Main infrastructure
│   ├── backend.tf                    # State backend configuration
│   ├── variables.tf                  # Variable definitions
│   ├── outputs.tf                    # Output values
│   └── terraform.tfvars.example      # Example variables
└── .github/
    └── workflows/                     # GitHub Actions workflows
        ├── terraform.yml             # Infrastructure deployment
        └── deploy.yml                # Application deployment
```

## 📋 Prerequisites

### Required Tools

1. **Google Cloud Platform Account**
   - Active GCP project
   - Billing enabled

2. **Local Development Tools**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local testing)
   - [Terraform](https://www.terraform.io/downloads) >= 1.0
   - [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
   - Git

3. **GitHub**
   - GitHub account
   - Repository for this project

### Required GCP APIs

The following APIs will be enabled automatically by Terraform:
- Cloud Run API
- Artifact Registry API
- IAM API
- IAM Credentials API

## 🚀 Local Development

### Run Locally with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t womens-day-website .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:8080 womens-day-website
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

### Run Locally without Docker

Simply open `index.html` in your web browser, or use a simple HTTP server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080
```

## ☁️ GCP Setup

### 1. Create a GCP Project

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID**

### 2. Enable Billing

Ensure billing is enabled for your project.

### 3. Authenticate with gcloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Note: With Workload Identity Federation, you **don't need to manually create service accounts or keys**. Terraform will handle this automatically.

### 4. Set Up Terraform Backend (Optional)

For production, use GCS for Terraform state:

```bash
# Create a bucket for Terraform state
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://YOUR_PROJECT_ID-terraform-state

# Enable versioning
gsutil versioning set on gs://YOUR_PROJECT_ID-terraform-state
```

Update `terraform/main.tf` to uncomment the backend configuration.

## 🔧 GitHub Actions Setup

### Fully Automated CI/CD with Workload Identity Federation (No Keys Required!)

This project uses **Workload Identity Federation** for secure, keyless authentication to GCP from GitHub Actions.

**📖 Detailed Guides:**
- **[TERRAFORM_AUTOMATION.md](TERRAFORM_AUTOMATION.md)** - Automate infrastructure deployment with Terraform
- **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)** - Automate application deployment

### Quick Overview

1. **Update Terraform variables** with your GCP project and GitHub repository details
2. **Bootstrap and apply Terraform** to create infrastructure and Workload Identity Federation
3. **Configure GitHub secrets** with the output values from Terraform
4. **Push to GitHub** and watch everything deploy automatically

### Two Automated Workflows

#### 1. Infrastructure Workflow (`.github/workflows/terraform.yml`)
- **On Pull Request**: Runs `terraform plan` and comments the plan
- **On Push to main**: Runs `terraform apply` to update infrastructure
- **Manual**: Run plan, apply, or destroy on-demand

#### 2. Application Workflow (`.github/workflows/deploy.yml`)
- **On Push to main**: Builds Docker image, pushes to Artifact Registry, deploys to Cloud Run
- **Manual**: Deploy on-demand

### Benefits of Workload Identity Federation

✅ **No service account keys** - More secure  
✅ **Short-lived tokens** - Automatically expire  
✅ **Audit logging** - All actions tracked in GCP  
✅ **Repository-scoped** - Only your specific repo can authenticate  
✅ **Full automation** - Infrastructure and application deployment

## 🚀 Deployment

### Method 1: Fully Automated Deployment via GitHub Actions (Recommended)

**📖 See [TERRAFORM_AUTOMATION.md](TERRAFORM_AUTOMATION.md) for complete step-by-step instructions.**

#### Quick Start

1. **Bootstrap Terraform state** (one-time local setup):
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   terraform init
   terraform apply -target=google_storage_bucket.terraform_state
   # Follow migration steps in TERRAFORM_AUTOMATION.md
   terraform apply
   ```

2. **Configure GitHub secrets** (see TERRAFORM_AUTOMATION.md for details):
   - `GCP_PROJECT_ID`
   - `GCP_REGION`
   - `CLOUD_RUN_SERVICE_NAME`
   - `ARTIFACT_REGISTRY_NAME`
   - `WIF_PROVIDER` (from terraform output)
   - `WIF_SERVICE_ACCOUNT` (from terraform output)

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial deployment with automation"
   git push origin main
   ```

#### How It Works

- **Infrastructure Changes** (files in `terraform/`):
  - Pull requests: Automatically run `terraform plan` and comment results
  - Push to main: Automatically run `terraform apply`
  
- **Application Changes** (HTML/CSS/JS files):
  - Push to main: Automatically build, push Docker image, and deploy to Cloud Run

#### Subsequent Deployments

Simply push to `main` or create pull requests:
- Changes to `terraform/**` trigger infrastructure deployment
- Changes to website files trigger application deployment

### Method 2: Manual Deployment

#### Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Review plan
terraform plan

# Apply infrastructure
terraform apply

# Note the outputs
terraform output
```

#### Build and Push Docker Image

```bash
# Authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Set variables
PROJECT_ID="your-project-id"
REGION="us-central1"
REGISTRY="data-impact-images"
IMAGE="womens-day-website"

# Build image
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$IMAGE:latest .

# Push image
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$IMAGE:latest
```

#### Deploy to Cloud Run

```bash
gcloud run deploy data-impact-website \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$IMAGE:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=256Mi \
  --cpu=1
```

## 🏗 Terraform Infrastructure

### Resources Created

- **Artifact Registry Repository**: Stores Docker images
- **Cloud Run Service**: Hosts the containerized website
- **IAM Policy**: Allows public access to the website

### Terraform Commands

```bash
# Initialize
terraform init

# Format code
terraform fmt

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show outputs
terraform output

# Destroy infrastructure
terraform destroy
```

## 🐳 Docker Container

### Build Options

```bash
# Standard build
docker build -t womens-day-website .

# Build with tag
docker build -t womens-day-website:v1.0 .

# Build with no cache
docker build --no-cache -t womens-day-website .
```

### Test Container Locally

```bash
# Run container
docker run -d -p 8080:8080 --name website womens-day-website

# Check logs
docker logs website

# Stop container
docker stop website

# Remove container
docker rm website
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error**: `Error: google: could not find default credentials`

**Solution**:
```bash
gcloud auth application-default login
```

#### 2. API Not Enabled

**Error**: `Error 403: Cloud Run API has not been used`

**Solution**:
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### 3. Permission Denied

**Error**: `Permission denied on resource project`

**Solution**: Ensure service account has required roles:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/run.admin"
```

#### 4. Docker Build Fails

**Error**: `Cannot connect to Docker daemon`

**Solution**: Ensure Docker Desktop is running

#### 5. Cloud Run Deployment Fails

**Error**: `ERROR: (gcloud.run.deploy) Image not found`

**Solution**: Verify image exists in Artifact Registry:
```bash
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/REGISTRY_NAME
```

### Debugging Commands

```bash
# Check Cloud Run service
gcloud run services describe data-impact-website --region=us-central1

# View Cloud Run logs
gcloud run services logs read data-impact-website --region=us-central1

# List images in Artifact Registry
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/data-impact-images

# Test website locally
curl -I http://localhost:8080
```

## 💰 Cost Considerations

### Estimated Monthly Costs

**Cloud Run** (with minimal traffic):
- Free tier: 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds
- **Cost**: $0-5/month for low traffic

**Artifact Registry**:
- 0.5 GB free storage
- **Cost**: ~$0.10/GB/month after free tier

**Total Estimated Cost**: $0-10/month for demonstration purposes

### Cost Optimization Tips

1. Set `--min-instances=0` (already configured) to scale to zero
2. Use appropriate memory limits (256Mi is sufficient)
3. Delete old Docker images regularly
4. Use Terraform destroy when not needed:
   ```bash
   terraform destroy
   ```

## 📝 Additional Notes

### Updating the Website

1. Modify `index.html`, `style.css`, or `script.js`
2. Commit and push to `main` branch
3. GitHub Actions automatically builds and deploys

### Custom Domain

To use a custom domain:

1. Verify domain ownership in GCP
2. Map domain to Cloud Run service:
   ```bash
   gcloud run domain-mappings create --service=data-impact-website --domain=yourdomain.com --region=us-central1
   ```

### Security Best Practices

- ✅ Never commit `terraform.tfvars` or service account keys
- ✅ Use GitHub Secrets for sensitive data
- ✅ Regularly rotate service account keys
- ✅ Review IAM permissions periodically
- ✅ Enable VPC if needed for production

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review GCP documentation: https://cloud.google.com/run/docs
3. Check GitHub Actions logs in the Actions tab

## 🎉 Acknowledgments

Built with ❤️ by Data Impact team for International Women's Day 2026

---

**Happy Women's Day! 🌸**
