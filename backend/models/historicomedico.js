const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('historicomedico', {
    id_historico: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    numero_utente: {
      type: DataTypes.STRING(9),
      allowNull: true,
      references: {
        model: 'paciente',
        key: 'numero_utente'
      }
    },
    condicoes_saude: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medicamentos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alergias: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    historico_cirurgico: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gravidez: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    data_registo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'historicomedico',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "historicomedico_pk",
        unique: true,
        fields: [
          { name: "id_historico" },
        ]
      },
      {
        name: "paci_histmed_fk",
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "pk_historicomedico",
        unique: true,
        fields: [
          { name: "id_historico" },
        ]
      },
    ]
  });
};
