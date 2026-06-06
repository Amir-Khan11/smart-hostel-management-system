const express   = require('express');
const cors      = require('cors');
const connectDB = require('./db');
require('dotenv').config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/rooms',      require('./routes/rooms'));
app.use('/api/fees',       require('./routes/fees'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/visitors',   require('./routes/visitors'));

app.get('/', (req, res) => res.json({ message: 'HostelHub API running ✓ (MongoDB)' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
