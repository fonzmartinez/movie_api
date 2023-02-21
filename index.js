const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Updated URI
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');


const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const cors = require('cors');
//app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


const { check, validationResult } = require('express-validator');


let users = [
  {
    id: 1,
    name: 'John',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Claire',
    favoriteMovies: ['Sixteen Candles']
  },
]

let myMovies = [
  {
    title: 'The Breakfast Club',
    director: {
      name: 'John Hughes'
    },
    genre: {
      name: 'comedy'
    },
    year: '1985'
  },
  {
    title: 'Valley Girl',
    director: {
      name: 'Martha Coolidge',
    },
    genre: {
      name: 'comedy'
    },
    year: '1983'
  },
  {
    title: 'Sixteen Candles',
    director: {
      name: 'John Hughes'
    },
    genre: {
      name: 'comedy'
    },
    year: '1984'
  },
  {
    title: 'Pretty In Pink',
    director: {
      name: 'Howard Deutch'
    },
    genre: {
      name: 'drama'
    },
    year: '1986'
  },
  {
    title: 'Ferris Bueller\'s Day Off',
    director: {
      name: 'John Hughes'
    },
    genre: {
      name: 'comedy'
    },
    year: '1986'
  },
  {
    title: 'St. Elmo\'s Fire',
    director: {
      name: 'Joel Schumacher'
    },
    genre: {
      name: 'drama'
    },
    year: '1985'
  },
  {
    title: 'Better Off Dead',
    director: {
      name: 'Savage Steve Holland'
    },
    genre: {
      name: 'comedy'
    },
    year: '1985'
  },
  {
    title: 'Fast Times At Ridgemont High',
    director: {
      name: 'Amy Heckerling'
    },
    genre: {
      name: 'comedy'
    },
    year: '1982'
  },
  {
    title: 'The Lost Boys',
    director: {
      name: 'Joel Schumacher'
    },
    genre: {
      name: 'horror'
    },
    year: '1987'
  },
  {
    title: 'WarGames',
    director: {
      name: 'John Badham'
    },
    genre: {
      name: 'thriller'
    },
    year: '1983'
  },
];

//GET requests


app.get('/', (req, res) => {
  res.send('Welcome to Totally Rad Flix!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//Requests for Mongoose

//GET list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movies) => {
      res.status(201).json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET director by name
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movies) => {
      res.status(201).json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET list of all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST create new users
app.post('/users',
  [
    check('Username', 'Username is required to contain a minimum of 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//PUT update user info
app.put('/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

//POST new favorite movie
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//DELETE movie title
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});


//DELETE existing user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});