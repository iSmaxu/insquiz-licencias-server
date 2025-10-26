const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const { Low, JSONFile } = require('lowdb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configurar base de datos local (lowdb)
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

async function initDB() {
  await db.read();
  if (!db.data) db.data = { licenses: [] };
}
initDB();

// Endpoint para crear licencia
app.post('/create-license', async (req, res) => {
  await db.read();
  const { clientName } = req.body;
  const key = nanoid(16);
  db.data.licenses.push({ clientName, key, created: new Date().toISOString() });
  await db.write();
  res.json({ success: true, key });
});

// Endpoint para validar licencia
app.post('/verify-license', async (req, res) => {
  await db.read();
  const { key } = req.body;
  const found = db.data.licenses.find((l) => l.key === key);
  res.json({ valid: !!found });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de licencias activo ✅');
});

// Puerto dinámico (Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
