const { test } = require('tap')
const requireInject = require('require-inject')

let readOpts = null
let readResult = null
const read = (opts, cb) => {
  readOpts = opts
  return cb(null, readResult)
}

const npmlog = {
  clearProgress: () => {},
  showProgress: () => {},
}

const npmUserValidate = {
  username: (username) => {
    if (username === 'invalid')
      return new Error('invalid username')

    return null
  },
  email: (email) => {
    if (email.startsWith('invalid'))
      return new Error('invalid email')

    return null
  },
}

const readUserInfo = requireInject('../../../lib/utils/read-user-info.js', {
  read,
  npmlog,
  'npm-user-validate': npmUserValidate,
})

test('otp', async (t) => {
  readResult = '1234'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })
  const result = await readUserInfo.otp()
  t.equal(result, '1234', 'received the otp')
})

test('password', async (t) => {
  readResult = 'password'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })
  const result = await readUserInfo.password()
  t.equal(result, 'password', 'received the password')
  t.match(readOpts, {
    silent: true,
  }, 'got the correct options')
})

test('username', async (t) => {
  readResult = 'username'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })
  const result = await readUserInfo.username()
  t.equal(result, 'username', 'received the username')
})

test('username - invalid warns and retries', async (t) => {
  readResult = 'invalid'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })

  let logMsg
  const log = {
    warn: (msg) => logMsg = msg,
  }
  const pResult = readUserInfo.username(null, null, { log })
  // have to swap it to a valid username after execution starts
  // or it will loop forever
  readResult = 'valid'
  const result = await pResult
  t.equal(result, 'valid', 'received the username')
  t.equal(logMsg, 'invalid username')
})

test('email', async (t) => {
  readResult = 'foo@bar.baz'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })
  const result = await readUserInfo.email()
  t.equal(result, 'foo@bar.baz', 'received the email')
})

test('email - invalid warns and retries', async (t) => {
  readResult = 'invalid@bar.baz'
  t.teardown(() => {
    readResult = null
    readOpts = null
  })

  let logMsg
  const log = {
    warn: (msg) => logMsg = msg,
  }
  const pResult = readUserInfo.email(null, null, { log })
  readResult = 'foo@bar.baz'
  const result = await pResult
  t.equal(result, 'foo@bar.baz', 'received the email')
  t.equal(logMsg, 'invalid email')
})
