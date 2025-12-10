const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('horariomedico', {
    id_horario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'medico',
        key: 'id_medico'
      }
    },
    dia_semana: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: true
    },
    hora_fim: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'horariomedico',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "horariomedico_pk",
        unique: true,
        fields: [
          { name: "id_horario" },
        ]
      },
      {
        name: "med_histmed_fk",
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "pk_horariomedico",
        unique: true,
        fields: [
          { name: "id_horario" },
        ]
      },
    ]
  });
};
