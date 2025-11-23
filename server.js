import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Data directory
const DATA_DIR = join(__dirname, 'data');
const CONFIG_FILE = join(DATA_DIR, 'config.json');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Initialize config file with admin passwords
if (!existsSync(CONFIG_FILE)) {
    await fs.writeFile(CONFIG_FILE, JSON.stringify({
        title: "Macnamara's Secret Santa!",
        adminPasswords: ['password', 'password2'] // Default admin passwords
    }));
}

// Environment variable validation
if (process.env.NODE_ENV === 'production') {
    const defaultSecret = 'secret-santa-session-key-change-in-production';
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === defaultSecret) {
        console.warn('\n⚠️  WARNING: Using default SESSION_SECRET in production!');
        console.warn('   Please set SESSION_SECRET environment variable to a random string.');
        console.warn('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        console.warn('   This is a security risk!\n');
    }
}

// Input sanitization helper
function sanitizeInput(input, maxLength = 500) {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
}

// Middleware
// Trust proxy - needed when behind nginx/apache handling SSL
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many admin requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-santa-session-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Will work with trust proxy
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, 'dist')));
}

// Helper functions for multi-tenant data persistence
function getAdminDataFiles(adminPassword) {
    // Create a safe filename from the password (hash it for security)
    const hash = crypto.createHash('sha256').update(adminPassword).digest('hex').substring(0, 16);
    return {
        groupsFile: join(DATA_DIR, `${hash}_groups.json`),
        usersFile: join(DATA_DIR, `${hash}_users.json`)
    };
}

