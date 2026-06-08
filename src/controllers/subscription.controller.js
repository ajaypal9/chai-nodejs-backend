import {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id");
    }

    const subscription = await Subscription.findOne({ 
       channel: channelId,
       subscriber: req.user?._id
     });
     

     if(subscription){
        await Subscription.findByIdAndDelete(subscription._id);
     } else {
        await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        });
     }

     return res.status(200).json(new ApiResponse(200, {}, subscription ? "Unsubscribed successfully" :"Subscribed successfully"));
})

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id");
    }

    const subscribers = await Subscription.find({ 
       channel: channelId,
    }).populate("subscriber", "username fullName avatar");;

    return res.status(200).json(new ApiResponse(200, subscribers, "channel Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber id");
    }

    const subscribedChannels = await Subscription.find({ 
       subscriber: subscriberId,
    }).populate("channel", "username fullName avatar");;

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "User Channels fetched successfully"));
})

export {
    toggleSubscription,
    getChannelSubscribers,
    getUserSubscribedChannels
}