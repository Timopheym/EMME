(function (exports) {

   "use strict";

 //   var crypto = require('crypto'); //!!!! I DON'T USE IT!!!!((((
    var mongoose = require('mongoose');

    exports.init = function (app) {

    app.post('/register', function (req, res) {
      var name  = req.body.usernamesignup,
          email = req.body.emailsignup,
          pass  = req.body.passwordsignup,
          pass2  = req.body.passwordsignup_confirm;
      var user = mongoose.model('User');
      var u = new user();
      u.name = name;
      u.email = email;
      u.password = pass;
      u.save(function (err) {
          console.log('user '+name+' has been registred, error: ', err);
          req.session.username = name;
          res.render('main', {
                'title': '.:EMME:.'
            });
      });
    });
    app.post('/login', function (req, res) {
      var name = req.body.username,
          pass = req.body.password;
        var user = mongoose.model('User');
        user.findOne({name: name}, function (err, usr) {
            console.log(usr);
            if (usr !== null && usr.password == pass){
                req.session.username = usr.name;
                res.render('main', {
                    'title': '.:EMME:.'
                });
            }
            else{
                res.render('index', {
                    'title': 'Войти в систему'
                });
            }
        });
    });
    app.get('/logout', function (req, res) {
        req.session.username = undefined;
        res.render('index', {
            'title': 'Войти в систему'
        });
    });
    app.get('/', function (req, res) {
      console.log(req.session,'<---session');
      if (req.session.username !== undefined)
      {
          res.render('main', {
          'title': '.:EMME:.'
      });
      }
      else{
          res.render('index', {
              'title': 'Войти в систему'
          });
      }

    });
    app.get('*', function (req, res) {
      res.render('404', {
        'title': 'Страница не найдена'
      });
    });

  };

}(exports));