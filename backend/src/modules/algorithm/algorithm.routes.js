import express from "express";
import Algorithm from "../../models/Algorithm.js";

const router = express.Router();

// GET ALL (dashboard)
router.get("/", async (req, res) => {
  const algos = await Algorithm.find();

  if (!algos) {
    return res.status(404).json({ msg: "Algorithm not found" });
  }

  res.json(algos);


});

// GET ONE (workspace)
router.get("/:slug", async (req, res) => {
  const algo = await Algorithm.findOne({ slug: req.params.slug });

  if (!algo) {
    return res.status(404).json({ msg: "Algorithm not found" });
  }

  res.json(algo);
});

export default router;