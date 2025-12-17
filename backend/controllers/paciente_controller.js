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
    const created = await model.create(req.body, { transaction: t });

    // If an email was provided, create or link a user account and send credentials
    if (req.body.email) {
      const email = req.body.email;

      // If a user already exists with that email, link the patient to that user
      let user = await db.utilizadores.findOne({ where: { email }, transaction: t });

      if (!user) {
        // Ensure a 'Paciente' user type exists
        const [tipoUser] = await db.tipouser.findOrCreate({
          where: { descricao_pt: 'Paciente' },
          defaults: { id_tipo_user: 2, descricao_pt: 'Paciente', descricao_en: 'Patient' },
          transaction: t
        });

        // Generate a short, friendly password (hex, 8 chars)
        const password = require('crypto').randomBytes(4).toString('hex');

        const maxId = (await db.utilizadores.max('id_user', { transaction: t })) || 0;
        const id_user = maxId + 1;

        user = await db.utilizadores.create({
          id_user,
          id_tipo_user: tipoUser.id_tipo_user || 2,
          numero_utente: created.numero_utente,
          nome: req.body.nome || created.nome || null,
          email,
          password_hash: password
        }, { transaction: t });

        // Send credentials via email (if SMTP configured). In dev, we log email and also return the password in the response for convenience.
        try {
          const subject = 'Acesso à clínica — credenciais';
          const text = `Olá ${user.nome || ''},\n\nA sua conta foi criada. Pode iniciar sessão com:\nemail: ${email}\npassword: ${password}\n\nPor favor altere a sua password no seu primeiro acesso.`;
          await sendMail({ to: email, subject, text });
        } catch (mailErr) {
          console.error('Erro ao enviar email de boas-vindas:', mailErr.message || mailErr);
        }

        // Attach new user id to paciente
        if (user && user.id_user) {
          created.id_user = user.id_user;
          await created.save({ transaction: t });
        }

        await t.commit();

        // If mailer not configured and in development, return the generated password so devs can verify
        if (!isConfigured() && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')) {
          return res.status(201).json({ paciente: created, temp_password: password });
        }
      } else {
        // user exists — link patient to existing user
        created.id_user = user.id_user;
        await created.save({ transaction: t });
        await t.commit();
      }
    } else {
      await t.commit();
    }

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
