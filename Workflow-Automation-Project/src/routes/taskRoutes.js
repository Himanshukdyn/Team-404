/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               state:
 *                 type: string
 *                 enum: [Pending, Approved, Rejected, In Progress, Completed, Cancelled]
 *                 default: Pending
 *                 description: Task state
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign the task to
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for the task
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/view:
 *   get:
 *     summary: View tasks assigned to the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}/transition:
 *   put:
 *     summary: Update task state (transition)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *             properties:
 *               state:
 *                 type: string
 *                 enum: [Pending, Approved, Rejected, In Progress, Completed, Cancelled]
 *                 description: New task state
 *     responses:
 *       200:
 *         description: Task state updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/all:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/summary:
 *   get:
 *     summary: Get task summary statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     inProgress:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     completionRate:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/user-stats:
 *   get:
 *     summary: Get user-wise task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User task stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       totalTasks:
 *                         type: integer
 *                       completed:
 *                         type: integer
 *                       pending:
 *                         type: integer
 *                       inProgress:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         state:
 *           type: string
 *           enum: [Pending, Approved, Rejected, In Progress, Completed, Cancelled]
 *         createdBy:
 *           type: string
 *         assignedTo:
 *           type: string
 *         metadata:
 *           type: object
 *         transitions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               by:
 *                 type: string
 *               byRole:
 *                 type: string
 *               comment:
 *                 type: string
 *               at:
 *                 type: string
 *                 format: date-time
 *               snapshot:
 *                 type: object
 *               notifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     message:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     sent:
 *                       type: boolean
 *         notifications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               sent:
 *                 type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

import express from "express";
import {
  createTask,
  viewTasks,
  updateTaskState,
  getAllTasks,
  deleteTask,
  getTaskSummary,
  getUserTaskStats,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// =============================
//  USER ROUTES
// =============================
router.post("/create", protect, authorizeRoles("admin", "manager"), createTask);

// ✅ View Tasks — all logged-in users
router.get("/view", protect, viewTasks);

// ✅ Update Task Transition — only Admin and Manager
router.put("/:id/transition", protect, authorizeRoles("admin", "manager"), updateTaskState);

// =============================
//  ADMIN & MANAGER ROUTES
// =============================
router.get("/all", protect, authorizeRoles("admin"), getAllTasks);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTask);
router.get("/summary", protect, authorizeRoles("admin", "manager"), getTaskSummary);
router.get("/user-stats", protect, authorizeRoles("admin", "manager"), getUserTaskStats);

export default router;
