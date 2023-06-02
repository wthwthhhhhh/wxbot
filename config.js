const local = {
  port: 3000,
  host: '0.0.0.0',
  mongoUrl: 'mongodb://localhost:27017/wxrobot',
  secret: '123456',
  tianApiKey: '06177fbc828b713ac9694c1960b8f02d',
  crmUrl: 'http://192.168.3.172:20001/'
}
const development = {
}
const production = {
  port: 8081,
  mongoUrl:'mongodb://username:password@ip:port/wxrobot',
}
let config = Object.assign(local, development)
if (process.env.NODE_ENV == 'production') {
  config = Object.assign(local, production)
}
module.exports = config
