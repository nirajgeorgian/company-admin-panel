module.exports = {
  database: 'mongodb://localhost:27017/mail',
  // database: 'mongodb://root:dodo@ds157980.mlab.com:57980/slickaccount',
  port: process.env.PORT || 3030,
  secretKey: 'ninni@N9',
  mailOption: {
    auth: {
      api_key: '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'
    }
  }
}
//mongodb://nirajgeorgian:passpass@ds161049.mlab.com:61049/slickaccount
