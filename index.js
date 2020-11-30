const crypto = require('crypto')
const JWT_SECRET = process.env.JWT_SECRET || 'Geheimnis'

function createToken(payload, lifetime) {
  let token = { header:{}, payload:{} }
  token.header.alg = "HS256"
  token.header.typ = "JWT"
  token.payload = payload
  token.payload.iat = Date.now()
  token.payload.exp = token.payload.iat + 1000*lifetime
  return signToken(token)
}

function signToken(token) {
  headerEncoded = encodeBase64Url(JSON.stringify(token.header))
  payloadEncoded = encodeBase64Url(JSON.stringify(token.payload))

  let signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(headerEncoded + '.' + payloadEncoded )
    .digest('base64') // result is base64, but we need base64-url
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); 

  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

function encodeBase64Url(string) {
  let base64Url = Buffer.from(string).toString('base64')
    .replace(/\+/g, '-') // replace + with -
    .replace(/\//g, '_') // replace / with _
    .replace(/=+$/, ''); // remove = at the end
  return base64Url
}

function decodeToken(token) {
  let tokenParts = token.replace(/-/g, '+').replace(/_/g, '/').split('.')
  if (tokenParts.length === 3) { 
    let header = tokenParts[0]
    let payload = tokenParts[1]
    header = Buffer.from(header, 'base64').toString()
    payload = Buffer.from(payload, 'base64').toString()
    try {
      header = JSON.parse(header)
      payload = JSON.parse(payload)
      return {header,payload}
    } catch {
      throw Error('invalid token. Cannot convert it to JSON') 
    }
  } else {
    throw Error('invalid token format (3 dots required)')
  }
}

module.exports = {  
  createToken,
  signToken,
  decodeToken
}