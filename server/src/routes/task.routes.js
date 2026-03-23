const express = require("express");
const router = express.Router();

const taskController = require("../controllers/task.controller");

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.patch("/:id", taskController.updateTask);
router.delete("/completed", taskController.deleteCompletedTasks);
router.delete("/", taskController.clearAllTasks);
router.delete("/:id", taskController.deleteTask);

module.exports = router;