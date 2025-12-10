const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notificacao', {
    id_notificacao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_tipo_notificacao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipo_notificacao',
        key: 'id_tipo_notificacao'
      }
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'utilizadores',
        key: 'id_user'
      }
    },
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    data_envio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    payload_extra: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'notificacao',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "notificacao_pk",
        unique: true,
        fields: [
          { name: "id_notificacao" },
        ]
      },
      {
        name: "pk_notificacao",
        unique: true,
        fields: [
          { name: "id_notificacao" },
        ]
      },
      {
        name: "relationship_18_fk",
        fields: [
          { name: "id_user" },
        ]
      },
      {
        name: "relationship_19_fk",
        fields: [
          { name: "id_tipo_notificacao" },
        ]
      },
    ]
  });
};
