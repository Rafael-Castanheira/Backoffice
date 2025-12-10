const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('especialidade', {
    id_especialidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    descricao_pt: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    descricao_en: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'especialidade',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "especialidade_pk",
        unique: true,
        fields: [
          { name: "id_especialidade" },
        ]
      },
      {
        name: "pk_especialidade",
        unique: true,
        fields: [
          { name: "id_especialidade" },
        ]
      },
    ]
  });
};
