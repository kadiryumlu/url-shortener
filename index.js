require('dotenv').config();

const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Url = require('./models/Url');
const req = require('express/lib/request');
const SESSION_KEY = process.env.SESSION_KEY || 'my-super-secret-session-key';

app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(session({
    secret: SESSION_KEY,
    saveUninitialized: true,
    resave: false 
}));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// ROUTES
const SHORT_BASE_URL = process.env.SHORT_BASE_URL || 'http://localhost:8000';
const data = {
    text: "Your short link will be here",
    link: "#"
}
app.get('/', (req, res) => {
    res.render('index', {data: req.session.data ? req.session.data : data});
});

app.get('/error', (req, res) => {
    res.render('error', {error: req.session.error ? req.session.error : new Error('Unknown Error')});
});

app.get('/:short', async (req, res) => {
    const url = await Url.findOne({short: req.params.short});

    if(url == null){
        return res.sendStatus(404);
    }

    url.redirections +=1;
    url.save();

    res.redirect(url.full);
});

app.post('/api/urls', async (req, res) => {
    try{
        const url = await Url.create({full: req.body.full.trim()});
        req.session.data = {
            text: `${SHORT_BASE_URL}/${url.short}`,
            link: `${SHORT_BASE_URL}/${url.short}`
        }

        res.redirect('/');
    } catch(error) {
        req.session.error = error;

        res.redirect('/error');
    }
});

// MONGODB CONNECTION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/men-rest-api';
const mongodbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(MONGODB_URI, mongodbOptions)
.then(() => {
    console.log(`MongoDB is connected to ${MONGODB_URI}`);
})
.catch((err) => {
    console.log(`MongoDB is not conected to ${MONGODB_URI}!\nError: ${err}`);
});

// APP LISTEN
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});