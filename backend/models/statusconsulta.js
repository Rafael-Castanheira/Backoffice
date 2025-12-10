const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('statusconsulta', {
    id_status_consulta: {
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
    tableName: 'statusconsulta',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_statusconsulta",
        unique: true,
        fields: [
          { name: "id_status_consulta" },
        ]
      },
      {
        name: "statusconsulta_pk",
        unique: true,
        fields: [
          { name: "id_status_consulta" },
        ]
      },
    ]
  });
};
