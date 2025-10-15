# Stappa - User Guide

## Overview

Stappa is a mobile loyalty app for bars and establishments that allows users to track their drink purchases and earn free drinks through QR code validation.

## Test Credentials

### Admin Account (ROOT)
- **Username**: `root`
- **Password**: `Root1234@`
- **Important**: Password is case-sensitive! Make sure to use the exact capitalization.

### Creating New Accounts
You can create new user accounts through the registration screen. All new accounts start with the USER role.

## Password Requirements

When registering a new account, your password must meet these requirements:
- Minimum 10 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)
- Passwords are case-sensitive

## App Features by Role

### User Features
- **Track Progress**: View your drink progress with an animated beer mug (0-10 drinks)
- **Validate Drinks**: Generate time-limited QR codes for drink validation
- **Earn Free Drinks**: After 10 validated drinks, generate a bonus QR code for a free drink
- **Become a Merchant**: Request merchant status by submitting business information

### Merchant Features
- **QR Scanner**: Open device camera to scan customer QR codes
- **Validate Purchases**: Confirm drink purchases and bonus redemptions
- **Real-time Feedback**: See success/error messages after each scan

### Admin Features
- **Dashboard**: View statistics for establishments, users, and merchant requests
- **Manage Establishments**: Create and manage bar/restaurant locations
- **User Management**: Search users and assign merchant roles
- **Merchant Requests**: Review and approve/reject merchant applications

## User Flows

### Standard User Flow
1. Register or login to your account
2. View your beer mug progress (starts at 0/10 drinks)
3. Buy a drink at a participating bar
4. Tap "Validate Drink" to generate a time-limited QR code (expires in 5 minutes)
5. Show the QR code to the merchant for scanning
6. Your progress increases by 1
7. After reaching 10 drinks, tap "Get Free Drink" to generate a bonus QR code
8. Show the bonus QR to the merchant
9. Your progress resets to 0 and the cycle starts again

### Merchant Request Flow
1. On your user dashboard, find the "Own a bar?" card
2. Tap "Become a Merchant"
3. Fill out the business information form:
   - Business Name (required)
   - Business Address (required)
   - City (required)
   - Postal Code (required)
   - Country (required)
   - VAT/Tax ID (required)
   - Phone (required)
   - Description (optional)
4. Submit your request
5. Wait for admin approval
6. Once approved, your account will be upgraded to merchant role

### Merchant Flow
1. Login with your merchant credentials
2. View the merchant dashboard
3. Tap "Start Scanning" to open the camera
4. Point the camera at a customer's QR code
5. The system automatically validates the code
6. You'll see a success message if valid, or an error if invalid/expired
7. Customer's progress is updated automatically

### Admin Flow
1. Login with root credentials (`root` / `Root1234@`)
2. View the admin dashboard with statistics
3. **Create Establishments**:
   - Tap "Create Establishment"
   - Enter name and address
   - Submit to create
4. **Assign Merchants**:
   - Tap "Manage Users"
   - Search for a user
   - Tap "Make Merchant" next to a user with USER role
5. **Review Merchant Requests**:
   - Tap "Merchant Requests"
   - View pending applications
   - Tap "Approve" to grant merchant role and create establishment
   - Tap "Reject" to decline the request

## Design System

The app uses a custom 4-color palette:
- **Cream** (#FEF3E2): Background color
- **Yellow** (#F3C623): Secondary actions and highlights
- **Amber** (#FFB22C): Accent color
- **Orange** (#FA812F): Primary actions and branding

## QR Code Rules

### Validation QR Codes
- Generated when user taps "Validate Drink"
- Valid for 5 minutes
- Single-use only (cannot be scanned twice)
- Increments user's drink count by 1

### Bonus QR Codes
- Generated when user reaches 10/10 drinks
- Valid for 5 minutes
- Single-use only
- Resets user's drink count to 0

### QR Code States
- **Valid**: QR code is scanned successfully
- **Expired**: QR code has passed its 5-minute validity period
- **Invalid**: QR code doesn't exist or has already been used
- **Already Used**: QR code has been scanned before

## Troubleshooting

### Can't Login?
- Make sure you're using the correct username and password
- Remember: passwords are case-sensitive
- For admin access, use `root` / `Root1234@` (exact capitalization)

### QR Code Not Scanning?
- Make sure you've granted camera permissions
- Ensure the QR code is within the scanning frame
- Check that the QR code hasn't expired (5-minute limit)
- Try generating a new QR code

### Can't See Anything on Screen?
- Make sure you're logged in with valid credentials
- Try refreshing the app
- Check your internet connection
- Clear app cache and restart

### Merchant Request Not Showing?
- Make sure you filled in all required fields
- Check that your phone number is in a valid format
- Wait a moment for the request to be submitted
- Check with an admin to see if your request is pending

## Technical Notes

### Mock Backend
This app currently uses a mock backend for development and testing. All data is stored in memory and will be reset when the app is restarted.

### Camera Permissions
The merchant scanning feature requires camera access. You'll be prompted to grant permission when you first try to scan a QR code.

### Web Compatibility
The app works on web browsers, but camera scanning is limited on web. For full functionality, use the mobile app on iOS or Android.

## Support

For issues or questions:
1. Check this user guide
2. Review the technical documentation in `/docs`
3. Contact the development team

## Version History

### Current Version
- ✅ Password case-sensitivity
- ✅ Custom styled modals (ModalKit)
- ✅ Enhanced beer mug with animations
- ✅ "Become a Merchant" request flow
- ✅ Admin merchant request approval/rejection
- ✅ Strong password validation
- ✅ Username validation (no spaces/special chars)
- ✅ Phone field validation
- ✅ Role-based access control
- ✅ QR code generation and validation
- ✅ Progress tracking and reset
