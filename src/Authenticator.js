const jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  databaseHelpers = require('./databaseHelpers');

class UnauthorizedFailure {
  constructor(message) {
    this.message = message;
  }
}

class Authenticator {
  static UnauthorizedFailure = UnauthorizedFailure;

  constructor(context, secret, sessionDuration) {
    this._context = context;
    this._secret = secret;
    this._sessionDuration = sessionDuration;
  }

  async authenticate({email, password}) {
    //auth resolve token or reject unauthorized
    const failure = new UnauthorizedFailure('Authentication failed.');
    const user = await databaseHelpers.users.getByEmail(this._context, email);
    if(!user)
      throw failure;
    const passwordMatches = await this._passwordMatches(user.passwordHash, password);
    if(!passwordMatches)
      throw failure;
    return await new Promise((resolve, reject) => {
      jwt.sign({userId: user.id}, this._secret, {
        expiresIn: this._sessionDuration,
      }, (err, token) => {
        if(err) reject(err);
        else resolve(token);
      });
    });
  }

  confirmAuthenticated(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._secret, function(err, decoded) {
        if(err)
          reject(new UnauthorizedFailure('Unauthorized token.'));
        else
          resolve(decoded);
      });
    });
  }

  hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if(err) reject(err);
        else resolve(hash);
      });
    });
  }

  _passwordMatches(hash, input) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(input, hash, (err, result) => {
        if(err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Authenticator;
