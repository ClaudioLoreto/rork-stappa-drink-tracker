# Stappa - Troubleshooting Guide

## "Can't See Anything" / Blank Screen Issues

### Issue: App shows blank/white screen

**Possible Causes & Solutions:**

1. **Not Logged In**
   - The app automatically redirects to login if not authenticated
   - Make sure you see the login screen with "Stappa" title
   - If you see a blank screen, try refreshing the page

2. **Wrong Credentials**
   - Admin credentials: `root` / `Root1234@` (case-sensitive!)
   - Common mistake: using `root1234@` instead of `Root1234@`
   - Make sure there are no extra spaces

3. **App Still Loading**
   - Wait a few seconds for the app to initialize
   - You should see "Loading Stappa..." or "Redirecting..." text
   - If stuck on loading, refresh the page

4. **JavaScript Errors**
   - Open browser console (F12 or Cmd+Option+I)
   - Look for red error messages
   - Common errors:
     - Module not found: Run `bun install`
     - Network errors: Check if dev server is running

5. **Cache Issues**
   - Clear browser cache
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Try incognito/private browsing mode

### Issue: Login screen not showing

**Solutions:**
1. Check if app is running: `bun run start-web`
2. Navigate to the correct URL (usually http://localhost:8081)
3. Check terminal for errors
4. Try restarting the dev server

### Issue: After login, still see blank screen

**Solutions:**
1. Check browser console for errors
2. Verify user role is set correctly
3. Try logging out and back in
4. Clear AsyncStorage:
   - Open browser console
   - Run: `localStorage.clear()`
   - Refresh page and login again

## Login Issues

### Issue: "Invalid credentials" error

**Solutions:**
1. Verify password is exactly: `Root1234@`
   - Capital R
   - Lowercase root
   - Numbers 1234
   - @ symbol at the end
2. Check username is exactly: `root` (all lowercase)
3. Make sure no extra spaces before or after
4. Try copying and pasting the credentials

### Issue: Can't create new account

**Solutions:**
1. Check password requirements:
   - Minimum 10 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)
   - At least one special character (!@#$%^&*(),.?":{}|<>)
2. Username requirements:
   - No spaces
   - No special characters (except underscore)
   - Only letters, numbers, and underscore
3. Phone must be in valid format: +1234567890
4. Email must be valid format: user@example.com

### Issue: Password validation not working

**Solutions:**
1. Make sure you're typing in the password field
2. Watch the validation indicators turn green
3. All 5 requirements must be met:
   - ✓ At least 10 characters
   - ✓ One uppercase letter
   - ✓ One lowercase letter
   - ✓ One number
   - ✓ One special character
4. Example valid password: `Test1234!@`

## QR Code Issues

### Issue: QR code not generating

**Solutions:**
1. Make sure you're logged in as a user (not admin or merchant)
2. Check if you have less than 10 drinks (can't validate more)
3. Wait for previous QR code to expire (5 minutes)
4. Check browser console for errors

### Issue: QR code not scanning

**Solutions:**
1. **Camera Permissions**
   - Grant camera access when prompted
   - Check browser settings if denied
   - On mobile: Settings > Safari/Chrome > Camera
2. **QR Code Expired**
   - QR codes expire after 5 minutes
   - Generate a new one
3. **Already Used**
   - Each QR code can only be scanned once
   - Generate a new one
4. **Web Browser Limitations**
   - Camera scanning may not work on all browsers
   - Try using mobile app instead
   - Use Chrome or Safari for best results

### Issue: "Invalid or expired QR code" error

**Solutions:**
1. Generate a new QR code
2. Make sure QR code is less than 5 minutes old
3. Don't scan the same QR code twice
4. Check if merchant has proper permissions

## Merchant Issues

### Issue: Can't access merchant dashboard

**Solutions:**
1. Make sure your account has merchant role
2. Check if merchant request was approved by admin
3. Try logging out and back in
4. Verify with admin that role was assigned

### Issue: Camera not opening

**Solutions:**
1. Grant camera permissions
2. Check browser settings
3. Try different browser
4. On mobile: Check app permissions in device settings
5. Note: Camera may not work on web - use mobile app

### Issue: Scanning not working

**Solutions:**
1. Make sure camera has focus
2. Hold QR code steady in frame
3. Ensure good lighting
4. Try moving closer/farther from QR code
5. Generate new QR code if expired

## Admin Issues

### Issue: Can't see merchant requests

**Solutions:**
1. Make sure you're logged in as admin (root)
2. Check if there are any pending requests
3. Try refreshing the page
4. Create a test request from a user account

### Issue: Can't approve merchant request

**Solutions:**
1. Verify you're logged in as admin
2. Check browser console for errors
3. Make sure request is in PENDING status
4. Try refreshing and approving again

### Issue: Can't create establishment

**Solutions:**
1. Fill in all required fields (name and address)
2. Check for error messages
3. Verify you have admin permissions
4. Check browser console for errors

## Performance Issues

### Issue: App is slow or laggy

**Solutions:**
1. Close other browser tabs
2. Restart the dev server
3. Clear browser cache
4. Check if computer is under heavy load
5. Try on a different device

### Issue: Animations not smooth

**Solutions:**
1. This is normal on web preview
2. Test on actual mobile device for better performance
3. Reduce animation complexity if needed
4. Check if device supports hardware acceleration

## Development Issues

### Issue: Changes not reflecting

**Solutions:**
1. Make sure dev server is running
2. Check if hot reload is working
3. Try manual refresh (Cmd+R or Ctrl+R)
4. Restart dev server: Stop and run `bun run start-web` again
5. Clear cache and hard refresh

### Issue: TypeScript errors

**Solutions:**
1. Run `bun install` to ensure all dependencies are installed
2. Check if types are correct
3. Restart TypeScript server in your editor
4. Check `tsconfig.json` for configuration issues

### Issue: Module not found errors

**Solutions:**
1. Run `bun install`
2. Check if package is listed in `package.json`
3. Restart dev server
4. Delete `node_modules` and run `bun install` again

## Data Issues

### Issue: Progress not saving

**Solutions:**
1. Note: App uses mock backend - data resets on restart
2. Check if AsyncStorage is working
3. Verify authentication token is valid
4. Check browser console for errors

### Issue: Lost all data after refresh

**Solutions:**
1. This is expected with mock backend
2. Authentication persists via AsyncStorage
3. Progress data is in-memory only
4. For persistent data, implement real backend

## Mobile-Specific Issues

### Issue: App not loading on phone

**Solutions:**
1. Make sure phone and computer are on same WiFi
2. Check if Expo Go app is installed
3. Scan QR code correctly
4. Try tunnel mode: `bun run start -- --tunnel`

### Issue: Camera not working on mobile

**Solutions:**
1. Grant camera permissions in device settings
2. Restart Expo Go app
3. Check if camera works in other apps
4. Try reinstalling Expo Go

## Getting Help

If none of these solutions work:

1. **Check Console Logs**
   - Browser: F12 or Cmd+Option+I
   - Look for error messages in red
   - Copy error message for debugging

2. **Check Terminal Output**
   - Look for errors in the terminal where dev server is running
   - Check for warnings or error messages

3. **Verify Setup**
   - Run `bun install` to ensure dependencies
   - Check Node.js version: `node --version` (should be 18+)
   - Check Bun version: `bun --version`

4. **Start Fresh**
   - Stop dev server
   - Delete `node_modules`: `rm -rf node_modules`
   - Reinstall: `bun install`
   - Restart: `bun run start-web`

5. **Review Documentation**
   - `/docs/QUICK_START.md` - Getting started guide
   - `/docs/STAPPA_USER_GUIDE.md` - Complete user guide
   - `/docs/REGISTRATION_REQUIREMENTS.md` - Registration details

## Common Error Messages

### "Invalid username or password"
- Check credentials: `root` / `Root1234@`
- Password is case-sensitive

### "User already exists"
- Username or email is taken
- Try different username/email

### "Please fill in all fields"
- All required fields must be filled
- Check for empty inputs

### "Password does not meet all requirements"
- Review password requirements
- All 5 criteria must be met

### "Invalid or expired QR code"
- QR code is older than 5 minutes
- QR code was already scanned
- Generate new QR code

### "Failed to load progress"
- Check if user is authenticated
- Verify token is valid
- Try logging out and back in

## Still Having Issues?

1. Check all documentation in `/docs` folder
2. Review code in `/app` and `/components`
3. Check browser/terminal console for specific errors
4. Try testing on different device/browser
5. Verify all dependencies are installed correctly

Remember: This is a development version with mock backend. Some features may behave differently in production with a real backend.
