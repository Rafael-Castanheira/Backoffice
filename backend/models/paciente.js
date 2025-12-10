const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paciente', {
    numero_utente: {
      type: DataTypes.STRING(9),
      allowNull: false,
      primaryKey: true
    },
    pac_numero_utente: {
      type: DataTypes.STRING(9),
      allowNull: true,
      references: {
        model: 'paciente',
        key: 'numero_utente'
      }
    },
    id_estado_civil: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estadocivil',
        key: 'id_estado_civil'
      }
    },
    id_genero: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'genero',
        key: 'id_genero'
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
    id_tipo_parentesco: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipoparentesco',
        key: 'id_tipo_parentesco'
      }
    },
    nif: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    profissao: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contacto_telefonico: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    morada: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    codigo_postal: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    numero_utente_responsavel: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'paciente',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "gen_paci_fk",
        fields: [
          { name: "id_genero" },
        ]
      },
      {
        name: "paciente_pk",
        unique: true,
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "parentesco_fk",
        fields: [
          { name: "id_tipo_parentesco" },
        ]
      },
      {
        name: "pk_paciente",
        unique: true,
        fields: [
          { name: "numero_utente" },
        ]
      },
      {
        name: "responsabilidade_fk",
        fields: [
          { name: "pac_numero_utente" },
        ]
      },
      {
        name: "statusciv_paci_fk",
        fields: [
          { name: "id_estado_civil" },
        ]
      },
      {
        name: "user_paci2_fk",
        fields: [
          { name: "id_user" },
        ]
      },
    ]
  });
};
