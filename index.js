const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');


const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

app.use(bodyParser.json());

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
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
    Movies.findOne( { Title: req.params.title })
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne( { 'Genre.Name': req.params.genreName })
    .then((movies) => {
        res.status(201).json(movies.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET director by name
app.get('/movies/director/:directorName', (req, res) => {
    Movies.findOne( { 'Director.Name': req.params.directorName })
    .then((movies) => {
        res.status(201).json(movies.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET list of all users
app.get('/users', (req, res) => {
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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
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
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, 
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser); 
        }
    });
});

//POST new favorite movie
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

