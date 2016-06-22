/**
 * Created by Robson on 06/04/2015.
 */
module.exports = function (app) {

    var home = app.controllers.home;

    app.get('/', home.index);
    app.get('/cadastro', home.pageRegister);
    app.post('/cadastro', home.register);
    app.get('/login', home.pageLogin);
    app.post('/login', home.login);

    app.get('/confirmar', home.confirmAccount);

    app.get('/esquecisenha', home.pageRedefinePassword);
    app.post('/esquecisenha', home.forgotPassword);
    app.post('/redefinirsenha', home.redefinePassword);

    app.get('/logout', home.logout);

};