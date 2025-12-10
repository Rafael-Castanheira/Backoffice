const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('consulta', {
    id_consulta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    sequelize,
    tableName: 'consulta',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "consulta_pk",
        unique: true,
        fields: [
          { name: "id_consulta" },
        ]
      },
      {
        name: "med_sulta_fk",
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "paci_sulta_fk",
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "pk_consulta",
        unique: true,
        fields: [
          { name: "id_consulta" },
        ]
      },
      {
        name: "sultastatus_sulta_fk",
        fields: [
          { name: "id_status_consulta" },
        ]
      },
    ]
  });
};
