const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tipoparentesco', {
    id_tipo_parentesco: {
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
    tableName: 'tipoparentesco',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_tipoparentesco",
        unique: true,
        fields: [
          { name: "id_tipo_parentesco" },
        ]
      },
      {
        name: "tipoparentesco_pk",
        unique: true,
        fields: [
          { name: "id_tipo_parentesco" },
        ]
      },
    ]
  });
};
