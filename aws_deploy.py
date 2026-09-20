import os
import sys
import time
import json

def get_aws_client(service_name, region="ap-south-1"):
    import boto3
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")

    if not access_key or not secret_key:
        print("\n--- AWS Credentials Setup ---")
        print("Please enter your AWS IAM Access Key & Secret Key.")
        print("(You can generate these in AWS Console -> IAM -> Security Credentials -> Create Access Key)")
        access_key = input("AWS Access Key ID: ").strip()
        secret_key = input("AWS Secret Access Key: ").strip()
        region_input = input(f"AWS Region (default: {region}): ").strip()
        if region_input:
            region = region_input

        os.environ["AWS_ACCESS_KEY_ID"] = access_key
        os.environ["AWS_SECRET_ACCESS_KEY"] = secret_key
        os.environ["AWS_DEFAULT_REGION"] = region

    client_kwargs = {
        "region_name": region,
        "aws_access_key_id": access_key,
        "aws_secret_access_key": secret_key,
    }
    if session_token:
        client_kwargs["aws_session_token"] = session_token

    return boto3.client(service_name, **client_kwargs), region

def deploy_to_aws():
    print("==================================================")
    print(" MUNNOKKU SIH 2026 - AWS AUTOMATED CLOUD DEPLOYER ")
    print("==================================================")

    # 1. Test STS / Authentication
    try:
        sts_client, region = get_aws_client("sts")
        caller_identity = sts_client.get_caller_identity()
        print(f"\n[✓] Authenticated to AWS successfully!")
        print(f"    Account: {caller_identity.get('Account')}")
        print(f"    ARN: {caller_identity.get('Arn')}")
        print(f"    Region: {region}\n")
    except Exception as e:
        print(f"\n[✗] AWS Authentication Failed: {e}")
        print("Please check your AWS Access Key ID and Secret Access Key.")
        return

    # 2. Deploy CloudFormation Stack for RDS & S3
    stack_name = "munnokku-mastitis-stack"
    cf_client, _ = get_aws_client("cloudformation", region)
    s3_client, _ = get_aws_client("s3", region)

    cf_template_path = "aws-cloudformation.yml"
    if not os.path.exists(cf_template_path):
        print(f"Error: {cf_template_path} not found.")
        return

    with open(cf_template_path, "r") as f:
        template_body = f.read()

    print(f"[*] Checking CloudFormation Stack: {stack_name}...")
    stack_exists = False
    try:
        stacks = cf_client.describe_stacks(StackName=stack_name)
        stack_exists = len(stacks.get("Stacks", [])) > 0
    except Exception:
        stack_exists = False

    if not stack_exists:
        print(f"[*] Creating new AWS Stack '{stack_name}' (Amazon RDS PostgreSQL + S3)...")
        try:
            cf_client.create_stack(
                StackName=stack_name,
                TemplateBody=template_body,
                Capabilities=['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM']
            )
            print("[*] Stack creation initiated. Waiting for resources (takes ~3-5 minutes)...")
            waiter = cf_client.get_waiter('stack_create_complete')
            waiter.wait(StackName=stack_name)
            print("[✓] CloudFormation Stack Created Successfully!")
        except Exception as e:
            print(f"[!] Stack creation note: {e}")
    else:
        print(f"[✓] Stack '{stack_name}' already exists.")

    # 3. Retrieve Outputs
    try:
        desc = cf_client.describe_stacks(StackName=stack_name)
        outputs = desc["Stacks"][0].get("Outputs", [])
        output_dict = {o["OutputKey"]: o["OutputValue"] for o in outputs}
        db_url = output_dict.get("DatabaseURL")
        s3_bucket = output_dict.get("S3Bucket", "munnokku-mastitis-data-2026")

        print("\n================ AWS CLOUD RESOURCES READY ================")
        print(f" • Amazon S3 Bucket : s3://{s3_bucket}")
        print(f" • Amazon RDS URL   : {db_url}")
        print("===========================================================\n")

        # 4. Upload ML Models to S3
        print(f"[*] Uploading trained ML models and datasets to s3://{s3_bucket}...")
        files_to_upload = [
            ("ml/models/best_model.pkl", "models/best_model.pkl"),
            ("ml/models/features.pkl", "models/features.pkl"),
            ("ml/models/shap_explainer.pkl", "models/shap_explainer.pkl"),
            ("Dataset Mastitis.xlsx", "datasets/Dataset_Mastitis.xlsx"),
        ]
        for local_p, s3_k in files_to_upload:
            if os.path.exists(local_p):
                print(f"    Uploading {local_p} -> {s3_k}")
                try:
                    s3_client.upload_file(local_p, s3_bucket, s3_k)
                except Exception as ex:
                    print(f"    Upload note: {ex}")

        # 5. Populate AWS RDS with Initial Cattle Data
        if db_url:
            print("\n[*] Populating AWS RDS PostgreSQL with 100 Cattle & Time-Series History...")
            os.environ["DATABASE_URL"] = db_url
            try:
                from backend.seed_db import seed_database
                seed_database()
                print("[✓] AWS RDS PostgreSQL populated successfully!")
            except Exception as se:
                print(f"[*] Note: {se}")

        print("\n🎉 AWS CLOUD DEPLOYMENT COMPLETE!")
        print(f"You can now run your backend connected to AWS RDS by running:")
        print(f"  $env:DATABASE_URL=\"{db_url}\"")
        print(f"  cd backend; python -m uvicorn main:app --reload --port 8000")

    except Exception as e:
        print(f"Error retrieving stack outputs: {e}")

if __name__ == "__main__":
    deploy_to_aws()
