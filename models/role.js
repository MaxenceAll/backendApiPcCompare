const { DataTypes, connection, commonFields } = require ('./dataBase');
const Db = require("./dataBase");

const Role = connection.define(
  "Role",
  {
    Id_role: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ...commonFields,
  },
  {
    tableName: "role",
    timestamps: true,
    paranoid: true,
  }
);


module.exports = Role;
