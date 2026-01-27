import { Request, Response } from "express";
import { stellarService } from "../../config/stellar";
import crypto from "crypto";

export const createReport = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const hash = crypto.createHash("sha256").update(description).digest("hex");

    const txHash = await stellarService.anchorHash(hash);

    res.status(201).json({
      message: "Report created and anchored",
      content_hash: hash,
      stellar_tx: txHash,
      explorer_url: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create report" });
  }
};
