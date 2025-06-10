// Dotenv'i oku
require("./jobs/deleteOldEvents");

require('dotenv').config();

// Paketleri import et
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bildirimRoute = require("./routes/bildirim");

// App oluştur
const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Static dosya (Görseller için)
app.use('/img', express.static(path.join(__dirname, 'public/img')));


// Route'lar
const authRoutes = require('./routes/auth');
const userRoutes = require("./routes/user");
const etkinlikRoutes = require("./routes/etkinlik");
const uploadRoute = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/etkinlik', etkinlikRoutes);
app.use('/api/upload', uploadRoute);
app.use("/api/yorum", require("./routes/yorum"));
app.use("/api/bildirim", bildirimRoute);

// Basit test endpoint'i
app.get('/', (req, res) => {
  res.send('Backend çalışıyor!');
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => 
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`)
);
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
  });
