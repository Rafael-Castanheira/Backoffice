const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tratamentorealizado', {
    id_tratamento_realizado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_tipo_tratamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipotratamento',
        key: 'id_tipo_tratamento'
      }
    },
    id_consulta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'consulta',
        key: 'id_consulta'
      }
    },
    dente_numero: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preco_cobrado: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tratamentorealizado',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_tratamentorealizado",
        unique: true,
        fields: [
          { name: "id_tratamento_realizado" },
        ]
      },
      {
        name: "sulta_tratfeito_fk",
        fields: [
          { name: "id_consulta" },
        ]
      },
      {
        name: "tratamentorealizado_pk",
        unique: true,
        fields: [
          { name: "id_tratamento_realizado" },
        ]
      },
      {
        name: "trattipo_tratfeito_fk",
        fields: [
          { name: "id_tipo_tratamento" },
        ]
      },
    ]
  });
};
