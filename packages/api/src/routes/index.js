module.exports.setupRoutes = app => {
  require('./legends')(app)
  require('./ranking')(app)
  require('./weapons')(app)
  require('./patches')(app)
  require('./random_fact')(app)
  require('./health')(app)
}
