# Stappa Documentation Index

## 🚀 Start Here

### New to Stappa?
1. **[QUICK_START.md](./QUICK_START.md)** - Get the app running in 5 minutes
   - Test credentials: `root` / `Root1234@`
   - Step-by-step setup
   - Common issues solved

### Having Problems?
2. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Fix common issues
   - "Can't see anything" → Check login credentials
   - QR codes not working → Camera permissions
   - Registration failing → Password requirements

## 📚 Complete Documentation

### User Guides
- **[STAPPA_USER_GUIDE.md](./STAPPA_USER_GUIDE.md)** - Complete user manual
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide

### Technical Documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - All features (✅ 100% complete)
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend architecture
- **[REGISTRATION_REQUIREMENTS.md](./REGISTRATION_REQUIREMENTS.md)** - Registration specs
- **[ADDENDUM_IMPLEMENTATION.md](./ADDENDUM_IMPLEMENTATION.md)** - Addendum features

## 🔑 Quick Reference

### Test Credentials
```
Username: root
Password: Root1234@
```
⚠️ **Case-sensitive!** Use exact capitalization.

### Password Requirements
- ✅ Minimum 10 characters
- ✅ One uppercase letter
- ✅ One lowercase letter
- ✅ One number
- ✅ One special character

### App Features
- 👤 **User**: Track drinks, earn free drinks
- 🏪 **Merchant**: Scan QR codes, validate drinks
- 👑 **Admin**: Manage establishments, approve merchants

## 🎯 Common Tasks

| Task | Documentation |
|------|---------------|
| Run the app | [QUICK_START.md](./QUICK_START.md) |
| Login issues | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Test features | [QUICK_START.md](./QUICK_START.md) → End-to-End Test |
| Understand flows | [STAPPA_USER_GUIDE.md](./STAPPA_USER_GUIDE.md) → User Flows |
| Check features | [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) |
| Registration help | [REGISTRATION_REQUIREMENTS.md](./REGISTRATION_REQUIREMENTS.md) |

## 📱 App Structure

```
app/
├── login.tsx          → Login screen
├── register.tsx       → Registration with validation
├── user.tsx           → User dashboard (beer mug)
├── merchant.tsx       → QR scanner
└── admin.tsx          → Admin dashboard

components/
├── BeerMug.tsx        → Animated progress indicator
├── ModalKit.tsx       → Custom styled modals
├── Button.tsx         → Themed buttons
└── Form.tsx           → Form inputs with validation
```

## 🎨 Design System

**Color Palette:**
- 🟡 Cream: #FEF3E2 (Background)
- 🟡 Yellow: #F3C623 (Secondary)
- 🟠 Amber: #FFB22C (Accent)
- 🟠 Orange: #FA812F (Primary)

## ✅ Implementation Status

All features are **100% complete**:
- ✅ User registration with validation
- ✅ Role-based access (Admin, Merchant, User)
- ✅ QR code generation and scanning
- ✅ Progress tracking (0-10 drinks)
- ✅ Merchant request workflow
- ✅ Custom styled modals
- ✅ Animated beer mug
- ✅ Password case-sensitivity

## 🆘 Quick Help

**Can't see anything?**
→ Use credentials: `root` / `Root1234@` (case-sensitive!)

**Login fails?**
→ Check password: Capital R, lowercase rest, @ at end

**Registration fails?**
→ Password must have 10+ chars, uppercase, lowercase, number, special char

**QR not scanning?**
→ Grant camera permissions, check QR not expired (5 min)

---

**Need more help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.
