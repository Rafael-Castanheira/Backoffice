const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('med_spec', {
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'medico',
        key: 'id_medico'
      }
    },
    id_especialidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'especialidade',
        key: 'id_especialidade'
      }
    }
  }, {
    sequelize,
    tableName: 'med_spec',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "med_spec2_fk",
        fields: [
          { name: "id_especialidade" },
        ]
      },
      {
        name: "med_spec_fk",
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "med_spec_pk",
        unique: true,
        fields: [
          { name: "id_medico" },
          { name: "id_especialidade" },
        ]
      },
      {
        name: "pk_med_spec",
        unique: true,
        fields: [
          { name: "id_medico" },
          { name: "id_especialidade" },
        ]
      },
    ]
  });
};
