var DataTypes = require("sequelize").DataTypes;
var _consulta = require("./consulta");
var _especialidade = require("./especialidade");
var _estadocivil = require("./estadocivil");
var _genero = require("./genero");
var _habitosestilovida = require("./habitosestilovida");
var _historicodentario = require("./historicodentario");
var _historicomedico = require("./historicomedico");
var _horariomedico = require("./horariomedico");
var _med_spec = require("./med_spec");
var _medico = require("./medico");
var _notificacao = require("./notificacao");
var _paciente = require("./paciente");
var _statusconsulta = require("./statusconsulta");
var _tipo_notificacao = require("./tipo_notificacao");
var _tipoparentesco = require("./tipoparentesco");
var _tipotratamento = require("./tipotratamento");
var _tipouser = require("./tipouser");
var _tratamentorealizado = require("./tratamentorealizado");
var _utilizadores = require("./utilizadores");

function initModels(sequelize) {
  var consulta = _consulta(sequelize, DataTypes);
  var especialidade = _especialidade(sequelize, DataTypes);
  var estadocivil = _estadocivil(sequelize, DataTypes);
  var genero = _genero(sequelize, DataTypes);
  var habitosestilovida = _habitosestilovida(sequelize, DataTypes);
  var historicodentario = _historicodentario(sequelize, DataTypes);
  var historicomedico = _historicomedico(sequelize, DataTypes);
  var horariomedico = _horariomedico(sequelize, DataTypes);
  var med_spec = _med_spec(sequelize, DataTypes);
  var medico = _medico(sequelize, DataTypes);
  var notificacao = _notificacao(sequelize, DataTypes);
  var paciente = _paciente(sequelize, DataTypes);
  var statusconsulta = _statusconsulta(sequelize, DataTypes);
  var tipo_notificacao = _tipo_notificacao(sequelize, DataTypes);
  var tipoparentesco = _tipoparentesco(sequelize, DataTypes);
  var tipotratamento = _tipotratamento(sequelize, DataTypes);
  var tipouser = _tipouser(sequelize, DataTypes);
  var tratamentorealizado = _tratamentorealizado(sequelize, DataTypes);
  var utilizadores = _utilizadores(sequelize, DataTypes);

  especialidade.belongsToMany(medico, { as: 'id_medico_medicos', through: med_spec, foreignKey: "id_especialidade", otherKey: "id_medico" });
  medico.belongsToMany(especialidade, { as: 'id_especialidade_especialidades', through: med_spec, foreignKey: "id_medico", otherKey: "id_especialidade" });
  tratamentorealizado.belongsTo(consulta, { as: "id_consulta_consultum", foreignKey: "id_consulta"});
  consulta.hasMany(tratamentorealizado, { as: "tratamentorealizados", foreignKey: "id_consulta"});
  med_spec.belongsTo(especialidade, { as: "id_especialidade_especialidade", foreignKey: "id_especialidade"});
  especialidade.hasMany(med_spec, { as: "med_specs", foreignKey: "id_especialidade"});
  paciente.belongsTo(estadocivil, { as: "id_estado_civil_estadocivil", foreignKey: "id_estado_civil"});
  estadocivil.hasMany(paciente, { as: "pacientes", foreignKey: "id_estado_civil"});
  paciente.belongsTo(genero, { as: "id_genero_genero", foreignKey: "id_genero"});
  genero.hasMany(paciente, { as: "pacientes", foreignKey: "id_genero"});
  consulta.belongsTo(medico, { as: "id_medico_medico", foreignKey: "id_medico"});
  medico.hasMany(consulta, { as: "consulta", foreignKey: "id_medico"});
  horariomedico.belongsTo(medico, { as: "id_medico_medico", foreignKey: "id_medico"});
  medico.hasMany(horariomedico, { as: "horariomedicos", foreignKey: "id_medico"});
  med_spec.belongsTo(medico, { as: "id_medico_medico", foreignKey: "id_medico"});
  medico.hasMany(med_spec, { as: "med_specs", foreignKey: "id_medico"});
  utilizadores.belongsTo(medico, { as: "id_medico_medico", foreignKey: "id_medico"});
  medico.hasMany(utilizadores, { as: "utilizadores", foreignKey: "id_medico"});
  consulta.belongsTo(paciente, { as: "numero_utente_paciente", foreignKey: "numero_utente"});
  paciente.hasMany(consulta, { as: "consulta", foreignKey: "numero_utente"});
  habitosestilovida.belongsTo(paciente, { as: "numero_utente_paciente", foreignKey: "numero_utente"});
  paciente.hasMany(habitosestilovida, { as: "habitosestilovidas", foreignKey: "numero_utente"});
  historicodentario.belongsTo(paciente, { as: "numero_utente_paciente", foreignKey: "numero_utente"});
  paciente.hasMany(historicodentario, { as: "historicodentarios", foreignKey: "numero_utente"});
  historicomedico.belongsTo(paciente, { as: "numero_utente_paciente", foreignKey: "numero_utente"});
  paciente.hasMany(historicomedico, { as: "historicomedicos", foreignKey: "numero_utente"});
  paciente.belongsTo(paciente, { as: "pac_numero_utente_paciente", foreignKey: "pac_numero_utente"});
  paciente.hasMany(paciente, { as: "pacientes", foreignKey: "pac_numero_utente"});
  utilizadores.belongsTo(paciente, { as: "numero_utente_paciente", foreignKey: "numero_utente"});
  paciente.hasMany(utilizadores, { as: "utilizadores", foreignKey: "numero_utente"});
  consulta.belongsTo(statusconsulta, { as: "id_status_consulta_statusconsultum", foreignKey: "id_status_consulta"});
  statusconsulta.hasMany(consulta, { as: "consulta", foreignKey: "id_status_consulta"});
  notificacao.belongsTo(tipo_notificacao, { as: "id_tipo_notificacao_tipo_notificacao", foreignKey: "id_tipo_notificacao"});
  tipo_notificacao.hasMany(notificacao, { as: "notificacaos", foreignKey: "id_tipo_notificacao"});
  paciente.belongsTo(tipoparentesco, { as: "id_tipo_parentesco_tipoparentesco", foreignKey: "id_tipo_parentesco"});
  tipoparentesco.hasMany(paciente, { as: "pacientes", foreignKey: "id_tipo_parentesco"});
  tratamentorealizado.belongsTo(tipotratamento, { as: "id_tipo_tratamento_tipotratamento", foreignKey: "id_tipo_tratamento"});
  tipotratamento.hasMany(tratamentorealizado, { as: "tratamentorealizados", foreignKey: "id_tipo_tratamento"});
  utilizadores.belongsTo(tipouser, { as: "id_tipo_user_tipouser", foreignKey: "id_tipo_user"});
  tipouser.hasMany(utilizadores, { as: "utilizadores", foreignKey: "id_tipo_user"});
  medico.belongsTo(utilizadores, { as: "id_user_utilizadore", foreignKey: "id_user"});
  utilizadores.hasMany(medico, { as: "medicos", foreignKey: "id_user"});
  notificacao.belongsTo(utilizadores, { as: "id_user_utilizadore", foreignKey: "id_user"});
  utilizadores.hasMany(notificacao, { as: "notificacaos", foreignKey: "id_user"});
  paciente.belongsTo(utilizadores, { as: "id_user_utilizadore", foreignKey: "id_user"});
  utilizadores.hasMany(paciente, { as: "pacientes", foreignKey: "id_user"});

  return {
    consulta,
    especialidade,
    estadocivil,
    genero,
    habitosestilovida,
    historicodentario,
    historicomedico,
    horariomedico,
    med_spec,
    medico,
    notificacao,
    paciente,
    statusconsulta,
    tipo_notificacao,
    tipoparentesco,
    tipotratamento,
    tipouser,
    tratamentorealizado,
    utilizadores,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
