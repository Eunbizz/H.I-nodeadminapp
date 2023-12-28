var express = require('express');
var router = express.Router();

// db객체 불러오기
var db = require('../models/index.js');
// Op객체 생성
const Op = db.sequelize.Op;

router.get('/', function(req, res) {
    const isLoggedIn = req.session && req.session.isLoggedIn;
    res.render('index', { 
    isLoggedIn: isLoggedIn 
    });
});

router.get('/login', async(req, res)=>{
    res.render('login',{resultMsg:"", id:"", password:"", layout:"loginLayout"});
});

router.post('/login', async(req, res)=>{

    // 사용자 로그인정보 추출
    var id = req.body.id; 
    var password = req.body.password;   

    // DB admin 테이블에서 동일한 메일주소의 단일사용자 정보를 조회한다.
    var admin = await db.Admin.findOne({where:{admin_id:id}});

    var resultMsg = '';

    if (admin == null) {
        resultMsg = '관리자 정보가 등록되지 않았습니다.'
    } else {
        // 입력한 패스워드가 db패스워드와 같을 때 메인페이지로 이동
        if(admin.password == password) {
            res.redirect('/');
        } else {
            resultMsg = '암호가 일치하지 않습니다.'
        }
    }

    if(resultMsg !=='') {
        res.render('/login', {resultMsg, id, password})
    }
});

router.get('/forgot_password', async(req, res)=>{
    res.render('login/forgot_password', {layout:"loginLayout"});
});

router.post('/forgot_password', async(req, res)=>{
    res.redirect('/login');
});

router.get('/register', async(req, res)=>{
    res.render('login/register', {layout:"loginLayout"});
});

router.get('/register', async(req, res)=>{
    res.redirect('/login');
});

router.get('/logout', (req, res) => {
    req.session.isLoggedIn = false; 
    res.redirect('/login');
});

module.exports = router;
