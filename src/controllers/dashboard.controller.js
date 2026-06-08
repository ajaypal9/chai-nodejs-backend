import {Video} from "../models/video.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.user?._id);

    const result = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $facet: {
                videoStats: [
                    {
                        $group: {
                            _id: null,
                            totalVideos: { $sum: 1 },
                            totalViews: { $sum: "$views" }
                        }
                    }
                ],
                likeStats: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $project: {
                            likesCount: { $size: "$likes" }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalLikes: { $sum: "$likesCount" }
                        }
                    }
                ],
                subscriberStats: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            let: { channelId: "$owner" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$channel", "$$channelId"]
                                        }
                                    }
                                }
                            ],
                            as: "subscribers"
                        }
                    },
                    {
                        $project: {
                            subscribersCount: { $size: "$subscribers" }
                        }
                    },
                    {
                        $limit: 1
                    }
                ]
            }
        },
        {
            $project: {
                totalVideos: {
                    $ifNull: [{ $arrayElemAt: ["$videoStats.totalVideos", 0] }, 0]
                },
                totalViews: {
                    $ifNull: [{ $arrayElemAt: ["$videoStats.totalViews", 0] }, 0]
                },
                totalLikes: {
                    $ifNull: [{ $arrayElemAt: ["$likeStats.totalLikes", 0] }, 0]
                },
                totalSubscribers: {
                    $ifNull: [{ $arrayElemAt: ["$subscriberStats.subscribersCount", 0] }, 0]
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, result[0], "Stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = Video.find({
        owner: req.user?._id
    });

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos"))
})

export {
    getChannelStats, 
    getChannelVideos
    }