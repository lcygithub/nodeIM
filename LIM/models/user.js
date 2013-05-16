var mongodb = require('./db');

function User(user) {
  this.name = user.name,
  this.password = user.password,
  this.friends = []
};
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    password: this.password,
    friends: []
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      collection.ensureIndex('name', {unique: true});
      // 寫入 user 文檔
      collection.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.savefriend = function update(username, friendname, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({"name":username,"friends":{"$elemMatch":{"name":friendname}}}, function(err, user) {
        console.log("findone:");
        console.log(user);
        // mongodb.close();
        if (!user) {
          collection.update({"name":username}, {"$push":{"friends":{"name":friendname,"msg":[]}}}, function(err) {
            mongodb.close();
            if (err) {
              console.log("db failed!");
              callback(err, null);
            } else {
              console.log("find success!");
              callback(err);
            }
          });
        } else {
          mongodb.close();
          callback(exit=true);
        }
      });
      
    });
  });
}

User.insertmsg = function insert(username, friend, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      mongodb.close();
      callback(err);
    }
    db.collection("users", function(err, collection) {
      if (err) {
        mongodb.close();
        callback(err);
      }
      collection.update({"name":username,"friends":{"$elemMatch":{"name":friend.name}}},{"$push":{"friends.$.msg":friend.msg}}, function(err){
        mongodb.close();
        if (!err) {
          console.log("db success!")
          callback(err);
        } else {
          console.log("db failed!")
          callback(err);
        }
      });
    });

  });
}

User.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username}, function(err, doc) {
        mongodb.close();
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

User.getfriend = function getf(username, callback) {
  console.log("getfriend");
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username},{"friends.name":1}, function(err, doc) {
          mongodb.close();
          console.log(doc.friends);
          callback(err, doc.friends);
      });
    });
  });
}