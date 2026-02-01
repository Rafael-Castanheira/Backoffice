const db = require('../models');

const model = db.paciente;

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

  try {
    const dep = await model.findOne({
      where: { numero_utente: targetUtente, pac_numero_utente: userUtente },
      attributes: ['numero_utente'],
    });
    return !!dep;
  } catch {
    return false;
  }
}

const getPk = (m) => (m && m.primaryKeyAttributes && m.primaryKeyAttributes[0]) || 'id';

exports.findAll = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });

    const user = req.user;
    const userUtente = String(user?.numero_utente || '').trim();

    let items;
    if (isAdminUser(user)) {
      items = await model.findAll();
    } else if (userUtente) {
      items = await model.findAll({
        where: {
          [db.Sequelize.Op.or]: [{ numero_utente: userUtente }, { pac_numero_utente: userUtente }],
        },
      });
    } else {
      items = [];
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado.' });
    if (!(await canAccessPatient(req.user, req.params.id))) {
      return res.status(403).json({ message: 'Sem permissões.' });
    }

    const item = await model.findByPk(req.params.id, {
      include: [
        {
          model: db.utilizadores,
          as: 'id_user_utilizadore',
          attributes: ['id_user', 'numero_utente', 'nome', 'email'],
          required: false,
        },
      ],
    });
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

    // Normalize PK
    if (body.numero_utente != null) body.numero_utente = String(body.numero_utente).trim();
    if (body.numero_utente === '') body.numero_utente = null;

    if (body.numero_utente) {
      const exists = await model.findByPk(body.numero_utente, { transaction: t });
      if (exists) {
        throw new Error('Já existe um paciente com esse NIF/número de utente.');
      }
    }

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
    const msgRaw = err?.message || '';
    const constraint = err?.original?.constraint || err?.parent?.constraint || '';
    const isPkDup = /paciente_pkey/i.test(String(constraint)) || /paciente_pkey/i.test(String(msgRaw));
    const isUnique = err?.name === 'SequelizeUniqueConstraintError' || isPkDup;

    if (isUnique) {
      return res.status(400).json({ message: 'Já existe um paciente com esse NIF/número de utente.' });
    }

    res.status(400).json({ message: msgRaw || 'Erro ao criar paciente' });
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
  const t = await db.sequelize.transaction();
  try {
    const numeroUtente = String(req.params.id || '').trim();
    if (!numeroUtente) return res.status(400).json({ message: 'Número de utente inválido.' });

    const visited = new Set();

    const deletePacienteCascade = async (utente) => {
      const key = String(utente || '').trim();
      if (!key || visited.has(key)) return;
      visited.add(key);

      // Carregar paciente (para obter id_user)
      const paciente = await model.findByPk(key, { transaction: t });
      if (!paciente) return;

      // 1) Apagar dependentes (pacientes cujo responsável é este)
      try {
        const dependentes = await model.findAll({ where: { pac_numero_utente: key }, transaction: t });
        for (const dep of dependentes) {
          await deletePacienteCascade(dep.numero_utente);
        }
      } catch {
        // ignore
      }

      // 2) Consultas e tabelas que dependem de consulta
      if (db.consulta) {
        const consultas = await db.consulta.findAll({ where: { numero_utente: key }, attributes: ['id_consulta'], transaction: t });
        const consultaIds = consultas.map((c) => c.id_consulta).filter((x) => x != null);

        if (consultaIds.length && db.tratamentorealizado) {
          await db.tratamentorealizado.destroy({ where: { id_consulta: consultaIds }, transaction: t });
        }

        await db.consulta.destroy({ where: { numero_utente: key }, transaction: t });
      }

      // 3) Registos clínicos diretos do paciente
      if (db.habitosestilovida) {
        await db.habitosestilovida.destroy({ where: { numero_utente: key }, transaction: t });
      }
      if (db.historicodentario) {
        await db.historicodentario.destroy({ where: { numero_utente: key }, transaction: t });
      }
      if (db.historicomedico) {
        await db.historicomedico.destroy({ where: { numero_utente: key }, transaction: t });
      }

      // 4) Notificações (via utilizador associado)
      const userId = paciente.id_user;
      if (userId && db.notificacao) {
        await db.notificacao.destroy({ where: { id_user: userId }, transaction: t });
      }

      // 5) Apagar o próprio paciente
      await paciente.destroy({ transaction: t });

      // 6) Apagar utilizador ligado ao paciente (para um re-registo ser "novo")
      if (db.utilizadores) {
        const whereUser = userId ? { id_user: userId } : { numero_utente: key };
        await db.utilizadores.destroy({ where: whereUser, transaction: t });
      }
    };

    await deletePacienteCascade(numeroUtente);
    await t.commit();
    res.json({ message: 'Deleted' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
