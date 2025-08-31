# 🔐 Best Practices: Sistem Autentikasi Multi-Role Mahirku

## 📋 Analisis Sistem Saat Ini

### 🏗️ Arsitektur Authentication

Sistem autentikasi Mahirku saat ini menggunakan:
- **Single Login Endpoint**: `/api/auth/login` untuk semua role
- **Multiple Register Endpoints**: 
  - `/api/auth/register-user` (role: user)
  - `/api/auth/register-affiliator` (role: affiliator)
- **Role-Based Access Control (RBAC)** dengan 3 role:
  - `super_admin` (roleId: 1)
  - `affiliator` (roleId: 2) 
  - `user` (roleId: 3)

### 🎯 Struktur Role

```typescript
const ROLE = {
  SUPER_ADMIN: 1,    // Admin sistem
  AFFILIATOR: 2,     // Partner affiliasi
  USER: 3           // User biasa
};
```

### 🔑 JWT Token Structure

```typescript
const payload = {
  userId: user.id,
  roleId: user.roleId
};
```

---

## ✅ Kelebihan Arsitektur Saat Ini

### 1. **Single Login Endpoint**
- ✅ **Simplicity**: Satu endpoint untuk semua user
- ✅ **Maintenance**: Mudah maintain dan debug
- ✅ **Consistency**: Logic autentikasi terpusat
- ✅ **Frontend Flexibility**: Frontend bisa redirect berdasarkan role

### 2. **Separate Registration**
- ✅ **Business Logic**: Sesuai dengan kebutuhan landing page terpisah
- ✅ **Role Assignment**: Otomatis assign role yang tepat
- ✅ **Validation**: Bisa custom validation per role

### 3. **RBAC Implementation**
- ✅ **Scalable**: Mudah menambah role baru
- ✅ **Secure**: Middleware protection per endpoint
- ✅ **Flexible**: Kombinasi role untuk akses tertentu

---

## 🚨 Potensi Masalah & Solusi

### 1. **Security Concerns**

#### ❌ Masalah:
- User bisa coba login dengan role yang salah
- Tidak ada validasi khusus per role saat login

#### ✅ Solusi:
```typescript
// Tambahkan validasi role-specific di login
export const login = async (req: Request, res: Response) => {
  const { email, password, expectedRole } = req.body;
  
  const user = await User.findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Optional: Validasi expected role
  if (expectedRole && user.roleId !== expectedRole) {
    return res.status(403).json({ message: 'Access denied for this role' });
  }
  
  const token = user.generateAuthToken();
  res.json({ token, user, redirectTo: getRedirectPath(user.roleId) });
};
```

### 2. **User Experience**

#### ❌ Masalah:
- User mungkin bingung jika salah masuk dari landing page
- Tidak ada guidance untuk redirect

#### ✅ Solusi:
```typescript
const getRedirectPath = (roleId: number): string => {
  switch (roleId) {
    case 1: return '/admin/dashboard';
    case 2: return '/affiliator/dashboard';
    case 3: return '/user/dashboard';
    default: return '/login';
  }
};
```

---

## 🎯 Rekomendasi Best Practice

### 🥇 **REKOMENDASI: Tetap Single Login + Enhanced Security**

#### Alasan:
1. **Simplicity**: Lebih mudah maintain
2. **Flexibility**: User bisa akses dari mana saja
3. **Scalability**: Mudah menambah role baru
4. **Industry Standard**: Kebanyakan aplikasi menggunakan pendekatan ini

#### Implementation:

```typescript
// Enhanced login dengan role validation
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, source } = req.body; // source: 'admin', 'affiliator', 'user'
    
    const user = await User.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Role-based access validation
    const roleValidation = validateRoleAccess(user.roleId, source);
    if (!roleValidation.allowed) {
      return res.status(403).json({ 
        message: roleValidation.message,
        suggestedRedirect: roleValidation.redirect
      });
    }
    
    const token = user.generateAuthToken();
    res.json({ 
      token, 
      user, 
      redirectTo: getRedirectPath(user.roleId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateRoleAccess = (roleId: number, source?: string) => {
  // Jika tidak ada source, allow semua
  if (!source) return { allowed: true };
  
  const roleMap = {
    'admin': [1], // hanya super_admin
    'affiliator': [2], // hanya affiliator
    'user': [3] // hanya user
  };
  
  const allowedRoles = roleMap[source] || [];
  
  if (allowedRoles.includes(roleId)) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    message: `Access denied. This login is for ${source} only.`,
    redirect: getRedirectPath(roleId)
  };
};
```

### 🥈 **Alternatif: Multiple Login Endpoints**

Jika ingin login terpisah:

