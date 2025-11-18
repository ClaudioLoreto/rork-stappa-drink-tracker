const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, validatePassword } = require('../utils/password.util');
const { validateUsername, validateEmail } = require('../utils/validation.util');
const { generateToken } = require('../utils/jwt.util');

const prisma = new PrismaClient();

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, birthdate, city, province, region } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Validate age (18+ required for alcohol content compliance)
    if (birthdate) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return res.status(403).json({ error: 'You must be at least 18 years old to register' });
      }
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ error: usernameValidation.errors[0] });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.errors[0] });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        birthdate: birthdate ? new Date(birthdate) : null,
        city: city || null,
        province: province || null,
        region: region || null,
        role: 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthdate: true,
        city: true,
        province: true,
        region: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username, role: user.role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (case-sensitive)
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is suspended or inactive' });
    }

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username, role: user.role });

    // Return user data (exclude password)
    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
