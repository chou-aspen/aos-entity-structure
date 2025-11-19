"""
Test script to verify Dynamics 365 connection
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import msal

# Load environment variables
dotenv_path = Path('.env').resolve()
load_dotenv(dotenv_path=dotenv_path)

DYNAMICS_AUTHORITY = os.environ.get('DYNAMICS_AUTHORITY')
DYNAMICS_CLIENT_ID = os.environ.get('DYNAMICS_CLIENT_ID')
DYNAMICS_CLIENT_SECRET = os.environ.get('DYNAMICS_CLIENT_SECRET')
DYNAMICS_SCOPES = os.environ.get('DYNAMICS_SCOPES')

print(f"Authority: {DYNAMICS_AUTHORITY}")
print(f"Client ID: {DYNAMICS_CLIENT_ID}")
print(f"Client Secret: {'*' * 10 if DYNAMICS_CLIENT_SECRET else 'None'}")
print(f"Scopes: {DYNAMICS_SCOPES}")

# Try to acquire token
try:
    msal_app = msal.ConfidentialClientApplication(
        client_id=DYNAMICS_CLIENT_ID,
        authority=DYNAMICS_AUTHORITY,
        client_credential=DYNAMICS_CLIENT_SECRET
    )

    scopes = [DYNAMICS_SCOPES]
    token = msal_app.acquire_token_for_client(scopes)

    print("\n--- Token Response ---")
    print(f"Keys in response: {token.keys()}")

    if 'access_token' in token:
        print("✓ Successfully acquired access token!")
        print(f"Token expires in: {token.get('expires_in')} seconds")
    else:
        print("✗ Failed to acquire access token")
        print(f"Error: {token.get('error')}")
        print(f"Error Description: {token.get('error_description')}")

except Exception as e:
    print(f"✗ Exception occurred: {e}")
