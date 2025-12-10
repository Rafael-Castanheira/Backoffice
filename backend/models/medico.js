const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('medico', {
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'utilizadores',
        key: 'id_user'
      }
    }
  }, {
    sequelize,
    tableName: 'medico',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "medico_pk",
        unique: true,
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "pk_medico",
        unique: true,
        fields: [
          { name: "id_medico" },
        ]
      },
      {
        name: "user_med2_fk",
        fields: [
          { name: "id_user" },
        ]
      },
    ]
  });
};
