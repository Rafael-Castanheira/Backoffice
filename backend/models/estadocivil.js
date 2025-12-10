const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('estadocivil', {
    id_estado_civil: {
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
    tableName: 'estadocivil',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "estadocivil_pk",
        unique: true,
        fields: [
          { name: "id_estado_civil" },
        ]
      },
      {
        name: "pk_estadocivil",
        unique: true,
        fields: [
          { name: "id_estado_civil" },
        ]
      },
    ]
  });
};
