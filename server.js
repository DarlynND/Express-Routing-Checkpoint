const express = require('express');
const path = require('path');

const app = express();

// View engine & static assets
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

/**
 * Working-hours middleware
 * Dakar time is UTC+0 all year, so we can safely use UTC clock.
 * Allowed: Monday(1)–Friday(5), 09:00–17:00 (17:00 exclusive).
 */
function workingHoursOnly(req, res, next) {
  const now = new Date();
  const day = now.getUTCDay();     // 0=Sun ... 6=Sat
  const hour = now.getUTCHours();  // 0..23
  const isWeekday = day >= 1 && day <= 5;
  const isWorkingTime = hour >= 9 && hour < 17;

  if (isWeekday && isWorkingTime) {
    return next();
  }

  // Render a friendly "closed" page with local info
  return res.status(403).render('closed', {
    // Helpful details for users; shown in the view
    nowUtc: now.toUTCString(),
    windowText: 'Monday to Friday, 09:00–17:00 (Africa/Dakar)'
  });
}

// Apply middleware to the whole site
app.use(workingHoursOnly);

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/services', (req, res) => {
  res.render('services', { title: 'Our Services' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
