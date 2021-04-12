const keys = require('../keys/index')
const {google} = require('googleapis')

const oAuth2Client = new google.auth.OAuth2(keys.CLIENT_ID, keys.CLIENT_SECRET, keys.REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: keys.REFRESH_TOKEN})

let accessToken

void async function() {
  try {
    accessToken = await oAuth2Client.getAccessToken()
  } catch (err) {
    console.error(err)
  }
}()

const config = {
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: keys.EMAIL_FROM,
    clientId: keys.CLIENT_ID,
    clientSecret: keys.CLIENT_SECRET,
    refreshToken: keys.REFRESH_TOKEN,
    accessToken
  }
}

module.exports = config