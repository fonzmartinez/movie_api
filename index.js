const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

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
    }
];

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to Totally Rad Flix!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(myMovies);
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