async function readGroups(adminPassword = null) {
    if (!adminPassword) {
        // Legacy support - read from old groups.json
        const legacyFile = join(DATA_DIR, 'groups.json');
        if (existsSync(legacyFile)) {
            const data = await fs.readFile(legacyFile, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }

    const { groupsFile } = getAdminDataFiles(adminPassword);
    if (!existsSync(groupsFile)) {
        await fs.writeFile(groupsFile, JSON.stringify({}));
    }
    const data = await fs.readFile(groupsFile, 'utf-8');
    return JSON.parse(data);
}

async function writeGroups(groups, adminPassword) {
    const { groupsFile } = getAdminDataFiles(adminPassword);
    await fs.writeFile(groupsFile, JSON.stringify(groups, null, 2));
}

async function readUsers(adminPassword = null) {
    if (!adminPassword) {
        // Legacy support - read from old users.json
        const legacyFile = join(DATA_DIR, 'users.json');
        if (existsSync(legacyFile)) {
            const data = await fs.readFile(legacyFile, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }

    const { usersFile } = getAdminDataFiles(adminPassword);
    if (!existsSync(usersFile)) {
        await fs.writeFile(usersFile, JSON.stringify({}));
    }
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
}

async function writeUsers(users, adminPassword) {
    const { usersFile } = getAdminDataFiles(adminPassword);
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

async function readConfig() {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeConfig(config) {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function isValidAdminPassword(password) {
    const config = await readConfig();
    return config.adminPasswords && config.adminPasswords.includes(password);
}

// Generate unique IDs
function generateId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateRecoveryCode() {
    // Generate a memorable 6-character code (letters + numbers)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// ==================== AUTH ROUTES ====================

// Create or get user session
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { displayName, recoveryCode } = req.body;

        // If recovery code provided, search across all admin tenants
        if (recoveryCode) {
            const config = await readConfig();
            const adminPasswords = config.adminPasswords || [];

            // Search through each admin's users
            for (const adminPassword of adminPasswords) {
                const users = await readUsers(adminPassword);
                const userId = Object.keys(users).find(id => users[id].recoveryCode === recoveryCode.toUpperCase());

                if (userId) {
                    req.session.userId = userId;
                    req.session.adminPassword = adminPassword; // Store which admin this user belongs to
                    return res.json({ userId, ...users[userId], isReturningUser: true });
                }
            }

            return res.status(404).json({ error: 'Recovery code not found. Please check the code or create a new account.' });
        }

        // If user already has a session, return existing user
        if (req.session.userId && req.session.adminPassword) {
            const users = await readUsers(req.session.adminPassword);
            const user = users[req.session.userId];
            if (user) {
                return res.json({ userId: req.session.userId, ...user });
            }
        }

        // Create new user - this shouldn't happen for regular users anymore
        // Users should only be created by admins
        return res.status(400).json({ error: 'Please use your secret link to access the app' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const users = await readUsers(req.session.adminPassword);
        const user = users[req.session.userId];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ userId: req.session.userId, ...user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ==================== USER ROUTES ====================

// Update user profile
app.put('/api/users/me', requireAuth, async (req, res) => {
    try {
        const { displayName, wishlist, dislikes } = req.body;
        const users = await readUsers(req.session.adminPassword);

        if (!users[req.session.userId]) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[req.session.userId] = {
            ...users[req.session.userId],
            displayName: sanitizeInput(displayName, 100) || users[req.session.userId].displayName,
            wishlist: sanitizeInput(wishlist, 1000) || users[req.session.userId].wishlist,
            dislikes: sanitizeInput(dislikes, 1000) || users[req.session.userId].dislikes
        };

        await writeUsers(users, req.session.adminPassword);
        res.json({ userId: req.session.userId, ...users[req.session.userId] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID (for viewing wishlists)
app.get('/api/users/:userId', requireAuth, async (req, res) => {
    try {
        const users = await readUsers(req.session.adminPassword);
        const user = users[req.params.userId];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ userId: req.params.userId, ...user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== GROUP ROUTES ====================

// Get all groups for current user
app.get('/api/groups', requireAuth, async (req, res) => {
    try {
        if (!req.session.adminPassword) {
            return res.status(500).json({ error: 'Session missing admin context' });
        }

        const groups = await readGroups(req.session.adminPassword);

        const userGroups = Object.values(groups).filter(group =>
            group.participants.some(p => p.userId === req.session.userId)
        );

        res.json(userGroups);
    } catch (error) {
        console.error('Error in GET /api/groups:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific group
app.get('/api/groups/:groupId', requireAuth, async (req, res) => {
    try {
        const groups = await readGroups(req.session.adminPassword);
        const group = groups[req.params.groupId];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is a participant
        if (!group.participants.some(p => p.userId === req.session.userId)) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new group
app.post('/api/groups', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        const sanitizedName = sanitizeInput(name, 100);
        const users = await readUsers(req.session.adminPassword);
        const currentUser = users[req.session.userId];

        if (!sanitizedName) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const groupId = generateId();
        const groups = await readGroups(req.session.adminPassword);

        groups[groupId] = {
            id: groupId,
            name: sanitizedName,
            adminId: req.session.userId,
            status: 'SETUP',
            participants: [{
                userId: req.session.userId,
                name: currentUser.displayName
            }],
            exclusions: {},
            results: {},
            createdAt: new Date().toISOString()
        };

        await writeGroups(groups, req.session.adminPassword);
        res.json(groups[groupId]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Join group
app.post('/api/groups/:groupId/join', requireAuth, async (req, res) => {
    try {
        const groups = await readGroups(req.session.adminPassword);
        const group = groups[req.params.groupId];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if already a participant
        if (group.participants.some(p => p.userId === req.session.userId)) {
            return res.json(group);
        }

        const users = await readUsers(req.session.adminPassword);
        const currentUser = users[req.session.userId];

        group.participants.push({
            userId: req.session.userId,
            name: currentUser.displayName
        });

        await writeGroups(groups, req.session.adminPassword);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update exclusions (admin only)
app.put('/api/groups/:groupId/exclusions', requireAuth, async (req, res) => {
    try {
        const { exclusions } = req.body;
        const groups = await readGroups(req.session.adminPassword);
        const group = groups[req.params.groupId];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.adminId !== req.session.userId) {
            return res.status(403).json({ error: 'Only admin can update exclusions' });
        }

        group.exclusions = exclusions;
        await writeGroups(groups, req.session.adminPassword);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fisher-Yates shuffle algorithm for unbiased randomization
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Drawing algorithm
function findDerangement(participants, exclusions) {
    const ids = participants.map(p => p.userId);
    const maxAttempts = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        const shuffled = shuffle(ids);
        let isValid = true;
        const mapping = {};

        for (let j = 0; j < ids.length; j++) {
            const drawer = ids[j];
            const receiver = shuffled[j];

            // Rule 1: No self-draw
            if (drawer === receiver) {
                isValid = false;
                break;
            }

            // Rule 2: Respect exclusions
            const drawerExclusions = exclusions[drawer] || [];
            if (drawerExclusions.includes(receiver)) {
                isValid = false;
                break;
            }

            mapping[drawer] = receiver;
        }

        if (isValid) return mapping;
    }
    return null;
}

// Start draw (admin only)
app.post('/api/groups/:groupId/draw', requireAuth, async (req, res) => {
    try {
        const groups = await readGroups(req.session.adminPassword);
        const group = groups[req.params.groupId];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.adminId !== req.session.userId) {
            return res.status(403).json({ error: 'Only admin can start the draw' });
        }

        if (group.participants.length < 3) {
            return res.status(400).json({ error: 'Need at least 3 participants' });
        }

        const mapping = findDerangement(group.participants, group.exclusions);

        if (!mapping) {
            return res.status(400).json({
                error: 'Could not find a valid draw configuration with current exclusions'
            });
        }

        group.results = mapping;
        group.status = 'DRAWN';
        group.drawnAt = new Date().toISOString();

        await writeGroups(groups, req.session.adminPassword);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update participant name in group
app.put('/api/groups/:groupId/participants/me', requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        const sanitizedName = sanitizeInput(name, 100);
        const groups = await readGroups(req.session.adminPassword);
        const group = groups[req.params.groupId];

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const participantIndex = group.participants.findIndex(p => p.userId === req.session.userId);
        if (participantIndex === -1) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }

        group.participants[participantIndex].name = sanitizedName;
        await writeGroups(groups, req.session.adminPassword);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all system data (Admin only)
app.get('/api/admin/data', adminLimiter, async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) {
            return res.status(401).json({ error: 'Invalid admin password' });
        }

        const users = await readUsers(password);
        const groups = await readGroups(password);

        res.json({
            users,
            groups
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete group (Admin only)
app.delete('/api/admin/groups/:groupId', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const groups = await readGroups(password);
        if (!groups[req.params.groupId]) return res.status(404).json({ error: 'Group not found' });

        delete groups[req.params.groupId];
        await writeGroups(groups, password);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update group results (Admin only)
app.put('/api/admin/groups/:groupId/results', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { results } = req.body;
        const groups = await readGroups(password);
        const group = groups[req.params.groupId];

        if (!group) return res.status(404).json({ error: 'Group not found' });

        group.results = results;
        // If results are cleared or modified, ensure status reflects that (optional, but keeping as DRAWN or SETUP depends on logic. 
        // If we are manually editing, we probably want to keep it as is or set to DRAWN if it wasn't).
        if (Object.keys(results).length > 0 && group.status === 'SETUP') {
            group.status = 'DRAWN';
        }

        await writeGroups(groups, password);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start draw (Admin only)
app.post('/api/admin/groups/:groupId/draw', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const groups = await readGroups(password);
        const group = groups[req.params.groupId];

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (group.participants.length < 3) {
            return res.status(400).json({ error: 'Need at least 3 participants' });
        }

        const mapping = findDerangement(group.participants, group.exclusions);

        if (!mapping) {
            return res.status(400).json({
                error: 'Could not find a valid draw configuration with current exclusions'
            });
        }

        group.results = mapping;
        group.status = 'DRAWN';
        group.drawnAt = new Date().toISOString();

        await writeGroups(groups, password);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset group (Admin only)
app.post('/api/admin/groups/:groupId/reset', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const groups = await readGroups(password);
        const group = groups[req.params.groupId];

        if (!group) return res.status(404).json({ error: 'Group not found' });

        group.results = {};
        group.status = 'SETUP';
        delete group.drawnAt;

        await writeGroups(groups, password);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update group details (Admin only)
app.put('/api/admin/groups/:groupId', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { name, budget } = req.body;
        const groups = await readGroups(password);
        const group = groups[req.params.groupId];

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (name) group.name = sanitizeInput(name, 100);
        if (budget !== undefined) group.budget = sanitizeInput(budget, 50);

        await writeGroups(groups, password);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new group (Admin only)
app.post('/api/admin/groups', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { name, budget } = req.body;
        const sanitizedName = sanitizeInput(name, 100);
        const sanitizedBudget = sanitizeInput(budget, 50);

        if (!sanitizedName) return res.status(400).json({ error: 'Group name is required' });

        const groupId = generateId();
        const groups = await readGroups(password);

        groups[groupId] = {
            id: groupId,
            name: sanitizedName,
            budget: sanitizedBudget || '0',
            adminId: 'admin', // System admin
            status: 'SETUP',
            participants: [],
            exclusions: {},
            results: {},
            createdAt: new Date().toISOString()
        };

        await writeGroups(groups, password);
        res.json(groups[groupId]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add participant to group (Admin only)
app.post('/api/admin/groups/:groupId/participants', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { name } = req.body;
        const sanitizedName = sanitizeInput(name, 100);

        if (!sanitizedName) return res.status(400).json({ error: 'Name is required' });

        const groups = await readGroups(password);
        const group = groups[req.params.groupId];
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Create new user
        const userId = generateUserId();
        const recoveryCode = generateRecoveryCode();
        const users = await readUsers(password);

        users[userId] = {
            displayName: sanitizedName,
            wishlist: '',
            dislikes: '',
            recoveryCode: recoveryCode,
            createdAt: new Date().toISOString()
        };

        // Add to group
        group.participants.push({
            userId: userId,
            name: sanitizedName
        });

        await writeUsers(users, password);
        await writeGroups(groups, password);

        res.json({ group, user: { userId, ...users[userId] } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update group exclusions (Admin only)
app.put('/api/admin/groups/:groupId/exclusions', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { exclusions } = req.body;
        const groups = await readGroups(password);
        const group = groups[req.params.groupId];

        if (!group) return res.status(404).json({ error: 'Group not found' });

        group.exclusions = exclusions;
        await writeGroups(groups, password);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user details (Admin only)
app.put('/api/admin/users/:userId', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const { wishlist, dislikes } = req.body;
        const users = await readUsers(password);

        if (!users[req.params.userId]) return res.status(404).json({ error: 'User not found' });

        if (wishlist !== undefined) users[req.params.userId].wishlist = wishlist;
        if (dislikes !== undefined) users[req.params.userId].dislikes = dislikes;

        await writeUsers(users, password);
        res.json(users[req.params.userId]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get config (Public - for front page title)
app.get('/api/config', async (req, res) => {
    try {
        const config = await readConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get config (Admin only)
app.get('/api/admin/config', async (req, res) => {
    try {
        const password = req.headers['x-admin-password'];
        if (!await isValidAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin password' });

        const config = await readConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎅 Secret Santa server running on http://0.0.0.0:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📁 Data directory: ${DATA_DIR}`);
    }
});
