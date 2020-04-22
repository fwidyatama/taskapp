const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) =>{
   try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'thisiscourse')
        const user = await User.findOne({_id:decoded._id,'tokens.token':token})


        if(!user){
            throw new error({error:'Please Authenticate first'})
        }
        req.token = token
        req.user = user
        next()



   } catch (error) {
       res.send(401).send({error:'Please Authenticate !'})
   }
}

module.exports = auth