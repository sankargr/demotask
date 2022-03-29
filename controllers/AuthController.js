const mongoose = require('mongoose')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const becryptjs = require('bcryptjs')
const {
    Validator
} = require('node-input-validator');

const niv = require('node-input-validator');

const CommonLib = require("../components/CommonLib");
var jwt_config = {
    "secret": "SANKAR",
    "refreshTokenSecret": "SANKAR",
    "port": 3000,
    "refreshTokenLife": 86400,
    "tokenLife": 86400
}

const nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "1d0fea17a4ebda",
      pass: "ba742e9b4ae047"
    }
});

module.exports = {
    signup: function (req, res) {
        if (req.method == 'POST') {
            postData = req.body;            
            const v = new Validator(postData, {
                name: 'required',
                email: 'required',  
                mobile: 'required',                
                password: 'required',
            });    
            v.check().then((matched) => {
                if (!matched) {
                    res.status(400).json(CommonLib.errorFormat(v))
                } else {
                    User.findOne({
                        $or: [{email: postData.email}, {mobile: postData.mobile}]               
                    }, function (err, item) {                        
                        if (item && item._id) {
                            var data = {
                                status: 422,
                                "msg": 'Email or Mobile Already Exists...',
                            };
                            res.status(200).json(data);
                        }
                        else
                        {
                            becryptjs.hash(req.body.password, 10, function (err, hash) {
                                if (err) {
                                    console.log(err)
                                    var data = {
                                        status: 422,
                                        "msg": 'Something went Wrong...',
                                    };
                                    res.status(422).json(data);
                                } else {
                                    var user = new User({
                                        name: req.body.name,
                                        email: req.body.email,
                                        mobile: req.body.mobile,
                                        password: hash,                                        
                                        status: 1,
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                    })
                                    user.save()
                                        .then((resp) => {
                                            var data = {
                                                status: 200,
                                                "msg": 'New Account Created Successfully...',
                                            };
                                            res.status(200).json(data);
                                        })
                                        .catch((err) => {
                                            console.log(err)
                                            var data = {
                                                status: 422,
                                                "msg": 'Something went Wrong...',
                                            };
                                            res.status(422).json(data);
                                        })
                                }
                            });
                        }
                    })

                    
                }
            })
        } else {
            var data = {
                "msg": 'Invalid Method',
            };
            res.status(422).json(data);
        }
    },
    login: function (req, res) {
        if (req.method == 'POST') {
            postData = req.body;
            const v = new Validator(postData, {
                username: 'required',
                password: 'required',
            });
            v.check().then((matched) => {
                if (!matched) {
                    res.status(400).json(CommonLib.errorFormat(v))
                } else {                    
                    User.findOne({                        
                        $or: [{email: postData.username}, {mobile: postData.username}]                          
                    }, function (err, item) {                        
                        if (item && item._id) {

                            becryptjs.compare(postData.password, item.password, function(err, resp) {
                                if(err)
                                {
                                    console.log(err)
                                }
                                else
                                {
                                    if(resp === false)
                                    {
                                        var data = {
                                            status: 422,                                            
                                            "msg": 'Invalid Password ...',
                                        };
                                        res.status(422).json(data);
                                    }
                                    else
                                    {
                                        let token = jwt.sign({
                                            username: item._id
                                        }, jwt_config.secret, {
                                            expiresIn: Math.floor(Date.now() / 1000) + jwt_config.tokenLife
                                        });
                                        var data = {
                                            status: 200,
                                            token: token,                                    
                                            username: item.name,
                                            "msg": 'Login In Successfullly ...',
                                        };
                                        res.status(200).json(data);
                                    }                                    
                                    
                                }
                            });

                            
                            
                        } else {
                            var data = {
                                status: 422,
                                "msg": 'Invalid User Name ...',
                            };
                            res.status(200).json(data);
                        }
                    })
                }
            })
        } else {
            var data = {
                "msg": 'Invalid Method',
            };
            res.status(422).json(data);
        }
    },

    changePwd: function (req, res) {
        if (req.method == 'POST') {
            postData = req.body;
            const v = new Validator(postData, {
                current_pwd: 'required',
                new_pwd: 'required',
                confirm_pwd: 'required|same:new_pwd',
            });
            v.check().then((matched) => {
                if (!matched) {
                    res.status(400).json(CommonLib.errorFormat(v))
                } else {
                  
                    let userId =''
                    if(req.user && req.user.username)
                    {
                        userId = req.user.username
                    }                                                       
                    User.findOne({                        
                        _id:userId                          
                    }, function (err, item) {                        
                        if (item && item._id) {

                            becryptjs.compare(postData.current_pwd, item.password, function(err, resp) {
                                if(err)
                                {
                                    console.log(err)
                                }
                                else
                                {
                                    if(resp===false)
                                    {
                                        var data = {
                                            status: 422,
                                            "msg": 'Invalid Password ...',
                                        };
                                        res.status(200).json(data);
                                    }
                                    else
                                    {
                                        becryptjs.hash(req.body.new_pwd, 10, function (err, hash) {
                                            if (err) {
                                                console.log(err)
                                                var data = {
                                                    status: 422,
                                                    "msg": 'Something went Wrong...',
                                                };
                                                res.status(422).json(data);
                                            } else {
        
                                                var payload = {                                    
                                                    password: hash,                        
                                                    updatedAt: new Date(),
                                                }
                                                User.updateOne({
                                                    _id: item._id
                                                }, {
                                                    $set: payload
                                                })
                                                .then(result => {
                                                    if (result) {
                                                        var data = {
                                                            status: 200,                                  
                                                            "msg": 'Password Updated Successfully ...',
                                                        };
                                                        res.status(200).json(data);
                                                    } else {
                                                        let data = {
                                                            msg: 'Something Went Wrong...',
                                                            status: 422
                                                        }
                                                        res.status(422).json(data);
                                                    }
                                                })
        
                                            }
                                        });
                                    }
                                }
                            })                            
                        } else {
                            var data = {
                                status: 422,
                                "msg": 'Invalid Token ...',
                            };
                            res.status(200).json(data);
                        }
                    })
                }
            })
        } else {
            var data = {
                "msg": 'Invalid Method',
            };
            res.status(422).json(data);
        }
    },

    forgotPwd: function (req, res) {
        if (req.method == 'POST') {
            postData = req.body;
            const v = new Validator(postData, {                
                username: 'required',                
            });
            v.check().then((matched) => {
                if (!matched) {
                    res.status(400).json(CommonLib.errorFormat(v))
                } else {                    
                    User.findOne({                        
                        $or: [{email: postData.username}, {mobile: postData.username}]                     
                    }, function (err, item) {                        
                        if (item && item._id) {
                            let url = 'http://localhost:3000/auth/resetPwd?userId='+item._id
                            message = {
                                from: "ggrvbm@gmail.com",
                                to: item.email,
                                subject: "Reset Password Request",
                                text: url
                           }
                           transport.sendMail(message, function(err, info) {
                                if (err) {
                                  console.log(err)
                                    let data = {
                                        msg: 'Something Went Wrong...',
                                        status: 422
                                    }
                                    res.status(422).json(data);
                                } else {
                                  console.log(info);
                                  var data = {
                                        status: 200,                                  
                                        "msg": 'Reset Password Link Send Your Mail id...',
                                    };
                                    res.status(200).json(data);
                                }
                            })

                                                    
                        } else {
                            var data = {
                                status: 422,
                                "msg": 'Invalid Username ...',
                            };
                            res.status(200).json(data);
                        }
                    })
                }
            })
        } else {
            var data = {
                "msg": 'Invalid Method',
            };
            res.status(422).json(data);
        }
    },

    resetPwd: function (req, res) {
        if (req.method == 'POST') {
            postData = req.body;
            const v = new Validator(postData, {                
                new_pwd: 'required',
                confirm_pwd: 'required|same:new_pwd',
            });
            v.check().then((matched) => {
                if (!matched) {
                    res.status(400).json(CommonLib.errorFormat(v))
                } else {
                   
                    User.findOne({                        
                        _id:req.query.userId                          
                    }, function (err, item) {                        
                        if (item && item._id) {

                            becryptjs.hash(req.body.new_pwd, 10, function (err, hash) {
                                if (err) {
                                    console.log(err)
                                    var data = {
                                        status: 422,
                                        "msg": 'Something went Wrong...',
                                    };
                                    res.status(422).json(data);
                                } else {
                                    var payload = {                                    
                                        password: hash,                        
                                        updatedAt: new Date(),
                                    }
                                    User.updateOne({
                                        _id: item._id
                                    }, {
                                        $set: payload
                                    })
                                    .then(result => {
                                        if (result) {
                                            var data = {
                                                status: 200,                                  
                                                "msg": 'Password Updated Successfully ...',
                                            };
                                            res.status(200).json(data);
                                        } else {
                                            let data = {
                                                msg: 'Something Went Wrong...',
                                                status: 422
                                            }
                                            res.status(422).json(data);
                                        }
                                    })

                                }
                            });                         
                        } else {
                            var data = {
                                status: 422,
                                "msg": 'Invalid Access ...',
                            };
                            res.status(200).json(data);
                        }
                    })
                }
            })
        } else {
            var data = {
                "msg": 'Invalid Method',
            };
            res.status(422).json(data);
        }
    },

}