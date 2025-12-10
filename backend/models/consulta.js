const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('consulta', {
    id_consulta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_status_consulta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'statusconsulta',
        key: 'id_status_consulta'
      }
    },
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'medico',
        key: 'id_medico'
      }
    },
    numero_utente: {
      type: DataTypes.STRING(9),
      allowNull: true,
      references: {
        model: 'paciente',
        key: 'numero_utente'
      }
    },
    data_hora_consulta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'consulta',
    timestamps: false
  });
};
