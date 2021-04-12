const nodemailer = require('nodemailer')
const transporterConfig = require('./transporterConfig')
const setResetConfig = require('./reset')

module.exports = async function(emailTo, token) {
  try {
    const transport = nodemailer.createTransport(transporterConfig)
    const resetConfig = setResetConfig(emailTo, token)
    const result = await transport.sendMail(resetConfig)
    return result
  } catch (error) {
    return error
  }
}