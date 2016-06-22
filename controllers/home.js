/**
 * Created by Robson on 06/04/2015.
 */
module.exports = function (app) {

    var local = app.locals;
    var unirest = require('unirest');

    local.email = {
        verify: function (email, callback) {
            unirest.get("https://pozzad-email-validator.p.mashape.com/emailvalidator/validateEmail/" + email)
                .header("X-Mashape-Key", global.mashape_key)
                .header("Accept", "application/json")
                .end(function (result) {
                    if (result.status == 200)
                        callback(result.body.isValid);
                });
        }
    };
    local.user = {
        register: function (user, callback) {
            //TODO remover gambiarra
            user.birthdate = user.birthdate
                .replace("--",'').split('-')
                .reverse().join('/');

            unirest.post(global.api_url + '/user/register')
                .headers({
                    'Authorization': global.app_key,
                    'Content-Type': 'application/json'
                }).send({user: user})
                .end(function (result) {
                    console.log('Register Status: ' + result.status);
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        },
        login: function (user, callback) {
            unirest.post(global.api_url + '/autenticate')
                .header("Authorization", global.app_key)
                .header("Content-Type", "application/json")
                .send(user)
                .end(function (result) {
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        },
        confirm: function (token, callback) {
            unirest.post(global.api_url + '/user/activate')
                .header("Authorization", global.app_key)
                .header("Content-Type", "application/json")
                .send({verification_token: token})
                .end(function (result) {
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        },
        forgot_password: function (email, callback) {
            unirest.post(global.api_url + '/forgot-password')
                .header("Authorization", global.app_key)
                .header("Content-Type", "application/json")
                .send({email: email})
                .end(function (result) {
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        },
        verify_password_token: function(token, callback){
            unirest.post(global.api_url + '/verify-password-token')
                .header("Authorization", global.app_key)
                .header("Content-Type", "application/json")
                .send({verification_token: token})
                .end(function(result){
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        },
        redefine_password : function(token, password, callback){
            unirest.post(global.api_url + '/redefine-password')
                .header("Authorization", global.app_key)
                .header("Content-Type", "application/json")
                .send({verification_token: token, new_password: password})
                .end(function(result){
                    if (result.status == 200) {
                        if (result.body.status === 'error')
                            callback(false, result.body);
                        else callback(true, result.body);
                    } else {
                        callback(false, {
                            status: "error",
                            message: "Falha de comunicação com o servidor."
                        })
                    }
                });
        }
    };

    var HomeController = {
        index: function (req, res) {
            if (req.session.user)
                res.render('app/home');
            else res.render('index');
        },
        register: function (req, res) {
            var user = req.body;
            if (user.password != user.conf_password) {
                req.flash('result', JSON.stringify({
                    status: "error",
                    message: "Senhas não correspondem.",
                    user: user
                }));
                res.redirect('/cadastro?r=true');
            }
            local.email.verify(user.email, function (isValid) {
                if (!isValid) {
                    req.flash('result', JSON.stringify({
                        status: "error",
                        message: "Email inválido.",
                        user: user
                    }));
                    res.redirect('/cadastro?r=true');
                } else {
                    delete user.conf_password;
                    var tmp_date = user.birthdate.split("/");
                    user.birthdate = [tmp_date[2], tmp_date[1], tmp_date[0]].join('-');
                    console.log(user);
                    local.user.register(user, function (success, data) {
                        req.flash('result', data);
                        if (!success)
                            res.redirect('/cadastro?r=true');
                        else res.redirect('/?r=true');
                    });
                }
            });
        },
        pageRegister: function (req, res) {
            if (req.query.r == 'true') {
                var r = req.flash('result')[0];
                console.log(r);
                if (r.status == 'error')
                    r.status = 'danger';
                res.render('public/register', {result: r});
            } else res.render('public/register');
        },
        login: function (req, res) {
            var user = req.body;
            local.email.verify(user.email, function (isValid) {
                if (!isValid) {
                    req.flash('result', JSON.stringify({
                        status: "error",
                        message: "Email inválido.",
                        user: user
                    }));
                    res.redirect('/login?r=true');
                } else {
                    local.user.login(user, function (success, data) {
                        if (!success) {
                            req.flash('result', JSON.stringify(result));
                            res.redirect('/login?r=true');
                        } else {
                            result.user.logged = true;
                            req.session('user', result.user);
                            res.redirect('/');
                        }
                    });
                }
            });
        },
        pageLogin: function (req, res) {
            if (req.query.r == 'true') {
                var r = JSON.parse(req.flash('result')[0]);
                if (r.status == 'error')
                    r.status = 'danger';
                res.render('public/login', {result: r});
            } else res.render('public/login');
        },
        confirmAccount: function (req, res) {
            local.user.confirm(req.query.token, function (success, data) {
                if (data.status == 'error')
                    data.status = 'danger';
                res.render('index', {result: data});
            });
        },
        forgotPassword: function (req, res) {
            if (req.body.email) {
                local.user.forgot_password(req.body.email, function (success, data) {
                    req.flash('status', data.status);
                    req.flash('message', data.message);
                    res.redirect('/redefinirsenha');
                });
            } else {
                req.flash('status', 'error');
                req.flash('message', 'Porfavor forneça um e-mail.');
                res.redirect('/redefinirsenha');
            }
        },
        pageRedefinePassword: function (req, res) {
            var status = req.flash('status');
            if (status.length > 0) {
                res.render('public/forgot_password', {result: {status: status[0], message: req.flash('message')[0]}})
            } else {
                if (req.query.token) {
                    //, {result: {status: 'error', message: 'Acesso Negado.'}}
                    local.verify_password_token(req.query.token, function(success, data){
                        if(success){
                            res.render('public/redefine_password',{result: {token: req.query.token}});
                        }else res.render('public/forgot_password', {result: data})
                    })
                } else res.render('public/forgot_password');
            }
        },
        redefinePassword: function(req, res){
            var body = req.body;
            if(body.pass != body.confPass){
                res.render('public/redefine_password',{
                    result: {
                        status: 'error',
                        message: 'A senhas não são iguais.',
                        token: body.token
                    }
                });
            }else{
                local.user.redefine_password(body.token, body.pass, function(success, data){
                    if(success){
                        req.flash('status', 'success');
                        req.flash('message', 'Senha alterada com sucesso');
                        res.redirect('/login')
                    }else{
                        res.render('public/redefine_password',{
                            result: {
                                status: data.status,
                                message: data.message,
                                token: body.token
                            }
                        });
                    }
                })
            }
        },
        logout: function (req, res) {
            req.session.destroy();
            res.redirect('/');
        }
    };
    return HomeController;
};