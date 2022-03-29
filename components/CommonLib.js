"use strict";
// Valiadte form inputs
const log=console.log;
const jwt = require('jsonwebtoken')

module.exports = {
    
    verifyToken: function async(req, res, next) {
		const token =  req.body.token || req.query.token || req.headers["access-token"];
        if (!token) {
            let data = {
                msg : 'A token is required for authentication',                
            }
            return res.status(302).json(data);
        }
        try {
            const decoded = jwt.verify(token, 'SANKAR');
            req.user = decoded;

            console.log(req.user)
            //console.log(decoded)
        } catch (err) {
            console.log(err)
            let data = {
                msg : 'Invalid Token',               
            }
            return res.status(302).json(data);            
        }
        return next();
	},

	errorFormat: function (data) {
		let errors = {
		}
		if(data.errors)	
		{
			let list ={}
			Object.keys(data.errors).forEach(function (key) {
				if(!list[key])
				{
					if(data.errors[key].rule !='sometimes')
					{
						list[key]=data.errors[key].message
					}
					
				}				
			});				
				errors.errors=list;
				errors.status = 400;			
		}
	   return errors;
	},
}
