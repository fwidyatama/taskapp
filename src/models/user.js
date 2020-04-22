const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            trim: true,
            required: true,
            minlength: 7,
            validate(value) {
                if (value.includes('password')) {
                    throw new Error('Invalid Password')
                }
            }
        },
        email: {
            type: String,
            unique:true,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email')
                }
            }
        },
        age: {
            type: Number,
            default: 0,

        },
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }]
    }
)

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


userSchema.methods.generateToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},'thisiscourse',{expiresIn:'7 days'});
    user.tokens = user.tokens.concat({token:token});
    await user.save();

    return token;

}


userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}


userSchema.statics.findbyCredential = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login!')}


    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login!');
    }

    return user;

}


userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})


const User = mongoose.model('User', userSchema);


module.exports = User;