const express = require('express');
const app = express();
const User = require('../models/user');

const router = new express.Router();
const auth = require('../middleware/auth');


app.use(router);

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateToken()
        await user.save()
        res.status(200).send({user,token});
    }
    catch (e) {
        res.status(500).send(e);
    }

})

router.post('/users/login',async (req,res)=>{
    try {
        const user = await User.findbyCredential(req.body.email,req.body.password)
        const token = await user.generateToken()

        res.status(200).send({user,token});
        
    } catch (e) {
        console.log(e)
        res.status(401).send({error:e.message});
    }


})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send({message:'Successfully Logout'})
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post('/users/logoutall',auth,async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send({message:'Successfully logout all session'})
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/me',auth, async (req, res) => {
   res.status(200).send(req.user)
})



router.patch('/user/me',auth, async (req, res) => {

    const requestField = Object.keys(req.body)
    const updateField = ['age', 'name', 'password', 'email']
    const fieldCheckingSucess = requestField.every((update) => {
        return updateField.includes(update)
    })

    if (!fieldCheckingSucess) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.user._id)
        requestField.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.status(200).send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.delete('/users/me',auth, async (req, res) => {
    const id = req.user._id
    try {
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }

})


module.exports = router