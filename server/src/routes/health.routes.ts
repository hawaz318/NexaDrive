import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check API health
 *     description: Check whether the NexaDrive API is running.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: NexaDrive API is running
 */
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NexaDrive API is running",
  });
});

export default router;