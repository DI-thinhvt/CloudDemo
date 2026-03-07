# Terraform State Backend Bootstrap
# This file creates the GCS bucket for storing Terraform state
# 
# USAGE:
# 1. First run: terraform apply -target=google_storage_bucket.terraform_state
# 2. Then uncomment the backend configuration in main.tf
# 3. Run: terraform init -migrate-state
# 4. Confirm the migration

resource "google_storage_bucket" "terraform_state" {
  name          = "${var.project_id}-terraform-state"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  # Lifecycle rules to manage old state versions
  lifecycle_rule {
    condition {
      num_newer_versions = 5
    }
    action {
      type = "Delete"
    }
  }

  # Keep deleted items for 30 days
  lifecycle_rule {
    condition {
      days_since_noncurrent_time = 30
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    purpose = "terraform-state"
    managed = "terraform"
  }
}
