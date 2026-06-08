import { Router } from 'express';
import {
    getChannelSubscribers,
    getUserSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/channel/:channelId")
    .get(getChannelSubscribers)
    .post(toggleSubscription);

router.route("/user/:subscriberId").get(getUserSubscribedChannels);

export default router