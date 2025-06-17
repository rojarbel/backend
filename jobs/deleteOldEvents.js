const cron = require("node-cron");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Etkinlik = require("../models/Etkinlik");
const Favori = require("../models/Favori");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);

async function silGecmisEtkinlikler() {
  try {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 1);
    limitDate.setHours(0, 0, 0, 0);

    const silinecekler = await Etkinlik.find({ tarih: { $lt: limitDate } });

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

    const ids = silinecekler.map(e => e._id);

    const favoriSonuc = await Favori.deleteMany({ etkinlikId: { $in: ids } });
    console.log(`[FAVORİ TEMİZLEME] ${favoriSonuc.deletedCount} favori silindi.`);

    const result = await Etkinlik.deleteMany({ _id: { $in: ids } });
    console.log(`[ETKİNLİK TEMİZLEME] ${result.deletedCount} etkinlik silindi (tarih < ${limitDate.toISOString().split("T")[0]}).`);

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
module.exports = silGecmisEtkinlikler;