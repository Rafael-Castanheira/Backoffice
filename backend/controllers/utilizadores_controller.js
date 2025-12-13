const { models } = require('../config/db');

exports.create = async (req, res) => { try { res.status(201).send(await models.UTILIZADORES.create(req.body)); } catch (err) { res.status(500).send({ message: err.message }); } };
exports.findAll = async (req, res) => { try { res.send(await models.UTILIZADORES.findAll()); } catch (err) { res.status(500).send({ message: err.message }); } };
exports.findOne = async (req, res) => { try { const rec = await models.UTILIZADORES.findByPk(req.params.id); if (!rec) return res.status(404).send({message:'Not found'}); res.send(rec);}catch(err){res.status(500).send({message:err.message})} };
exports.update = async (req, res) => { try { const rec = await models.UTILIZADORES.findByPk(req.params.id); if (!rec) return res.status(404).send({message:'Not found'}); await rec.update(req.body); res.send({message:'Updated'});}catch(err){res.status(500).send({message:err.message})} };
exports.delete = async (req, res) => { try { const rec = await models.UTILIZADORES.findByPk(req.params.id); if (!rec) return res.status(404).send({message:'Not found'}); await rec.destroy(); res.status(204).send();}catch(err){res.status(500).send({message:err.message})} };
