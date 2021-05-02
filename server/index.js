const express = require('express')
const mysql = require('mysql')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    key: 'userId',
    secret: 'subscribe',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))
app.use(express.json())
const db = mysql.createConnection({
    user: 'root',
    hotst: 'localhost',
    password: 'admin',
    database: 'loginsystem'
})
app.get('/', (req, res) => {
    res.send('hi')
})
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }
        db.query('INSERT INTO users (username, password) VALUES (?,?)', [username, hash], (err, result) => {
            console.log(result);
        })
    })
})
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"]
    if (!token) {
        res.send('no token')
    } else {
        jwt.verify(token, 'jwtSecret', (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: 'Failed' })
            } else {
                req.userId = decoded.id
                next()
            }
        })
    }
}
app.get('/isUserAuth', verifyJWT, (req, res) => {
    res.send('You are authenticated!')
})
app.get('/login', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    } else {
        res.send({ loggedIn: false })
    }
})
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) {
            res.send(err)
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (error, response) => {
                if (response) {
                    req.session.user = result
                    const id = result[0].id
                    const token = jwt.sign({ id }, 'jwtSecret', {
                        expiresIn: 300,
                    })
                    res.json({ auth: true, token: token, result: result })
                } else {
                    res.json({ auth: false, message: 'wrong username/password' })
                }
            })
        } else {
            res.json({ auth: false, message: 'no user exists' })
        }
    }

    )
})
app.listen(3001, () => {
    console.log('server is running');
})