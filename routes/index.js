var express = require('express');
var router = express.Router();

var bcrypt = require('bcryptjs');

// db객체 불러오기
var db = require('../models/index.js');
// Op객체 생성
const Op = db.sequelize.Op;


//passport 객체 참조
const passport = require('passport');

// 일회성(휘발성) 데이터를 특정 페이지(뷰)에 전달하는 방식제공 플래시 패키지 참조하기
var flash = require('connect-flash');

// 패스포트 미들웨어 참조하기 (로그인 성공, 실패)
const {isLoggedIn,isNotLoggedIn} = require('./passportMiddleware');

//로그인 여부 체크 사용자 권한 세션 미들웨어 참조하기
//const {isLoggedIn,isNotLoggedIn} = require('./sessionMiddleware');


// router.get('/', function(req, res) {
//     const isLoggedIn = req.session && req.session.isLoggedIn;
//     res.render('index', { 
//     isLoggedIn: isLoggedIn 
//     });
// });


router.get('/', isLoggedIn, async(req, res, next) => {
	
	var LoginUser = req.session.passport.user;

	res.render('index', {LoginUser})

});


router.get('/login',isNotLoggedIn, async(req, res)=>{
    res.render('/',{resultMsg:"", id:"", pw:"", layout:"loginLayout"});
});


router.post('/login', async(req, res)=>{
	
	try{
			// 사용자 로그인정보 추출
			var id = req.body.id; 
			var pw = req.body.pw;   

			// DB admin 테이블에서 동일한 메일주소의 단일사용자 정보를 조회한다.
			var admin = await db.Admin.findOne({where:{admin_id:id}});

			var resultMsg = '';

			if (admin == null) {
					resultMsg = '관리자 정보가 등록되지 않았습니다.'
			} else {
					// 입력한 패스워드가 db패스워드와 같을 때 메인페이지로 이동
					if(admin.admin_password == pw) {
							res.redirect('/');
					} else {
							resultMsg = '암호가 일치하지 않습니다.'
					}
			}

			if(resultMsg !=='') {
					res.render('login', {resultMsg, id, pw, layout:"loginLayout"})
					// res.redirect('/login');
			}
	} catch(err) {
			res.status(500).send('Internal Server Error');
	}

});

// 패스포트 로그인시
router.post('/passportLogin', async(req, res)=>{
	// 패스포트 기반 인증처리 메소드 호출하기
	passport.authenticate('local',(authError,admin,info)=> {
		// 인증에러 발생한 경우 에러값 반환
		if(authError) {
			console.log(authError);
			return next(authError);
		}

		// 만약 아이디가 틀린경우
		if(!admin) {
			// 리다이렉트 되는 페이지에 마지막 데이터를 던져준다
			req.flash('loginError', info.message);
			return res.redirect('/login');
		}

		// 정상적인 로그인이 완료된 경우 req.login(세션으로 저장할데이터);
		return req.login(admin, (loginError)=>{
			if(loginError) {
				console.log(loginError);
				return next(loginError);
			}

			// 정상적으로 세션데이터가 반영된 경우에 메인으로 이동
			return res.redirect('/'); 
		})

	});
	(req, res, next);
});


router.get('/forgot_password', async(req, res)=>{
	res.render('login/forgot_password', {resultMsg:"", email:"", layout:"loginLayout"});
});

router.post('/forgot_password', async (req, res) => {
	try {
			var Email = req.body.email;

			// DB admin 테이블에서 동일한 메일주소의 단일사용자 정보를 조회한다.
			var email = await db.Admin.findOne({ where: { email: Email } });

			var resultMsg = '';

			if (email == null) {
					resultMsg = '등록되지 않은 이메일 입니다.';
			} else {
					// db의 email의 email과 == 내가 입력한 email이 같으면
					if (email.email == Email) {

							console.log(`메일찾기 완료 :${Email} 입니다.`);
							resultMsg = '메일찾기 완료'
					}
			}

			if (resultMsg !== '') {
					res.render('login/forgot_password', { resultMsg, email, layout: "loginLayout" })
			}
	} catch (err) {
			console.error(err);
			res.status(500).send('Internal Server Error');
	}
});


router.get('/register', async(req, res)=>{
	res.render('login/register', {resultMsg:"", layout:"loginLayout"});
});

router.post('/register', async(req, res, next)=>{

	var resultMsg = {
		code: 400,
		data: null,
		msg: ""
	}

	var admin_id = req.body.admin_id;
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	var telephone = req.body.telephone;


	try {
			// 중복체크
			var regAdminId = await db.Admin.findOne({where:{admin_id}});

			if(regAdminId != null) {
				resultMsg.code = 500;
				resultMsg.data = null;
				resultMsg.msg = "alreadyRegisterID"
			} else {
				// 그게 아니면(중복이 아니면~) 등록하기
				
				// 단방향 암호화
				var bcryptedPassword = await bcrypt.hash(password, 12);
				// 양방향 암호화
				var encryptTelephone = await AES.encrypt(telephone, process.env.MYSQL_AES_KEY);
			
				var admins = {
						company_code: "1",
						admin_id: admin_id,
						admin_password: bcryptedPassword,
						admin_name: name,
						email: email,
						telephone: telephone,
						dept_name:"관리부",
						used_yn_code: "1",
						reg_date: Date.now()
				};
			
				var register = await db.Admin.create(admins);
			
				register.admin_password = "";

				var decryptTelephone = AES.decrypt(encryptTelephone, process.env.MYSQL_AES_KEY);
				register.telephone = decryptTelephone;

				resultMsg.code = 200;
				resultMsg.data = register;
				resultMsg.msg = "OK"

				res.render('login', {register, admins, resultMsg, layout:"loginLayout"});
			}
	} catch(err) {
		console.log("서버에러발생-/index/register", err.message);
		resultMsg.code = 500;
		resultMsg.data = null;
		resultMsg.msg = "Failed"
	}
});

router.get('/logout', (req, res) => {
	req.session.isLoggedIn = false; 
	res.redirect('/login');
});

module.exports = router;
