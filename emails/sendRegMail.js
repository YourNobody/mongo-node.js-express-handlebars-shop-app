const nodemailer = require('nodemailer')
const transporterConfig = require('./transporterConfig')
const setRegistrationConfig = require('./registration')

module.exports = async function(emailTo) {
  try {
    const transport = nodemailer.createTransport(transporterConfig)
    const regConfig = setRegistrationConfig(emailTo)
    const result = await transport.sendMail(regConfig)
    return result
  } catch (err) {
    return err
  }
}