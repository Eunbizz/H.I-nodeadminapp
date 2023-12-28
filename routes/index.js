var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    const isLoggedIn = req.session && req.session.isLoggedIn;
    res.render('index', { 
    isLoggedIn: isLoggedIn 
    });
});

router.get('/login', async(req, res)=>{
    res.render('login/login',{layout:"loginLayout"});
});

router.post('/login', async(req, res)=>{

  // 사용자 로그인정보 추출
    var id = req.body.id; 
    var password = req.body.password;   

    var users = {
        id,
        password
    };

  // DB admin 테이블에서 동일한 메일주소의 단일사용자 정보를 조회한다.

  isValidUser = true; 
  console.log(isValidUser);
  if (isValidUser) { 
    res.redirect('/'); 
  } else {
    res.render('login/login', { error: 'Invalid credentials' });
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
