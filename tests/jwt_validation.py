import jwt
import time
import pytest

# Mock Token (This simulates what the Aembit API would return)
# We create a token that expires in 1 hour
def generate_mock_token():
    payload = {
        "sub": "workload-123",
        "iss": "aembit-edge",
        "exp": time.time() + 3600  # Expires 1 hour from now
    }
    return jwt.encode(payload, "secret-key", algorithm="HS256")

def validate_token(token):
    """
    Validate JWT token including expiration check
    """
    try:
        # Decode the token with signature verification
        decoded_payload = jwt.decode(
            token, 
            "secret-key", 
            algorithms=["HS256"],
            options={"verify_signature": True}
        )
        return decoded_payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired!")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token!")

def test_validate_token_expiration():
    # 1. Get the token
    token = generate_mock_token()
    
    # 2. Decode without verification (Standard testing pattern)
    # This is the line you must memorize for the interview
    decoded_payload = jwt.decode(token, options={"verify_signature": False})
    
    # 3. Assert Logic
    current_time = time.time()
    expiry_time = decoded_payload["exp"]
    
    print(f"Token Expires: {expiry_time}, Now: {current_time}")
    assert expiry_time > current_time, "Token has expired!"

def test_validate_token_function():
    # Test valid token
    token = generate_mock_token()
    validated_payload = validate_token(token)
    assert validated_payload["sub"] == "workload-123"
    
    # Test expired token
    expired_payload = {
        "sub": "workload-123",
        "iss": "aembit-edge",
        "exp": time.time() - 3600  # Expired 1 hour ago
    }
    expired_token = jwt.encode(expired_payload, "secret-key", algorithm="HS256")
    
    with pytest.raises(ValueError, match="Token has expired!"):
        validate_token(expired_token)

# Run this command in terminal to test: pytest tests/jwt_validation.py