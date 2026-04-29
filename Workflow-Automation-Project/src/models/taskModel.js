import mongoose from "mongoose";


// This sub-schema represents a change in a task’s state — for example, a task moving from “Pending” → “Approved”.
const transitionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  byRole: { type: String },
  comment: { type: String },
  at: { type: Date, default: Date.now },
  // snapshot of the task before the transition
  snapshot: { type: mongoose.Schema.Types.Mixed },
  // notifications created as a result of this transition
  notifications: [
    {
      type: { type: String },
      message: { type: String },
      createdAt: { type: Date, default: Date.now },
      sent: { type: Boolean, default: false }
    }
  ]
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    state: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "In Progress", "Completed", "Cancelled"],
      default: "Pending"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    metadata: { type: mongoose.Schema.Types.Mixed },
    transitions: [transitionSchema],
    // global notifications array
    notifications: [
      {
        type: { type: String },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
        sent: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
