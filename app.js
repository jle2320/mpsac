require('dotenv').config(); // LOAD HERE (top!)

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const app = express();
app.set('trust proxy', 1);
// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://code.jquery.com",
          "https://cdn.datatables.net"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.datatables.net"
        ],

        connectSrc: [
          "'self'",
          "https://cdn.jsdelivr.net"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],

        objectSrc: ["'none'"],

        upgradeInsecureRequests: []
      }
    }
  })
);
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
}));

// Body parser
app.use(express.urlencoded({ extended: true, limit: '10mb'  }));
app.use(express.json({ limit: '10mb' }));

app.use(session({
    secret: 'your_organic_farm_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        maxAge: 3600000 
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const webRoutes = require('./routes/web');
app.use('/', webRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});