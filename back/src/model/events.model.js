
import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    eventdate: {
        type: String,
        required: true,
    },
    lastDate: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    dept: {
        type: String,
    },
    committee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Committee",
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
        default: "",
    },

    venue: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },


}, {
    timestamps: true
});

const Event = mongoose.model("Event", eventSchema);

export { Event };
