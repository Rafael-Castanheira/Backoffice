const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('historicodentario', {
    id_historico_dentario: {
      type: DataTypes.INTEGER,
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
    motivo_consulta_inicial: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condicao_dent_preexists: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    historico_tratamentos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experiencia_anestesias: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    historico_dor_sensibilidade: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_registo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'historicodentario',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "historicodentario_pk",
        unique: true,
        fields: [
          { name: "id_historico_dentario" },
        ]
      },
      {
        name: "paci_histdent_fk",
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "pk_historicodentario",
        unique: true,
        fields: [
          { name: "id_historico_dentario" },
        ]
      },
    ]
  });
};
