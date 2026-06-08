import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }


    const skip = (page - 1) * limit;
    const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit)
    .sort({
        createdAt: -1
    })
    .populate("user", "username fullName avatar");

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully" ));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!content?.trim()?.length){
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    });

    return res.status(201).json(new ApiResponse(200, comment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body;
    const { commentId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!content?.trim()?.length){
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        content,
        owner: req.user?._id,
    });

    return res.status(201).json(new ApiResponse(200, comment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { content } = req.body;
    const { commentId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!content?.trim()?.length){
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    return res.status(201).json(new ApiResponse(200, comment, "Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
