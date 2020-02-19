var mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName":  {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }]
  });

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://admin:admin123@ds237723.mlab.com:37723/user_db");

        db.on('error', (err)=> {
            reject(err);
        });
        db.once('open', ()=> {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password !== userData.password2){
            reject("Passwords do not match");
        }
        else {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password");
                    } 
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if(err) {
                                if (err == 11000) { reject("User Name already taken"); }
                                else { reject("There was an error creating the user: " + err); }
                            } 
                            else {
                            resolve();
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports.checkUser = function(userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName 
        }).then(function (users) {

            bcrypt.compare(userData.password, users[0].password).then((res) => {
            if (res) {              
                    users[0].loginHistory.push({dateTime:(new Date()).toString(), userAgent: userData.userAgent});
                    User.update( {userName: users[0].userName},
                        { $set: { loginHistory: users[0].loginHistory } 
                    }).exec().then(() => {
                        resolve(users[0]);
                    }).catch((err) => {
                        reject("There was an error verifying the user: " + err); 
                    });
            }
            else reject("Unable to find user:" + userData.userName);                     
                })
                .catch((err) => {
                    reject("Unable to find user: " + userData.userName);
                })    
        }).catch(() => {
            reject("Unable to find user: " + userData.userName);
        });     
    });
};

module.exports.message = function(msg) {

};
