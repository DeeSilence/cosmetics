const express = require('express');
const router = express.Router();
/**
 * @swagger
 * /ice-cream:
 *   post:
 *     tags:
 *       — Ice Cream
 *     summary: This should create a new ice cream.
 *     description: This is where you can give some background as to why this route is being created or perhaps reference a ticket number.
 *     consumes:
 *       — application/json
 *     parameters:
 *       — name: body
 *       in: body
 *       schema:
 *         type: object
 *         properties:
 *           flavor:
 *           type: string
 *     responses:
 *       200:
 *         description: Receive back flavor and flavor Id.
 */
router.get('/', (req, res) =>
    res.json({
        status: "ok"
    })
);

module.exports = router;