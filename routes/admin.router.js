const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroSequelize = require("admin-bro-sequelizejs");
const Admin = require("../models/User");


AdminBro.registerAdapter(AdminBroSequelize);

const adminBro = new AdminBro ({
  databases: [Admin],
  rootPath: "/admin",
  branding: {
    companyName: "Eugene Company",
    softwareBrothers: false,
  },
});


const ADMIN = {
  email: "test@example.com",
  password: "password",
};
const router = AdminBroExpress.buildRouter(adminBro)




module.exports = router;
