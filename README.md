# 🎅 Secret Santa Manager

A beautiful, full-featured Secret Santa application built with React and Node.js. Perfect for families, friend groups, and organizations to manage their gift exchanges with ease!

![Secret Santa](https://img.shields.io/badge/Season-Holiday-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)

## ✨ Features

### 🎁 Core Functionality
- **Smart Gift Assignment** - Intelligent algorithm ensures no one draws themselves
- **Exclusion Rules** - Prevent specific pairings (e.g., spouses drawing each other)
- **Wishlist & Dislikes** - Participants can share gift preferences and items to avoid
- **Recovery Codes** - Secure access links for each participant
- **Real-time Updates** - See group changes instantly

### 👥 Multi-Tenant Support
- **Multiple Families/Groups** - Host unlimited separate Secret Santa events
- **Data Isolation** - Each admin password creates a completely separate instance
- **Independent Management** - Each family manages their own groups and participants

### 🎨 Beautiful Design
- Festive Christmas theme with snow animations
- Responsive design works on all devices
- Intuitive user interface
- Premium glassmorphism effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hal9000cli/secret-santa.git
   cd secret-santa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure admin passwords**
   
   Create or edit `data/config.json`:
   ```json
   {
     "title": "Your Secret Santa Title",
     "adminPasswords": ["family1-password", "family2-password", "friends-password"]
   }
   ```
   
   > 💡 **Tip**: Each password creates a separate, isolated instance for different families or groups

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (backend)

### Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   NODE_ENV=production npm start
   ```

3. **Configure your web server** (nginx example)
   ```nginx
   server {
       listen 443 ssl;
       server_name santa.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 👤 User Roles

### 🔑 Admin User

Admins have full control over their Secret Santa instance and can:

- **Create Groups** - Set up new Secret Santa groups with custom names and budgets
- **Manage Participants** - Add participants and generate their unique access links
- **Set Exclusions** - Define who shouldn't draw whom (e.g., couples, siblings)
- **Trigger Draws** - Run the Secret Santa algorithm when ready
- **View All Results** - See the complete matching for the entire group
- **Edit Details** - Modify wishlists, dislikes, and participant information
- **Reset Groups** - Clear draws and start over if needed

**Accessing Admin Panel:**
1. Navigate to `/admin`
2. Enter your admin password
3. Manage all groups and participants for your instance

### 🎄 Regular User (Participant)

Participants have a personalized, simple experience:

- **Secure Access** - Each participant gets a unique recovery code/link
- **Profile Management** - Update display name, wishlist, and dislikes
- **View Assignment** - See who they're buying for (after draw is complete)
- **See Recipient's Wishlist** - View their recipient's gift preferences and dislikes
- **Join Multiple Groups** - Participate in several Secret Santa exchanges
- **Privacy** - Can only see their own assignment, not others'

**Accessing as Participant:**
1. Use the unique link provided by your admin, OR
2. Enter your recovery code on the home page

## 🏗️ Architecture

### Multi-Tenant Design

The application uses a unique multi-tenant architecture:

```
data/
├── config.json                    # Admin passwords and global config
├── [hash1]_groups.json           # Groups for admin password 1
├── [hash1]_users.json            # Users for admin password 1
├── [hash2]_groups.json           # Groups for admin password 2
├── [hash2]_users.json            # Users for admin password 2
└── ...
```

- Each admin password is hashed (SHA-256) to create a unique identifier
- Data files are completely isolated between different admin passwords
- No cross-contamination between families or groups
- Secure and scalable for unlimited tenants

### Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Vite

**Backend:**
- Node.js + Express
- Session-based authentication
- File-based JSON storage (easily upgradeable to database)

## 🎯 Use Cases

### Perfect for:
- **Family Gatherings** - Organize your family's annual gift exchange
- **Office Parties** - Manage workplace Secret Santa events
- **Friend Groups** - Coordinate gift exchanges with friends
- **Multiple Events** - Host several independent Secret Santa groups simultaneously
- **Large Organizations** - Different departments can have separate instances

### Example Scenario:

You're hosting Secret Santa for:
1. Your immediate family (password: `macnamara2024`)
2. Your extended family (password: `cousins2024`)
3. Your office team (password: `acme-corp-2024`)

Each group is completely separate with its own participants, groups, and data!

## 🔒 Security Features

- **Password-based admin access** - Only authorized users can manage groups
- **Unique recovery codes** - Secure, memorable 6-character codes for participants
- **Session management** - Secure cookie-based sessions
- **Data isolation** - Complete separation between different admin instances
- **HTTPS support** - Production-ready SSL configuration
- **No database required** - Simple file-based storage (easily auditable)

## 📝 Configuration

### Environment Variables

```bash
# Server port (default: 3000)
PORT=3000

# Environment mode
NODE_ENV=production

# Session secret (change in production!)
SESSION_SECRET=your-super-secret-session-key
```

### Config File (`data/config.json`)

```json
{
  "title": "Macnamara's Secret Santa!",
  "adminPasswords": [
    "password1",
    "password2",
    "password3"
  ]
}
```

## 🛠️ Development

### Project Structure

```
secret-santa/
├── src/                    # React frontend source
│   ├── App.jsx            # Main application component
│   ├── index.css          # Tailwind styles
│   └── main.jsx           # React entry point
├── server.js              # Express backend
├── data/                  # Data storage directory
├── dist/                  # Production build output
└── public/                # Static assets
```

### Available Scripts

```bash
npm run dev          # Start development servers (frontend + backend)
npm run build        # Build production frontend
npm start            # Start production server
npm run preview      # Preview production build
```

## 🎨 Customization

### Changing the Theme

Edit `src/index.css` to customize colors, fonts, and animations:

```css
:root {
  --christmas-red: #c41e3a;
  --christmas-green: #165b33;
  --gold: #ffd700;
  /* Add your custom colors */
}
```

### Modifying the Title

Update `data/config.json`:

```json
{
  "title": "Your Custom Title Here!"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own Secret Santa events!

## 🎄 Happy Holidays!

May your Secret Santa be merry and bright! 🎅✨

---

**Questions or Issues?** Open an issue on GitHub or contact the maintainer.
