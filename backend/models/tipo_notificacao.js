const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tipo_notificacao', {
    id_tipo_notificacao: {
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
    tableName: 'tipo_notificacao',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_tipo_notificacao",
        unique: true,
        fields: [
          { name: "id_tipo_notificacao" },
        ]
      },
      {
        name: "tipo_notificacao_pk",
        unique: true,
        fields: [
          { name: "id_tipo_notificacao" },
        ]
      },
    ]
  });
};
