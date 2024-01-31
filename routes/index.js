var express = require('express');
var router = express.Router();

var bcrypt = require('bcryptjs');

// db객체 불러오기
var db = require('../models/index.js');
// Op객체 생성
const Op = db.sequelize.Op;

const AES = require('mysql-aes');
const jwt = require('jsonwebtoken');

const passport = require('passport')

const { isLoggedIn, isNotLoggedIn } = require('./passportMiddleware.js');


router.get('/', isLoggedIn, async(req, res)=>{

    // 패스포트 세션 기반 로그인 사용자 정보 추출하고 싶다면 이렇게
    var admin_id = req.session.passport.user.admin_id;

    res.render('index');
});


router.get('/login', isNotLoggedIn, async(req, res)=>{
    res.render('login',{resultMsg:"", id:"", pw:"", layout:"loginLayout", loginError:req.flash('loginError')});

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
});


router.get('/', isLoggedIn, async(req, res, next) => {
	
	var LoginUser = req.session.passport.user;

	res.render('index', {LoginUser})

});


router.get('/login',isNotLoggedIn, async(req, res)=>{
    res.render('/',{resultMsg:"", id:"", pw:"", layout:"loginLayout"});
});

// express-session 기반
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
            // 단방향 암호 일치 여부 체크
            var comparePassword = await bcrypt.compare(pw, admin.admin_password);
            // 입력한 패스워드가 db패스워드와 같을 때 세션 값 세팅 후 메인페이지로 이동
            if(comparePassword) {
                
                // 전화번호 복호화
                var decryptTelephone = AES.decrypt(admin.telephone, process.env.MYSQL_AES_KEY);

                // 서버에 메모리 공간에 저장할 로그인한 현재 사용자의 세션 정보 구조 및 데이터바인딩
                var sessionLoginData = {
                    admin_member_id:admin.admin_member_id,
                    company_code:admin.company_code,
                    admin_id:admin.admin_id,
                    admin_name:admin.admin_name,
                    telephone:decryptTelephone
                };

                // req.session 속성에 동적속성으로 loginAdmin 생성하고 값으로 세션값 세팅
                req.session.loginAdmin = sessionLoginData;

                // 동적속성에 저장된 신규속성 저장
                req.session.save(function(){
                    res.redirect('/');
                })
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
        console.log(err)
    }

});


// passport 기반
router.post('/passportlogin', async(req, res, next)=>{
    // local 전략을 쓴다고 명시, passport/index.js에서 localStrategy를 찾아서 실행
    passport.authenticate('local', (authError, admin, info) =>{

        if (authError) {
            console.error(authError);
            return next(authError); // err handler로 던져버리기
        }
        if (!admin) { // false가 넘어오는 경우 (비번, 아이디 오류)
            // redirect로 이동할 때 메시지를 같이 보내고 싶을 때
            // connect-flash 설치 후 req.flash() 메서드 사용 가능
            // req.flash(키, 값)
            req.flash('loginError', info.message); // flash 객체를 통해 err 메시지 던져줌
            return res.redirect('/login');
        }
        // 정상적인 로그인이 완료된 경우 req.login(세션저장데이터)
        return req.login(admin, (loginError) =>{
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            // 정상 로그인 시 메인페이지로 이동
            return res.redirect('/');
        })

        
    })(req, res, next);

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

        // 단방향 암호화
        var bcryptedPassword = await bcrypt.hash(password, 12);
        // 양방향 암호화
        var encryptTelephone = AES.encrypt(telephone, process.env.MYSQL_AES_KEY);

        var admins = {
            company_code: "1",
            admin_id: admin_id,
            admin_password: bcryptedPassword,
            admin_name: name,
            email: email,
            telephone: encryptTelephone,
            dept_name:"관리부",
            used_yn_code: "1",
            reg_date: Date.now()
        };
        
        var register = await db.Admin.create(admins);

        var resultMsg = '';
        
        register.admin_password = "";
        register.telephone = AES.decrypt(encryptTelephone, process.env.MYSQL_AES_KEY);

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

// 동기 방식 로그아웃
// 로그아웃과 세션 파기 작업이 완료된 후 리다이렉트 등의 동작을 하기 위해
router.get('/logout', function(req, res, next){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        // 세선 파기
        req.session.destroy();
        res.redirect('/login');
    });
});

module.exports = router;
