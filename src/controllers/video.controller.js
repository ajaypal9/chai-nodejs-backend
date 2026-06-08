import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType = -1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    const pageNo = Number(page);
    const pageLimit = Number(limit);
    const skip = (pageNo - 1) * pageLimit;

    if(userId && !isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const matchStage = {
       ...(query?.trim() ? {
            $or: [ 
                  { title: { $regex: query, $options: "i" } },
                  { description: { $regex: query, $options: "i" } },
            ]
        } : {}),
        ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {})
    };

    const videos = await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                isPublished: 1,
                owner: {
                    username: "$owner.username",
                    email: "$owner.email",
                } 
            }
        },
        {
            $sort: { [sortBy]: sortType }
        },
        {
            $skip: skip
        },
        {
            $limit: pageLimit
        }
    ])

    return res.status(200).json(new ApiResponse(
        200,
        videos,
        "Videos fetched successfully"
    ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    if(!title?.trim()?.length || !description?.trim()?.length){
        throw new ApiError(400, "Title, description is required");
    }

    let videoFileLocalPath;
    if(req?.files && Array.isArray(req.files?.videoFile) && req?.files?.videoFile.length){
       videoFileLocalPath = req.files.videoFile?.[0].path;
    }

    if(!videoFileLocalPath?.trim()?.length){
        throw new ApiError(400, "Video file is required");
    }

    let thumbnailLocalPath;
    if(req?.files && Array.isArray(req.files?.thumbnail) && req?.files?.thumbnail.length){
       thumbnailLocalPath = req.files.thumbnail?.[0].path;
    }

    if(!thumbnailLocalPath?.trim()?.length){
        throw new ApiError(400, "Thumbnail is required");
    }

    const uploadedVideoFile = await uploadOnCloudinary(videoFileLocalPath);

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const video = await Video.create({
        title,
        description,
        owner: req.user?._id,
        videoFile: uploadedVideoFile.url,
        thumbnail: uploadedThumbnail.url,
        duration: uploadedVideoFile.metadata.duration
    });

    return res.status(201).json(new ApiResponse(200, video, "Video added successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const video = await Video.findOne(videoId);

    if(!video){
       return res.status(404).json(new ApiResponse(404, {}, "No Video found"))
    }

    return res.status(201).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id provided");
    }

    if(!title?.trim()?.length || !description?.trim()?.length) {
        throw new ApiError(400, "Title, description is required");
    }

    let thumbnailLocalPath;
    let uploadedThumbnail;
    if(req?.files && Array.isArray(req.files?.thumbnail) && req?.files?.thumbnail.length){
       thumbnailLocalPath = req.files.thumbnail?.[0].path;
    }

    if(thumbnailLocalPath){
        uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const video = await Video.findByIdAndUpdate(videoId, 
    {
        title,
        description,
        thumbnail: uploadedThumbnail.url,
    },
    { new:true }
    );

    return res.status(201).json(new ApiResponse(200, video, "Video added successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId?.trim()?.length){
        throw new ApiError(400, "Id is required");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    return res.status(201).json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id provided");
    }

    const video = await Video.findByIdAndUpdate(videoId, 
    {
        isPublished: req.body.isPublished 
    },
    { new:true }
    );

    return res.status(201).json(new ApiResponse(200, video, "Video added successfully"));

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
