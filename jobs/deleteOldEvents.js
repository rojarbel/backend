const cron = require("node-cron");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Etkinlik = require("../models/Etkinlik");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);

async function silGecmisEtkinlikler() {
  try {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const bugunStr = bugun.toISOString().split("T")[0];

    const silinecekler = await Etkinlik.find({ tarih: { $lt: bugunStr } });

    for (const etkinlik of silinecekler) {
    if (etkinlik.gorsel) {
      const temizGorsel = etkinlik.gorsel.replace(/^\/?img\//, ''); // "/img/" kısmını temizle
      const gorselPath = path.join(__dirname, '../public/img/', temizGorsel);

      if (fs.existsSync(gorselPath)) {
        try {
          fs.unlinkSync(gorselPath);
          console.log(`[DOSYA SİLİNDİ] ${etkinlik.gorsel}`);
        } catch (err) {
          console.error(`[HATA] Görsel silinemedi: ${etkinlik.gorsel} → ${err.message}`);
        }
      } else {
        console.warn(`[DOSYA BULUNAMADI] ${gorselPath}`);
      }
    }
    }

    const result = await Etkinlik.deleteMany({ tarih: { $lt: bugunStr } });
    console.log(`[ETKİNLİK TEMİZLEME] ${result.deletedCount} etkinlik silindi (tarih < ${bugunStr}).`);

  } catch (error) {
    console.error("[HATA] Silme sırasında:", error.message);
  }
}

// Cron: her gece 00:01
cron.schedule("1 0 * * *", silGecmisEtkinlikler);

// Komutla çalıştırmak için:
if (require.main === module) {
  silGecmisEtkinlikler().then(() => {
    console.log("✅ Manuel silme tamamlandı");
    process.exit(); // script'i bitir
  });
}
