const { DataTypes, connection, commonFields } = require("./dataBase");
const Db = require("./dataBase");

const Customer = connection.define(
  "Customer",
  {
    Id_customer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pseudo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_connection: {
      type: DataTypes.DATE,
    },
    ...commonFields,
  },
  {
    tableName: "customer",
    timestamps: true,
    paranoid: true,
  }
);

Customer.hasOne(Db.getModel("Account"), { foreignKey: "Id_customer" });
Customer.hasMany(Db.getModel("Role"), { foreignKey: "Id_role" });

module.exports = Customer;
