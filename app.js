const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');


const app = express();

// TEMPLATING ENGINE
app.set('view engine', 'ejs');
app.set('views', './views');

// IMPORT ROUTES
const adminRoutes  = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// PASSING ROUTES
app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);

// kind of 'catch-all' middleware
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '' });
})

app.listen(3000);