```typescript
// /api/auth/login-admin
export const loginAdmin = async (req: Request, res: Response) => {
  await loginWithRole(req, res, [1]); // hanya super_admin
};

// /api/auth/login-affiliator  
export const loginAffiliator = async (req: Request, res: Response) => {
  await loginWithRole(req, res, [2]); // hanya affiliator
};

// /api/auth/login-user
export const loginUser = async (req: Request, res: Response) => {
  await loginWithRole(req, res, [3]); // hanya user
};
```

#### ❌ Kekurangan:
- Lebih banyak endpoint untuk maintain
- User harus ingat login dari tempat yang benar
- Kurang flexible jika ada perubahan role

---

## 🛡️ Security Best Practices

### 1. **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
```

### 2. **Account Lockout**
```typescript
// Tambah field di User model
interface UserAttributes {
  // ... existing fields
  loginAttempts: number;
  lockUntil?: Date;
}

// Logic di login
if (user.isLocked()) {
  return res.status(423).json({ message: 'Account temporarily locked' });
}

if (!(await user.comparePassword(password))) {
  await user.incrementLoginAttempts();
  return res.status(401).json({ message: 'Invalid credentials' });
}

// Reset attempts on successful login
await user.resetLoginAttempts();
```

### 3. **Password Policy**
```typescript
const passwordSchema = Joi.string()
  .min(8)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'));
```

### 4. **JWT Security**
```typescript
// Gunakan refresh token
const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};
```

---

## 📱 Frontend Implementation

### 1. **Role-based Routing**
```typescript
const getDefaultRoute = (role: string) => {
  switch (role) {
    case 'super_admin': return '/admin/dashboard';
    case 'affiliator': return '/affiliator/dashboard';
    case 'user': return '/user/dashboard';
    default: return '/login';
  }
};
```

### 2. **Login Form dengan Source**
```typescript
const LoginForm = ({ source }: { source?: 'admin' | 'affiliator' | 'user' }) => {
  const handleLogin = async (credentials) => {
    const response = await api.post('/auth/login', {
      ...credentials,
      source // kirim source untuk validasi
    });
    
    if (response.data.redirectTo) {
      navigate(response.data.redirectTo);
    }
  };
};
```

---

## 🧪 Testing Strategy

### 1. **Unit Tests**
```typescript
describe('Authentication', () => {
  test('should login user with correct role', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'affiliator@test.com',
        password: 'password123',
        source: 'affiliator'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.redirectTo).toBe('/affiliator/dashboard');
  });
  
  test('should reject user with wrong role source', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123',
        source: 'admin'
      });
      
    expect(response.status).toBe(403);
  });
});
```

### 2. **Integration Tests**
```typescript
describe('Role-based Access', () => {
  test('affiliator should access affiliate endpoints', async () => {
    const token = generateToken({ userId: 1, roleId: 2 });
    
    const response = await request(app)
      .get('/api/affiliate/dashboard')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
  });
});
```

---

## 🚀 Migration Strategy

Jika ingin mengimplementasikan perubahan:

### Phase 1: Enhanced Current System
1. ✅ Tambah validasi role di login (optional)
2. ✅ Tambah redirect logic
3. ✅ Improve error messages

### Phase 2: Security Enhancements
1. ✅ Implement rate limiting
2. ✅ Add account lockout
3. ✅ Strengthen password policy

### Phase 3: Advanced Features
1. ✅ Refresh token mechanism
2. ✅ Session management
3. ✅ Audit logging

---

## 📊 Kesimpulan

### 🎯 **Rekomendasi Final**

**TETAP GUNAKAN SINGLE LOGIN** dengan enhancement:

1. ✅ **Keep**: Single login endpoint `/api/auth/login`
2. ✅ **Keep**: Separate registration endpoints
3. ✅ **Add**: Optional role validation dengan `source` parameter
4. ✅ **Add**: Smart redirect berdasarkan role
5. ✅ **Add**: Enhanced security measures

### 🏆 **Keuntungan Pendekatan Ini**

- **Simplicity**: Mudah maintain dan debug
- **Flexibility**: User bisa login dari mana saja
- **Security**: Tetap aman dengan validasi tambahan
- **UX**: User experience yang smooth dengan auto-redirect
- **Scalability**: Mudah menambah role atau fitur baru

### 📋 **Action Items**

1. ✅ Implement enhanced login dengan source validation
2. ✅ Add redirect logic berdasarkan role
3. ✅ Implement security enhancements (rate limiting, etc.)
4. ✅ Update frontend untuk handle redirect
5. ✅ Add comprehensive testing

---

**💡 Catatan**: Sistem saat ini sudah cukup baik dan mengikuti industry best practices. Enhancement yang disarankan akan membuatnya lebih robust tanpa mengorbankan simplicity.