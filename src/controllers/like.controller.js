import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    //TODO: toggle like on video

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Like.findOneAndDelete({ video: videoId, likedBy: req.user?._id });

    if(!doc){
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video like updated successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

    if(doc){
        await Like.findByIdAndDelete(doc._id);
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        });
    }

    return res.status(200).json(new ApiResponse(200, {},  "Comment like updated successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const doc = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

    if(doc){
        await Like.findByIdAndDelete(doc._id);
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        });
    }

    return res.status(200).json(new ApiResponse(200, {}, "Tweet like updated successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const videos = await Like.find({ likedBy: req.user?._id, video: { $exists: true } }).populate("video", "title description videoFile thumbnail");

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}