import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const bid = await Bid.findByPk(req.params.bidId)

    if (!bid) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (bid.bidderId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'User not granted' })
    }

    await bid.destroy()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
  res.status(600).send()
})



export default router