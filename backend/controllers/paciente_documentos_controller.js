const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const db = require('../models');

const ROOT_DIR = path.join(__dirname, '..', 'uploads', 'paciente-pdfs');

function isAdminUser(user) {
  const userType = String(user?.id_tipo_user || '');
  return userType === '1' || String(user?.email || '').toLowerCase() === 'admin@local';
}

async function canAccessPatient(user, utenteId) {
  if (!user) return false;
  if (isAdminUser(user)) return true;

  const userUtente = String(user?.numero_utente || '').trim();
  const targetUtente = String(utenteId || '').trim();
  if (!userUtente || !targetUtente) return false;
  if (userUtente === targetUtente) return true;

  // Allow a patient to access their dependents' documents.
  try {
    const dep = await db.paciente.findOne({
      where: { numero_utente: targetUtente, pac_numero_utente: userUtente },
      attributes: ['numero_utente'],
    });
    return !!dep;
  } catch {
    return false;
  }
}

function patientDir(utenteId) {
  return path.join(ROOT_DIR, String(utenteId));
}

function indexFile(utenteId) {
  return path.join(patientDir(utenteId), 'index.json');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function sanitizeFileName(name) {
  return String(name || 'documento.pdf')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .slice(0, 120);
}

async function readIndex(utenteId) {
  try {
    const raw = await fs.readFile(indexFile(utenteId), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeIndex(utenteId, items) {
  await ensureDir(patientDir(utenteId));
  await fs.writeFile(indexFile(utenteId), JSON.stringify(items, null, 2), 'utf8');
}

exports.list = async (req, res) => {
  try {
    const utenteId = req.params.id;

    if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });
    if (!(await canAccessPatient(req.user, utenteId))) return res.status(403).json({ message: 'Sem permissões.' });

    const items = await readIndex(utenteId);
    items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err?.message || 'Erro ao listar documentos.' });
  }
};

exports.upload = async (req, res) => {
  const utenteId = req.params.id;

  try {
    if (!req.user) {
      if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    if (!isAdminUser(req.user)) {
      if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ message: 'Sem permissões.' });
    }

    if (!req.file) return res.status(400).json({ message: 'Ficheiro em falta.' });

    const isPdf =
      req.file.mimetype === 'application/pdf' || String(req.file.originalname || '').toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Apenas ficheiros PDF.' });
    }

    const docId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    const originalName = sanitizeFileName(req.file.originalname);
    const finalName = `${docId}.pdf`;

    await ensureDir(patientDir(utenteId));
    const finalPath = path.join(patientDir(utenteId), finalName);

    await fs.rename(req.file.path, finalPath);

    const items = await readIndex(utenteId);
    const entry = {
      id: docId,
      fileName: finalName,
      originalName,
      mimetype: 'application/pdf',
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };

    items.push(entry);
    await writeIndex(utenteId, items);

    res.status(201).json(entry);
  } catch (err) {
    // Cleanup tmp upload if something goes wrong
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: err?.message || 'Erro ao carregar documento.' });
  }
};

exports.download = async (req, res) => {
  try {
    const utenteId = req.params.id;
    const docId = req.params.docId;

    if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });
    if (!(await canAccessPatient(req.user, utenteId))) return res.status(403).json({ message: 'Sem permissões.' });

    const items = await readIndex(utenteId);
    const entry = items.find((x) => String(x.id) === String(docId));
    if (!entry) return res.status(404).json({ message: 'Documento não encontrado.' });

    const filePath = path.join(patientDir(utenteId), entry.fileName);
    if (!fsSync.existsSync(filePath)) return res.status(404).json({ message: 'Ficheiro não encontrado.' });

    return res.download(filePath, entry.originalName || 'documento.pdf');
  } catch (err) {
    res.status(500).json({ message: err?.message || 'Erro ao descarregar documento.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const utenteId = req.params.id;
    const docId = req.params.docId;

    if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });
    if (!isAdminUser(req.user)) return res.status(403).json({ message: 'Sem permissões.' });

    const items = await readIndex(utenteId);
    const idx = items.findIndex((x) => String(x.id) === String(docId));
    if (idx < 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const entry = items[idx];
    const filePath = path.join(patientDir(utenteId), entry.fileName);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath).catch(() => {});
    }

    items.splice(idx, 1);
    await writeIndex(utenteId, items);

    return res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err?.message || 'Erro ao apagar documento.' });
  }
};
