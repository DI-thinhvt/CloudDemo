variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "data-impact-website"
}

variable "artifact_registry_name" {
  description = "Name of the Artifact Registry repository"
  type        = string
  default     = "data-impact-images"
}

variable "image_name" {
  description = "Docker image name"
  type        = string
  default     = "womens-day-website"
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "github_repository" {
  description = "GitHub repository in the format 'owner/repo'"
  type        = string
}
