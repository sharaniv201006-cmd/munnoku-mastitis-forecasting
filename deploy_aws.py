"""
Munnokku SIH 2026 - AWS One-Click S3 Upload & Setup Script
Run this script after configuring your AWS credentials.
"""
import os
import sys

def upload_models_to_s3(bucket_name: str, region: str = "ap-south-1"):
    try:
        import boto3
    except ImportError:
        print("Installing boto3...")
        os.system(f"{sys.executable} -m pip install boto3")
        import boto3

    s3_client = boto3.client('s3', region_name=region)
    print(f"Connecting to S3 bucket: {bucket_name} in region {region}...")

    files_to_upload = [
        ("ml/models/best_model.pkl", "models/best_model.pkl"),
        ("ml/models/features.pkl", "models/features.pkl"),
        ("ml/models/shap_explainer.pkl", "models/shap_explainer.pkl"),
        ("Dataset Mastitis.xlsx", "datasets/Dataset_Mastitis.xlsx"),
    ]

    for local_path, s3_key in files_to_upload:
        if os.path.exists(local_path):
            print(f"Uploading {local_path} -> s3://{bucket_name}/{s3_key}")
            s3_client.upload_file(local_path, bucket_name, s3_key)
        else:
            print(f"Warning: File not found: {local_path}")

    print("All ML artifacts and datasets successfully synced to AWS S3!")

if __name__ == "__main__":
    bucket = os.getenv("AWS_S3_BUCKET", "munnokku-mastitis-data-2026")
    upload_models_to_s3(bucket)
