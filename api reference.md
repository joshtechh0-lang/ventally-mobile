GET
/api/v1/auth/profile
Get user profile


Retrieve authenticated user's profile information including wallet balance

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Profile retrieved successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "phone": "string",
    "firstName": "string",
    "lastName": "string",
    "displayName": "string",
    "profilePictureUrl": "string",
    "bio": "string",
    "dateOfBirth": "2026-02-02",
    "userType": "venter",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2026-02-02T16:51:13.729Z",
    "updatedAt": "2026-02-02T16:51:13.729Z"
  },
  "preferences": {
    "genderIdentity": "Man",
    "culturalBackground": "Black",
    "ethnicity": "African Diaspora",
    "ageGroup": "18-24",
    "lgbtqIdentity": "Gay",
    "specialTopics": [
      "Mental Health"
    ],
    "faithOrBelief": "Christian",
    "preferredLanguage": "en"
  },
  "wallet": {
    "balanceMinutes": 0,
    "balanceCurrency": 0,
    "autoRechargeEnabled": true
  }
}
No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
Profile not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}


PUT
/api/v1/auth/profile
Update user profile


Update authenticated user's profile information. All fields are optional.

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "JohnD",
  "phone": "+1234567890",
  "profilePictureUrl": "https://example.com/profile.jpg",
  "bio": "Passionate listener with 5 years of experience",
  "dateOfBirth": "1990-01-15",
  "genderIdentity": "Non-binary",
  "culturalBackground": "Asian",
  "ethnicity": "Asian",
  "ageGroup": "25-34",
  "lgbtqIdentity": "Bisexual",
  "specialTopics": [
    "Mental Health",
    "Relationships"
  ],
  "faithOrBelief": "Buddhist",
  "preferredLanguage": "en"
}
Responses
Code	Description	Links
200	
Profile updated successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Profile updated successfully",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "phone": "string",
    "firstName": "string",
    "lastName": "string",
    "displayName": "string",
    "profilePictureUrl": "string",
    "bio": "string",
    "dateOfBirth": "2026-02-02",
    "userType": "venter",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2026-02-02T16:50:34.769Z",
    "updatedAt": "2026-02-02T16:50:34.769Z"
  },
  "preferences": {
    "genderIdentity": "string",
    "culturalBackground": "string",
    "ethnicity": "string",
    "ageGroup": "string",
    "lgbtqIdentity": "string",
    "specialTopics": [
      "string"
    ],
    "faithOrBelief": "string",
    "preferredLanguage": "string"
  }
}
No links
400	
Invalid input data

Media type

application/json
Examples

invalidFirstName
Example Value
Schema
{
  "error": "Invalid first name",
  "message": "First name must be 100 characters or less"
}
No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
Profile not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}


POST
/api/v1/auth/biometric/register
Register biometric authentication (Face ID / Fingerprint)


Register Face ID or Fingerprint authentication for the authenticated user. The mobile app should generate a public/private key pair and send the public key along with device information.

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "deviceId": "iPhone12,1_A1B2C3D4E5F6",
  "deviceName": "iPhone 13 Pro"
}
Responses
Code	Description	Links
200	
Biometric authentication registered successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Biometric authentication registered successfully",
  "biometric": {
    "enabled": true,
    "deviceName": "iPhone 13 Pro",
    "registeredAt": "2026-01-30T12:00:00.000Z"
  }
}
No links
400	
Invalid input data

Media type

application/json
Examples

invalidPublicKey
Example Value
Schema
{
  "error": "Invalid public key",
  "message": "Public key must be a valid base64 encoded string"
}
No links
401	
Unauthorized - valid JWT token required

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
User not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}

POST
/api/v1/auth/biometric/login
Login with biometric authentication

Authenticate user using Face ID or Fingerprint. The mobile app must sign a challenge with the private key and send the signature for verification.

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "email": "user@example.com",
  "deviceId": "iPhone12,1_A1B2C3D4E5F6",
  "challenge": "1706616000000",
  "signature": "SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBzaWduYXR1cmU="
}
Responses
Code	Description	Links
200	
Biometric login successful

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Biometric login successful",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "userType": "venter",
    "phoneNumber": "string",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2026-02-02T18:45:50.327Z"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
No links
400	
Invalid input data

Media type

application/json
Examples

missingFields
Example Value
Schema
{
  "error": "Missing required fields",
  "message": "Device ID, signature, challenge, and email are required"
}
No links
401	
Authentication failed

Media type

application/json
Examples

notRegistered
Example Value
Schema
{
  "error": "Authentication failed",
  "message": "Biometric authentication not registered or device not recognized"
}
No links
403	
Account disabled

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links

POST



Disable Face ID / Fingerprint authentication for the authenticated user

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Biometric authentication disabled successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Biometric authentication disabled successfully",
  "biometric": {
    "enabled": false
  }
}
No links
401	
Unauthorized - valid JWT token required

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
User not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}

Check if biometric authentication is enabled and get device information

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Biometric status retrieved successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "biometric": {
    "enabled": true,
    "deviceName": "iPhone 13 Pro",
    "registeredAt": "2026-01-30T12:00:00.000Z"
  }
}
No links
401	
Unauthorized - valid JWT token required

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
User not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}


GET
/api/v1/payments/subscription-plans
Get subscription plans

Retrieve all active subscription plans with monthly pricing and included minutes

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Subscription plans retrieved successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "plans": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Basic Plan",
      "price_monthly": 29.99,
      "included_minutes": 200,
      "overage_rate": 0.15,
      "features": {
        "priority_support": false
      },
      "is_active": true,
      "stripe_price_id": "price_1234567890",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Premium Plan",
      "price_monthly": 49.99,
      "included_minutes": 500,
      "overage_rate": 0.1,
      "features": {
        "priority_support": true,
        "unlimited_contacts": true
      },
      "is_active": true,
      "stripe_price_id": "price_0987654321",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
No links
500	
Server error

Media type

application/json
Example Value
Schema
{
  "error": "Failed to fetch subscription plans"
}


POST
/api/v1/payments/create-subscription-checkout
Create checkout session for subscription


Create a Stripe checkout session for subscribing to a monthly plan

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "planId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
Subscription checkout session created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "sessionId": "string",
  "url": "string",
  "planName": "string",
  "monthlyPrice": 0,
  "includedMinutes": 0
}
No links
400	
Invalid or missing plan ID

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
404	
Subscription plan not found

Media type

application/json
Example Value
Schema
{
  "error": "string"
}

POST
/api/v1/payments/create-intent
Create payment intent


Create a Stripe payment intent for adding funds to wallet

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "amount": 10
}
Responses
Code	Description	Links
200	
Payment intent created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "clientSecret": "string",
  "paymentIntentId": "string"
}
No links
400	
Invalid amount

Media type

application/json
Example Value
Schema
{
  "error": "string"
}
No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "error": "string"
}