const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('habitosestilovida', {
    id_habito: {
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
    attribuhigiene_oralhigiene: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    habitos_alimentares: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    consumo_substancias: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bruxismo: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    atividades_desportivas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_registo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'habitosestilovida',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "habitosestilovida_pk",
        unique: true,
        fields: [
          { name: "id_habito" },
        ]
      },
      {
        name: "paci_habit_fk",
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "pk_habitosestilovida",
        unique: true,
        fields: [
          { name: "id_habito" },
        ]
      },
    ]
  });
};
