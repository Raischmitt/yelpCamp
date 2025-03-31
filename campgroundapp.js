if(process.env.NODE_END !== "production") {
  require('dotenv').config();
}


console.log(process.env.SECRET)
console.log(process.env.API_KEY)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverrride = require('method-override');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const usersRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log("database connected success")
  })
  .catch(err => {
    console.log("erro connecting to database", err);
  });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverrride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
  secret: 'thisshouldbeabeabettersecrect!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }

}


app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
  res.render('home')
});

app.all('*', (req, res, next) => {
  next(new ExpressError('page not found', 404))
});

app.use((err, req, res, nest) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no, something went wrong'
  res.status(statusCode).render('error', { err })
});

app.listen(3000, () => {
  console.log('serving on port 3000')
})

