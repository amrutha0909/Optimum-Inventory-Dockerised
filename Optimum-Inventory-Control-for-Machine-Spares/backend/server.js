const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Transaction = require('./models/Transaction');
const SparePart = require('./models/SparePart');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_123';
const MONGO_URI = 'mongodb://localhost:27017/inventory_optimum';

mongoose.connect(MONGO_URI)
  .then((conn) => console.log(`MongoDB Connected: ${conn.connection.host}`))
  .catch(err => console.error('MongoDB Connection Error:', err));



app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});


app.get('/api/spares', async (req, res) => {
  try {
    const spares = await SparePart.find();
    res.json(spares);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/spares', async (req, res) => {
  try {
    const spare = new SparePart(req.body);
    const newSpare = await spare.save();

    await Transaction.create({
      itemName: newSpare.name,
      sku: newSpare.sku,
      type: 'CREATED',
      quantity: newSpare.currentStock 
    });

    res.status(201).json(newSpare);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/spares/:id/consume', async (req, res) => {
  try {
    const spare = await SparePart.findById(req.params.id);
    if (req.body.quantity > spare.currentStock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    spare.currentStock -= req.body.quantity;
    await spare.save();

    await Transaction.create({
      itemName: spare.name,
      sku: spare.sku,
      type: 'OUT',
      quantity: req.body.quantity
    });

    res.json(spare);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/spares/:id/restock', async (req, res) => {
  try {
    const spare = await SparePart.findById(req.params.id);
    spare.currentStock += parseInt(req.body.quantity); 
    await spare.save();
    await Transaction.create({
      itemName: spare.name,
      sku: spare.sku,
      type: 'IN',
      quantity: req.body.quantity
    });

    res.json(spare);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/spares/:id', async (req, res) => {
  try {
    const itemToDelete = await SparePart.findById(req.params.id);
    
    if (!itemToDelete) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await Transaction.create({
      itemName: itemToDelete.name,
      sku: itemToDelete.sku,
      type: 'DELETED',
      quantity: itemToDelete.currentStock 
    });

    await SparePart.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/transactions', async (req, res) => {
  try {
    const logs = await Transaction.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));