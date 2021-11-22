if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const itemRouter = require('./routes/items')


// Public Folder
app.use("/public", express.static('public')); 
app.use(express.static('public'))

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

// Excluding the layouts from the web pages
app.set('layout landing', false); 
app.set('layout index', false); 
app.set('layout login', false); 
app.set('layout register', false); 

// Express body parser
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
// app.use(bodyParser.urlencoded({ extended: false }));

// Testing
// app.use(bodyParser.json({
//   limit: '50mb'
// }));

// app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  // parameterLimit: 100000,
  extended: false 
}));
// Testing

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Method Override
app.use(methodOverride('_method'))

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
// app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// Product Routes
app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/items', itemRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));