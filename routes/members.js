// 사용자 계정 정보(사용자 사이트에서 가입한 사용자 정보) 관리 라우팅 기능
// http://localhost:3000/member/~

var express = require("express");
var router = express.Router();
var db = require("../models/index.js");
var Op = db.Sequelize.Op;

router.get("/list", async (req, res, next) => {
  searchOption = {
    email_address: "",
    name: "",
    phone_number: "",
  };
  try {
    var members = await db.members.findAll();
    res.render("members/list", { members, searchOption });
  } catch (err) {
    console.error("Error reading the file:", err);
    res.status(500).send("Error reading the user data.");
  }
});

router.post("/list", async (req, res) => {
  const { email_address, name, phone_number } = req.body;
  let whereClause = {};
  if (email_address) {
    whereClause.email_address = { [Op.like]: `%${email_address}%` };
  }
  if (name) {
    whereClause.name = { [Op.like]: `%${name}%` };
  }
  if (phone_number) {
    whereClause.phone_number = { [Op.like]: `%${phone_number}%` };
  }
  try {
    var members = await db.members.findAll({ where: whereClause });
    searchOption = { email_address, name, phone_number };
    res.render("members/list", { members, searchOption });
  } catch (err) {
    console.error("Error reading the file:", err);
    res.status(500).send("Error reading the user data.");
  }
});

router.get("/create", async (req, res) => {
  res.render("members/create.ejs");
});

router.post("/create", async (req, res) => {
  member_id = req.body.member_id;
  email_address = req.body.email_address;
  password = req.body.password;
  name = req.body.name;
  profile_image_path = req.body.profile_image_path;
  phone_number = req.body.phone_number;
  birth_date = req.body.birth_date;
  register_method_code = req.body.register_method_code;
  use_state_code = req.body.use_state_code;
  reg_member_id = 1,
  reg_date = new Date().toLocaleDateString();

  const member = {
    member_id,
    email_address,
    password,
    name,
    profile_image_path,
    phone_number,
    birth_date,
    register_method_code,
    use_state_code,
    reg_member_id,
    reg_date,
  };
  await db.members.create(member);
  res.redirect("/members/list");
});

router.get("/modify/:id", async (req, res) => {
  var member_id = req.params.id;
    var member = await db.members.findOne({
        where:{
            member_id
        }
    });
    res.render('members/modify', {member});
});

router.post("/modify/:id", async (req, res) => {
  var member_id = req.params.id;
  email_address = req.body.email_address;
  password = req.body.password;
  name = req.body.name;
  profile_image_path = req.body.profile_image_path;
  phone_number = req.body.phone_number;
  birth_date = req.body.birth_date;
  register_method_code = req.body.register_method_code;
  use_state_code = req.body.use_state_code;
  edit_member_id = 1,
  edit_date = new Date().toLocaleDateString();

  const member = {
    member_id,
    email_address,
    password,
    name,
    profile_image_path,
    phone_number,
    birth_date,
    register_method_code,
    use_state_code,
    edit_member_id,
    edit_date,
  };

  try {
    await db.members.update(member,{
        where:{
            member_id
        }
    });
    res.redirect("/members/list");

  } catch (err) {
      console.error("Error updating the file:", err);
      res.status(500).send("Error updating the user data.");
  }
});

router.get('/delete/:aid',async(req, res)=>{
  var member_id = req.params.aid;
  try {
      await db.members.destroy({
          where:{
              member_id
          }
      });
      res.redirect("/members/list");
  } catch (err) {
      console.error("Error deleting the file:", err);
      res.status(500).send("Error deleting the user data.");
  }
});

module.exports = router;
