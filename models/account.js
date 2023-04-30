const Db = require("./dataBase");
const { DataTypes, connection, commonFields } = require("./dataBase");

const Account = connection.define(
  "Account",
  {
    Id_account: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ...commonFields,
  },
  {
    tableName: "account",
    timestamps: true,
    paranoid: true,
  }
);

Account.belongsTo(Db.getModel("Customer"), { foreignKey: "Id_customer" });

module.exports = Account;
