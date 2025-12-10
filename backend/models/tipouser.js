const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tipouser', {
    id_tipo_user: {
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
    tableName: 'tipouser',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_tipouser",
        unique: true,
        fields: [
          { name: "id_tipo_user" },
        ]
      },
      {
        name: "tipouser_pk",
        unique: true,
        fields: [
          { name: "id_tipo_user" },
        ]
      },
    ]
  });
};
