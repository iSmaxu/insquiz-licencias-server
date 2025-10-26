const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { nanoid } = require('nanoid');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const DB_FILE = path.join(__dirname, 'db.json');

// Leer base de datos
function readDB() {
  if (!fs.existsSync(DB_FILE)) return { licenses: [] };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Escribir base de datos
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Crear licencia
app.post('/create-license', (req, res) => {
  try {
    const { clientName } = req.body;
    if (!clientName) return res.status(400).json({ error: 'clientName requerido' });

    let db = { licenses: [] };
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    const key = nanoid(16);
    db.licenses.push({ clientName, key, created: new Date().toISOString() });

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch {
      console.warn('⚠️ No se pudo escribir db.json (entorno de solo lectura)');
    }

    res.json({ success: true, key });
  } catch (err) {
    console.error('❌ Error en /create-license:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});


// Verificar licencia
app.post('/verify-license', (req, res) => {
  const { key } = req.body;
  const db = readDB();
  const found = db.licenses.find((l) => l.key === key);
  res.json({ valid: !!found });
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('Servidor de licencias activo ✅');
});

// Puerto dinámico (Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
