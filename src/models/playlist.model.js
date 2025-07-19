import mongoose from "mongoose";

const playlistschema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    playlist_vids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    }],
    description: {
        type: String,
        required: true,
    }
}, { timestamps: true });


const playlists = mongoose.model("Playlist", playlistschema);


export { playlists }