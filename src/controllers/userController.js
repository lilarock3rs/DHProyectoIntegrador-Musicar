
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const { validationResult } = require('express-validator');


let userController = {
    cart: function (req, res) {
       return res.render("users/shopping-cart");
    },
    login: function (req, res) {
       return res.render("users/login");
    },

    loginProcess: (req, res) => {
        let userToLogin = User.findFirstByField("email", req.body.email);
       
        if (userToLogin) {
            let truePassword = bcryptjs.compareSync(req.body.password, userToLogin.password);
            
            if (truePassword) {
                delete userToLogin.password;
                req.session.userLogged = userToLogin;

                if (req.body.remember_name) {
                    res.cookie('userEmail', req.body.email, { maxAge: (1000 * 60) * 360 })
                }
             return res.redirect('/');
                
            }
            return res.render('users/login', {
                errors: {
                    email: {
                        msg: 'Email o contraseña invalidos'
                    }
                }
            })
        }

        return res.render('users/login', {
            errors: {
                email: {
                    msg: 'Email o contraseña invalidos'
                }
            }
        })
    },
    
    logout: (req, res) => {
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');
    },

    register: function (req, res) {
       return res.render("users/register");
    },
    store: function (req, res) {
        const resultValidation = validationResult(req);

        if (resultValidation.errors.length > 0) {
            return res.render('users/register', {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }
        let userInDB = User.findFirstByField('email', req.body.email);

        if (userInDB) {
            return res.render('users/login', {
                errors: {
                    email: {
                        msg: 'Este email ya está en uso'
                    }
                },
                oldData: req.body
            });
        }

        let userToCreate = {
            name: req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: bcryptjs.hashSync(req.body.password, 10),
            imageUser: req.file ? req.file.filename : null,
        }
        let userCreated = User.create(userToCreate);

      return  res.redirect('/');
    }
}

module.exports = userController;