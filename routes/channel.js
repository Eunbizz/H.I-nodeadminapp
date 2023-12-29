const express = require('express');
const router = express.Router();

/* 
채팅방 목록
- http://localhost:3001/channel/list
- get
*/
router.get('/list', async(req, res) => {
    var channels = 
        {
            channelIdx: 1,
            title: "1번 채팅방 입니다.",
            contents: "1번째 채팅방 내용입니다.",
            view_cnt: 100,
            display: "Y",
            ipaddress: "111.111.111.111",
            registDate: Date.now(),
            registMemberId: "Eunbi",
        }
    
    res.render('channel/list', {channels});
});



router.get('/create', async(req, res) => {
    res.render('channel/create');
});



router.post('/create', async(req, res) => {

    res.redirect('/channel/list');
});



router.get('/modify/:id', async(req, res)=>{
  
    var channelId = req.params.id;
  
    const channels = {
        channelIdx: channelId,
        title: "1번 채팅방 입니다.",
        contents: "1번째 채팅방 내용입니다.",
        view_cnt: 100,
        display: "Y",
        ipaddress: "111.111.111.111",
        registDate: Date.now(),
        registMemberId: "Eunbi",
    }
  
    res.render('channel/modify.ejs', {channels})
  })
  
  // 목록페이지 이동처리
  router.post('/modify/:id', async(req, res)=>{
    var channelId = req.params.id;
    res.redirect('/channel/list')
  })
  
  // 목록페이지 이동처리
  router.get('/delete', async(req, res)=>{
    res.redirect('/channel/list')
  })
  

module.exports = router;
