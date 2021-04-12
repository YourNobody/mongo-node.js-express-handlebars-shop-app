const keys = require('../keys/index')

module.exports = function(emailTo, token) {
  return {
    to: emailTo,
    from: keys.EMAIL_FROM,
    subject: 'Восстановление пароля',
    html: `
      <h2>Процедура восстановления пароля</h2>
      <p>Для того чтобы изменить существующий пароль перейдите по ссылке: <a href="${keys.BASE_URL}/auth/password/${token}">Ссылка</a></p>
      <hr/>
      <a href="${keys.BASE_URL}">Магазин Курсов</a>
    `
  }
}