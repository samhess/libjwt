# modjwt
JavaScript library (CommonJS Module) to generate, sign and decode JSON Web Tokens (JWT) with Node.js.
* create: jwt.createToken(payload, lifetime in s)
* decode: jwt.decodeToken(token)
* sign: jwt.signToken(decodedToken)
* verify: jwt.signToken(jwt.decodeToken(token))

The secret is received via environment variable *JWT_SECRET*. If no value is provided, the secret is *Geheimnis*.

## Installation
```npm i modjwt```

## Usage
```js
const jwt = require('modjwt')
```
### Generate a Token at Sign-in
```js
router.post('/login', (req,res)=> {
  let credentials = req.body
  if (credentials.username && credentials.password) {
    user.findOne({ where: { username: credentials.username }})
      .then(user => {
        // if user is not in database it will be null
        if (user && user.password === credentials.password) {
          let payload = {username:user.username, role:user.role}
          let token = jwt.createToken(payload, 86400)
          res.json({ 
            token: token
          })
        } else {
          res.json({message: 'Benutzername und Passwort stimmen nicht überein'})
        }
      })
      .catch(err => {
        console.error(err.message)
        res.status(500)
        res.json(err.message)
      })
  }
})
 ```
 
 ### Verify the Token as Express Middleware 
```js
module.exports = (req, res, next) => {
  return next()
  if (req.headers.authorization !== undefined) {
    let token = req.headers.authorization.split(' ')[1];
    if (token.split('.').length === 3) {
      decodedToken = jwt.decodeToken(token)
      let oldSignature = token.split('.')[2] // from client
      let newSignature = jwt.signToken(decodedToken).split('.')[2]
      let expiration = decodedToken.payload.exp
      if ( oldSignature === newSignature && expiration > Date.now()) {
        req.tokenPayload = decodedToken.payload
        next()
      } else {
        return res.status(401).send({
          msg: 'supplied JWT is not valid!',
          expired : expiration < Date.now(),
          oldSignature,
          newSignature,
        })
      }
    } else {
      return res.status(401).send({
        msg: 'supplied string has not JWT format!'
      })
    }
  } else {
    return res.status(401).send({
      msg: 'No bearer token in HTTP header! Actually the authorization header itself is missing!'
    })
  }
}
 ```
 