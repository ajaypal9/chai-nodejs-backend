import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400, "Name and description is required");
    }

    const doc = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    return res.status(201).json(new ApiResponse(200, doc, "Playlist created"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    //TODO: get user playlists
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Playlist.find({
        owner: userId
    });

    return res.status(200).json(new ApiResponse(200, doc, "Playlist list fetched"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Playlist.findOne({
        owner: req.user._id,
        _id: playlistId
    });

    return res.status(200).json(new ApiResponse(200, doc, "Playlist fetched"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id provided");
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id provided");
    }
    
    const doc = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user?._id
    }, {
        $addToSet: {
            videos: videoId
        } 
    }, {
        new: true
    });

    return res.status(200).json(new ApiResponse(200, doc, "Playlist list fetched"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id provided");
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id provided");
    }
    
    const doc = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user._id
    }, {
        $pull: {
            videos: videoId
        } 
    }, {
        new: true
    });

    return res.status(200).json(new ApiResponse(200, doc, "Playlist list fetched"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Playlist.findOneAndDelete({
        owner: req.user?._id,
        _id: playlistId
    });

    if (!doc) {
    throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, doc, "Playlist deleted"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid id provided");
    }

    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400, "Name and description is required");
    }

    const doc = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user?._id
    }, {
        name,
        description,
    },{
        new: true
    });

    if (!doc) {
    throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, doc, "Playlist updated"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
