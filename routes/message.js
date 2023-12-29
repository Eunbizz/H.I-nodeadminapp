const express = require('express');
const router = express.Router();

// db객체 불러오기
var db = require('../models/index.js');
// Op객체 생성
const Op = db.sequelize.Op;


router.get('/list', async(req, res) => {

    var channelMsgOption = {
        channel_msg_id: "1",
        channel_id: "1",
        member_id:"",
        nick_name:"",
        msg_type_code:"0",
        connection_id:"",
        message:"",
        ip_address:"",
        msg_date:Date.now(),
        del_date:""
    }

    try {
        var msgs = await db.ChannelMessage.findAll(
            {
                msg: ['channel_msg_id','channel_id','member_id','nick_name','msg_type_code','connection_id','message','ip_address','msg_date','del_date'],
                order: [['channel_id', 'DESC']]
            }
        );
        res.render('message/list', {msgs, channelMsgOption});
    }catch(err) {
        console.error("Error reading the file:", err);
        res.status(500).send("Error reading the user data.");
    }
});


router.get('/create', async(req, res) => {
    res.render('message/create');
});



router.post('/create', async(req, res) => {
  // 생성 처리 로직
    const {contents, register} = req.body;

    var createMsg = {
        channel_msg_id:1,
        channel_id:1,
        member_id:1,
        msg_type_code: 3,
        connection_id: register,
        message: contents,
        ip_address:"192.168.0.1",
        msg_date: Date.now(),
        nick_name: register,
    }

    await db.ChannelMessage.create(createMsg);
    res.redirect('/message/list', createMsg);
});

router.get('/delete', async(req, res) => {
    // 삭제 처리 로직
    res.redirect('/message/list');
});


router.get('/modify/:idx', async(req, res) => {
    res.render('message/modify');
});


router.post('/modify:idx', async(req, res) => {
  // 수정 처리 로직
    res.redirect('/message/list');
});



module.exports = router;
