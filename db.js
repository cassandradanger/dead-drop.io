//
// NOT DONE YET
//
require('sugar')
var mongo = require('mongoskin')
var request = require('request')
var async = require('async')

var DB = function(dbname){
  this.db = mongo.db("mongodb://localhost:27017/"+ dbname, {native_parser:true});
  this.db.bind('share')
  this.db.bind('recover')
}


//
// Log some info whenever a user makes a share
// also, update the recovery.lastShare info
//
DB.prototype.saveShare = function(req, data){
  var self = this;
  var share = {
    url: '',
    type: '',
    mediatype: '',
    mimetype: '',
    dropped: false,
    user_agent: req.headers['user-agent'],
    ip: req.connection.remoteAddress || 0,
    created: Date.now()
  }

  Object.merge(share, data);
  var lastUrl = share.url;
  delete share.url;

  async.parallel([
    function(done){
      self.db.share.insert(share, done)
    },
    function(done){
      var doc = {
        lastUrl: lastUrl, 
        updated: Date.now()
      }
      self.db.recover.update({_id: 'lastUrl'}, {$set: doc}, {upsert: true}, done)
    }
  ], function(err, results){
    if (err){
      console.log(err);
    }
  })
}

module.exports = DB;
