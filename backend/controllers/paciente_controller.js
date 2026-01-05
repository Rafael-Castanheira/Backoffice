const db = require('../models');

const model = db.paciente;

const getPk = (m) => (m && m.primaryKeyAttributes && m.primaryKeyAttributes[0]) || 'id';

exports.findAll = async (req, res) => {
  try {
    const items = await model.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const item = await model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { sendMail, isConfigured } = require('../utils/mailer');

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const body = { ...req.body };

    // If a responsible patient was provided, ensure it exists.
    // Users often type the NIF; our PK is numero_utente, so we try both.
    if (body.pac_numero_utente != null && String(body.pac_numero_utente).trim() !== '') {
      const raw = String(body.pac_numero_utente).trim();
      let responsavel = await model.findByPk(raw, { transaction: t });
      if (!responsavel) {
        responsavel = await model.findOne({ where: { nif: raw }, transaction: t });
      }

      if (responsavel && responsavel.numero_utente) {
        body.pac_numero_utente = responsavel.numero_utente;
      } else {
        // Don't block patient creation — just drop the invalid reference.
        body.pac_numero_utente = null;
      }
    }

    // Avoid self-referencing FK
    if (body.pac_numero_utente && body.numero_utente && String(body.pac_numero_utente) === String(body.numero_utente)) {
      body.pac_numero_utente = null;
    }

    const created = await model.create(body, { transaction: t });

    const pacienteNome = req.body.nome || null;

    // Ensure a 'Paciente' user type exists
    const [tipoUser] = await db.tipouser.findOrCreate({
      where: { descricao_pt: 'Paciente' },
      defaults: { id_tipo_user: 2, descricao_pt: 'Paciente', descricao_en: 'Patient' },
      transaction: t,
    });

    const tipoPacienteId = tipoUser.id_tipo_user || 2;

    const ensureUserLinked = async ({ email, password }) => {
      let user = null;

      if (email) {
        user = await db.utilizadores.findOne({ where: { email }, transaction: t });
      }

      if (!user) {
        user = await db.utilizadores.findOne({ where: { numero_utente: created.numero_utente }, transaction: t });
      }

      if (!user) {
        const maxId = (await db.utilizadores.max('id_user', { transaction: t })) || 0;
        const id_user = maxId + 1;

        user = await db.utilizadores.create(
          {
            id_user,
            id_tipo_user: tipoPacienteId,
            numero_utente: created.numero_utente,
            nome: pacienteNome,
            email: email || null,
            password_hash: password || null,
            data_criacao: new Date(),
          },
          { transaction: t }
        );
      } else {
        // Ensure linkage + basic fields
        const updates = {};
        if (!user.numero_utente) updates.numero_utente = created.numero_utente;
        if (!user.id_tipo_user) updates.id_tipo_user = tipoPacienteId;
        if (!user.nome && pacienteNome) updates.nome = pacienteNome;
        if (!user.data_criacao) updates.data_criacao = new Date();
        if (Object.keys(updates).length) {
          await user.update(updates, { transaction: t });
        }
      }

      if (user && user.id_user) {
        created.id_user = user.id_user;
        await created.save({ transaction: t });
      }

      return user;
    };

    // If an email was provided, create/link a user account and send credentials
    if (req.body.email) {
      const email = req.body.email;

      // Generate a short, friendly password (hex, 8 chars)
      const password = require('crypto').randomBytes(4).toString('hex');

      const user = await ensureUserLinked({ email, password });

        // Send credentials via email (if SMTP configured). In dev, we log email and also return the password in the response for convenience.
        try {
          const subject = 'Acesso à clínica — credenciais';
          const text = `Olá ${user.nome || ''},\n\nA sua conta foi criada. Pode iniciar sessão com:\nemail: ${email}\npassword: ${password}\n\nPor favor altere a sua password no seu primeiro acesso.`;
          await sendMail({ to: email, subject, text });
        } catch (mailErr) {
          console.error('Erro ao enviar email de boas-vindas:', mailErr.message || mailErr);
        }

      await t.commit();

      // If mailer not configured and in development, return the generated password so devs can verify
      if (!isConfigured() && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')) {
        return res.status(201).json({ paciente: created, temp_password: password });
      }

      return res.status(201).json(created);
    }

    // No email: still create/link a user so the patient appears in the list
    await ensureUserLinked({ email: null, password: null });

    await t.commit();
    return res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pk = getPk(model);
    const where = {};
    where[pk] = req.params.id;
    const [num] = await model.update(req.body, { where });
    if (num === 0) return res.status(404).json({ message: 'Not found' });
    const updated = await model.findOne({ where });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pk = getPk(model);
    const where = {};
    where[pk] = req.params.id;
    const num = await model.destroy({ where });
    if (num === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
