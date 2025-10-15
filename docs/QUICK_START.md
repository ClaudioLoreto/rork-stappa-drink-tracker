# Stappa - Quick Start Guide

## Getting Started

### 1. Start the App

Run one of these commands:

```bash
# For mobile preview (scan QR code with Expo Go app)
bun run start

# For web preview (opens in browser)
bun run start-web
```

### 2. Login with Test Credentials

When the app loads, you'll see the login screen. Use these credentials:

**Admin Account:**
- Username: `root`
- Password: `Root1234@`

**Important Notes:**
- Password is case-sensitive! Use exactly `Root1234@` (capital R, rest lowercase)
- If you see a blank screen, make sure you're entering the credentials correctly

### 3. Test the App Features

#### As Admin (ROOT user)
1. After login, you'll see the Admin Dashboard
2. Try these actions:
   - **Create Establishment**: Tap "Create Establishment" and add a bar/restaurant
   - **View Users**: Tap "Manage Users" to see all registered users
   - **Check Requests**: Tap "Merchant Requests" to see pending merchant applications

#### Create a Regular User Account
1. Logout from admin account
2. Tap "Create Account" on login screen
3. Fill in the registration form:
   - First Name: `John`
   - Last Name: `Doe`
   - Username: `johndoe` (no spaces, no special characters)
   - Phone: `+1234567890`
   - Email: `john@example.com`
   - Password: `Test1234!@` (must meet all requirements)
   - Confirm Password: `Test1234!@`
4. Tap "Create Account"

#### As Regular User
1. After registration, you'll see the User Dashboard
2. View your beer mug (starts at 0/10)
3. Try these actions:
   - **Validate Drink**: Tap "Validate Drink" to generate a QR code
   - **Become Merchant**: Scroll down and tap "Become a Merchant" to submit a request

#### Test Merchant Request Flow
1. As a user, submit a merchant request with business details
2. Logout and login as admin (`root` / `Root1234@`)
3. Go to "Merchant Requests"
4. Approve the request
5. Logout and login with the user account
6. You should now see the Merchant Dashboard with QR scanner

#### As Merchant
1. Login with a merchant account
2. Tap "Start Scanning"
3. Grant camera permissions if prompted
4. Scan a QR code from a user's "Validate Drink" screen

## Common Issues

### "Can't see anything" / Blank Screen
**Solution:**
1. Make sure you're using the correct login credentials
2. Try these test credentials: `root` / `Root1234@` (case-sensitive!)
3. If still blank, check the browser console for errors (F12)
4. Try refreshing the page or restarting the app

### Login Fails
**Solution:**
1. Double-check the password: `Root1234@` (capital R, lowercase rest)
2. Make sure there are no extra spaces
3. Try copying and pasting: `Root1234@`

### Registration Fails
**Solution:**
1. Make sure password meets all requirements:
   - At least 10 characters
   - One uppercase letter
   - One lowercase letter
   - One number
   - One special character
2. Username must not contain spaces or special characters (except underscore)
3. Phone must be in valid format

### QR Code Not Scanning
**Solution:**
1. Grant camera permissions when prompted
2. Make sure QR code is within the scanning frame
3. QR codes expire after 5 minutes - generate a new one if needed
4. Note: Camera scanning may not work on web browsers

## Testing the Complete Flow

### End-to-End Test Scenario

1. **Setup (as Admin)**
   - Login as `root` / `Root1234@`
   - Create an establishment: "Joe's Bar" at "123 Main St"
   - Logout

2. **User Registration**
   - Create a new user account
   - Fill in all required fields
   - Login with new credentials

3. **User Journey**
   - View beer mug (0/10)
   - Tap "Validate Drink" to generate QR code
   - Note: You'll need a merchant to scan this

4. **Merchant Request**
   - Tap "Become a Merchant"
   - Fill in business information
   - Submit request
   - Logout

5. **Admin Approval**
   - Login as admin
   - Go to "Merchant Requests"
   - Approve the pending request
   - Logout

6. **Merchant Scanning**
   - Login with the approved merchant account
   - Tap "Start Scanning"
   - Grant camera permissions
   - Scan a user's QR code

7. **Complete the Cycle**
   - Login as user
   - Generate and validate 10 drinks
   - Tap "Get Free Drink" when available
   - Have merchant scan the bonus QR
   - Beer mug resets to 0

## App Navigation

### Login Screen
- Enter username and password
- Tap "Login" to sign in
- Tap "Create Account" to register

### User Dashboard
- View beer mug progress
- Tap "Validate Drink" to generate QR
- Tap "Get Free Drink" (when 10/10)
- Tap "Become a Merchant" to request merchant status
- Tap logout icon to sign out

### Merchant Dashboard
- Tap "Start Scanning" to open camera
- Scan customer QR codes
- View success/error messages
- Tap "Logout" to sign out

### Admin Dashboard
- View statistics (establishments, users, requests)
- Tap "Create Establishment" to add new location
- Tap "Manage Users" to view and assign roles
- Tap "Merchant Requests" to review applications
- Tap "Logout" to sign out

## Next Steps

After testing the basic functionality:

1. **Explore the Code**
   - Check `/app` for screen components
   - Review `/components` for reusable UI elements
   - Look at `/services/api.ts` for mock backend logic

2. **Customize the App**
   - Modify colors in `/constants/colors.ts`
   - Update UI components in `/components`
   - Add new features to the screens

3. **Connect Real Backend**
   - Replace mock API in `/services/api.ts`
   - Implement real authentication
   - Add database integration

4. **Deploy**
   - Build for iOS/Android with EAS
   - Deploy web version to Vercel/Netlify
   - Submit to App Store/Google Play

## Support

If you encounter any issues:
1. Check this guide
2. Review `/docs/STAPPA_USER_GUIDE.md`
3. Check the console for error messages
4. Verify all dependencies are installed: `bun install`

## Development Tips

- **Hot Reload**: Changes to code will automatically reload the app
- **Console Logs**: Check terminal/browser console for debug messages
- **Mock Data**: All data is in-memory and resets on app restart
- **Test Accounts**: Create multiple test accounts to test different roles

Happy testing! 🍺
