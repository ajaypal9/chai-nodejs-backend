import { isValidObjectId, Schema } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if(!content?.trim()?.length){
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    });
    console.log("tweet response", tweet)

    return res.status(201).json(new ApiResponse(200, tweet, "Tweet added successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req?.params?.userId || req.user?._id;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId");
    }

    const tweets = await Tweet.find({ owner: req.user?._id });

    if(!tweets){
        throw new ApiError(400, "No tweets found!");
    }


    return res.status(203).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params?.tweetId;
    const { content } = req.body;

    if(!tweetId?.trim()?.length){
        throw new ApiError(400, "Id is required");
    }

    if(!content?.trim()?.length){
        throw new ApiError(400, "Content is required");
    }

    const newTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content
        }
    }, 
    {
      new:true
    });

    return res.status(201).json(new ApiResponse(200, newTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params?.tweetId;

    if(!tweetId?.trim()?.length){
        throw new ApiError(400, "Id is required");
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetid");
    }

    const newTweet = await Tweet.findByIdAndDelete(tweetId);

    return res.status(201).json(new ApiResponse(200, newTweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
