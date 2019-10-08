const express = require('express')
const http    = require('http')
const path    = require('path')
const logger  = require('morgan')
const session = require('express-session')
const ejs = require('ejs')
const nodemailer = require('nodemailer')
const expressValidator = require('express-validator')
const cookieParser = require('cookie-parser')
const isLoggedIn = require('./utils/isLoggedIn')
const bodyParser = require('body-parser')
const authChecker = require('./utils/authChecker')

let app = express()



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//connect static folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({extended:true}))
app.use(logger('dev'))

// Built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser
app.use(express.json())




app.use(cookieParser('super-secret'))

let user = {}

app.use(session({
    secret: 'super-secret',
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        maxAge: 365 * 24 * 60 * 60 * 1000
    }
}))

app.use(expressValidator({
    errorFormatter: function(params, message, value) {
        let namespace = params.split('.')
        let root = namespace.shift()
        let formParam = root

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }

        return {
            params: formParam,
            message: message,
            value: value
        }
       
    }
}))




app.get('/', function (req, res, next) {

  
    console.log(req.session)
    console.log(req.cookies)
    
    if (req.query) {
        next()

        return
    }

    res.send('Hey folks!')
})

app.get('/test', function (req, res, next) {
   

    res.send(req.query)
    
})
app.get('/contact', function (req, res, next) {
   

    res.render('contact')
    
})


app.post('/', function (req, res, next) {
    res.send(req.body)
})

app.get('/show-me-my-page', function(req, res, next) {
    if (req.session.user) {
        res.render('index', { user: req.session.user })
    } else {
        res.render('index', { user: null })
    }
})

app.post('/users/login', function(req, res) {
    req.checkBody('email').isEmail().withMessage('Please enter a valid email')
    req.checkBody('password').equals(user.password).withMessage('Password does not match')

    let errors = req.validationErrors()

    if (errors) {
        res.render('login', { error_msg: true, errors: errors, success_msg: false })
    } else {
        req.session.user = req.body.email

        res.redirect('/show-me-my-page')
    }
})

app.post('/users/register', authChecker, function (req, res) {
    let errors = req.validationErrors()

    if (errors) {
        res.render('register', { error_msg: true, errors: errors })
    } else {
        user.email = req.body.email
        user.password = req.body.password

        req.session.user = req.body.email

        res.redirect('/show-me-my-page')
    }
})

app.get('/register', isLoggedIn, function (req, res, next) {
    res.render('register', { 'error_msg': false })
})

app.get('/users/login', isLoggedIn, function (req, res) {
    res.render('login', { success_msg: false, error_msg: false })
})

app.get('/users/logout', function (req, res) {
    req.session.destroy()

    res.redirect('/show-me-my-page')
})

app.get('/users/resetPassword', function (req, res) {
    res.render('reset', { error_msg: false, success_msg: false })
})

app.post('/users/contact', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'uli.orduno@codeimmersives.com',
            pass: 'password'
        }
    });
    
    const mailOptions = {
        from: 'uli.orduno@codeimmersives.com',
        to: 'uli.orduno@codeimmersives.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    }
    
    transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                        console.log(error);
                    } else {
                            console.log('Email sent: ' + info.response);
                        }
            })
    })
app.post('/users/resetPassword', function (req, res) {
    req.checkBody('password').notEmpty().withMessage('Password can not be empty')

    req.checkBody('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d`~!@#$%^&*()_+]{5,10}$/).withMessage('Minimum 5 and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character')

    req.checkBody('password').equals(req.body.password2).withMessage('Passwords does not match')

    

    let errors = req.validationErrors()

    if (errors) {
        res.render('reset', { error_msg: true, errors: errors, success_msg: false})
    } else {
        res.render('reset', { error_msg: false, success_msg: 'Worked'})
    }
})

app.get('*', function (req, res) {
    res.send('PAGE YOU ARE LOOKING FOR DOES NOT EXIST!')
})

let server = http.createServer(app)

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})