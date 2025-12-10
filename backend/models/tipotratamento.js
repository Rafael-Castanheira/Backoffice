const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tipotratamento', {
    id_tipo_tratamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    descricao_en: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    descricao_pt: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    precobase: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tipotratamento',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_tipotratamento",
        unique: true,
        fields: [
          { name: "id_tipo_tratamento" },
        ]
      },
      {
        name: "tipotratamento_pk",
        unique: true,
        fields: [
          { name: "id_tipo_tratamento" },
        ]
      },
    ]
  });
};
