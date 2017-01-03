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

  constructor(context, secret, sessionDuration, refreshDuration) {
    this._context = context;
    this._secret = secret;
    this._sessionDuration = sessionDuration;
    this._refreshDuration = refreshDuration;
  }

  _createToken(content, options) {
    return new Promise((resolve, reject) => {
      jwt.sign(content, this._secret, options, (err, token) => {
        if(err) reject(err);
        else resolve(token);
      });
    });
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
    return {
      token: await this._createToken({userId: user.id}, {expiresIn: this._sessionDuration}),
      refreshToken: await this._createToken({userId: user.id}, {expiresIn: this._refreshDuration}),
    }
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
