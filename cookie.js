const cookie = (req, res, next) => {    
    if (!req.cookies.retoken) {
        return res.redirect('/403')
    }

    // Almacenar la información de la cookie 'retoken' en req.userCookie
    req.userCookie = req.cookies.retoken;

    next();
}

module. exports = {
    cookie
}