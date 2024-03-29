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

router.post('/api/products/:productId/bids', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { price } = req.body;

    if (!price) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['price'] });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingProduct = await Product.findByPk(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newBid = await Bid.create({
      price,
      productId,
      bidderId: req.user.id,
      date: new Date()
    });

    const formattedResponse = {
      id: newBid.id,
      productId: newBid.productId,
      bidderId: newBid.bidderId,
      price: newBid.price,
      date: newBid.date
    };

    res.status(201).json(formattedResponse);
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





export default router
