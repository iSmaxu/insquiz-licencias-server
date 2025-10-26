const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configurar base de datos local (lowdb)
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { licenses: [] });

// Cargar DB
await db.read();
db.data ||= { licenses: [] };

// Endpoint para crear licencia
app.post('/create-license', async (req, res) => {
  const { clientName } = req.body;
  const key = nanoid(16);

  db.data.licenses.push({ clientName, key, created: new Date().toISOString() });
  await db.write();

  res.json({ success: true, key });
});

// Endpoint para validar licencia
app.post('/verify-license', async (req, res) => {
  const { key } = req.body;
  const found = db.data.licenses.find((l) => l.key === key);
  res.json({ valid: !!found });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
// Fin del archivo index.js