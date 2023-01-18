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

//READ 1
app.get('/movies', (req, res) => {
    res.status(200).json(myMovies);
})

//READ 2
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = myMovies.find( movie => movie.title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie')
    }
})

//READ 3
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = myMovies.find( movie => movie.genre.name === genreName ).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
})

//READ 4
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = myMovies.find( movie => movie.director.name === directorName ).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director')
    }
})

//CREATE 5 
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need name')
    }
})

//UPDATE 6
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
})

//CREATE 7
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE 8
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE 9
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);;
    } else {
        res.status(400).send('no such user')
    }
})


//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

//listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
