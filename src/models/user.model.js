import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    watchhistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"

    }],
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,

    },
    avatar: {
        type: String,
        required: true
    },
    coverimage: {
        type: String,


    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    refreshtoken: {
        type: String,
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();

    }
    catch (err) {
        next(err);
    }
})

userSchema.methods.IsPasswordSame = (async function (password) {
    return bcrypt.compare(password, this.password);

})

userSchema.methods.GenerateAccessToken = (function () {
    const token = jwt.sign({
        id: this.id,
        username: this.username,
        fullname: this.fullname,
        email: this.email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
    return token;
})
userSchema.methods.GenerateRefreshToken = (function () {
    const token = jwt.sign({
        id: this.id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
    return token;
})




const users = mongoose.model("User", userSchema);

export { users }