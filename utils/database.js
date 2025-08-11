const mongoose = require('mongoose');
const { Schema } = mongoose;

const mazeretSchema = new Schema({
  userID: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const MesaiSchema = new Schema({
  userID: { type: String, required: true, unique: true },
  mesaiDurumu: { type: Boolean, default: false },
  mesaiGiris: { type: Number, default: 0 },
  toplamMesai: { type: Number, default: 0 },
  ilkMesaiDurumu: { type: Boolean, default: false },
  ilkMesaiTimestamp: { type: Number, default: 0 },
  ilkMesaiTarihi: { type: String, default: '' }
});

const Mazeret = mongoose.models.Mazeret || mongoose.model('Mazeret', mazeretSchema);
const Mesai = mongoose.models.Mesai || mongoose.model('Mesai', MesaiSchema);

module.exports = { Mazeret, Mesai };
