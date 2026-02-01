const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('utilizadores', {
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // removed direct FK reference to avoid circular constraint on initial sync
      // (medico also references utilizadores). Add FK using migrations if needed.
    },
    id_tipo_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipouser',
        key: 'id_tipo_user'
      }
    },
    numero_utente: {
      type: DataTypes.STRING(9),
      allowNull: true,
      references: {
        model: 'paciente',
        key: 'numero_utente'
      }
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    password_hash: {
      // Increased to support bcrypt hashes (≈60 chars) and future improvements.
      type: DataTypes.STRING(255),
      allowNull: true
    },
    data_criacao: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'utilizadores',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_utilizadores",
        unique: true,
        fields: [
          { name: "id_user" },
        ]
      },
      {
        name: "tipoutilizador_fk",
        fields: [
          { name: "id_tipo_user" },
        ]
      },
      {
        name: "user_med_fk",
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "user_paci_fk",
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "utilizadores_pk",
        unique: true,
        fields: [
          { name: "id_user" },
        ]
      },
    ]
  });
};
