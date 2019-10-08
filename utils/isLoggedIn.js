function isLoggedIn(req, res) {
    console.log(req.route.path)
    console.log(req.originalUrl)

    if (req.originalUrl === '/register' && !req.session.user) {
        res.render('register', { success_msg: false, error_msg: false })
    } else if (req.originalUrl === '/users/login' && !req.session.user) {
        res.render('login', { success_msg: false, error_msg: false })
    } else {
        res.redirect('/show-me-my-page')
    }
}

module.exports = isLoggedIn