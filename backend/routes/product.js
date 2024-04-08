import express from 'express'
import { Bid, Product, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'seller'
      }, {
        model: Bid,
        as: 'bids'
      }]
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{
        model: User,
        as: 'seller'
      }, {
        model: Bid,
        as: 'bids',
        include: [{
          model: User,
          as: 'bidder'
        }]
      }]
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
  }
})

router.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body;

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'] });
    }

    if (isNaN(originalPrice) || originalPrice <= 0) {
      return res.status(400).json({ error: 'Le prix original doit être un nombre positif', details: ['originalPrice'] });
    }

    const newProduct = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId: req.user.id
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du produit' });
  }
});


router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.productId
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Champs invalides ou manquants', details: ['name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'] })
    }

    const existingProduct = await Product.findByPk(productId)
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }

    if (req.user.id !== existingProduct.sellerId && !req.user.admin) {
      return res.status(403).json({ error: 'Utilisateur non autorisé' })
    }

    const [numUpdatedRows, updatedProduct] = await Product.update(
      {
        name,
        description,
        category,
        originalPrice,
        pictureUrl,
        endDate
      },
      {
        where: {
          id: productId
        },
        returning: true
      }
    )

    if (numUpdatedRows === 0) {
      return res.status(500).json({ message: 'La mise à jour du produit a échoué' })
    }

    res.status(200).json(updatedProduct[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' })
  }
})

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const product = await Product.findByPk(req.params.productId)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'User not granted' })
    }

    await product.destroy()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
