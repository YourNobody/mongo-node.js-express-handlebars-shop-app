const keys = require('../keys/index')

module.exports = function(email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Аккаунт создан',
    html: `
      <h2>Успех!</h2>
      <p>Ваш аккаунт был успешно зарегистрирован - ${email}</з>
      <p>Приобретайте курсы от лучших разработчиков у нас!</p>
      <hr/>
      <a href="${keys.BASE_URL}">Магазин Курсов</ф>
    `
  }
}