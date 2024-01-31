var express = require("express");
var router = express.Router();
var bycrpt = require("bcryptjs");
var AES = require("mysql-aes");
const passport = require("passport");
var flash = require('connect-flash');

// db객체 불러오기
var db = require("../models/index.js");
var users = require("../controllers/users");
// Op객체 생성
const Op = db.sequelize.Op;
const { isLoggedIn, isNotLoggedIn } = require("./sessionMiddleware");
const { isLoggedIn_pass, isNotLoggedIn_pass } = require("./passportMiddleware.js");

router.get('/', isLoggedIn, async(req, res)=>{

    // 패스포트 세션 기반 로그인 사용자 정보 추출하고 싶다면 이렇게
    var admin_id = req.session.passport.user.admin_id;

    res.render('index');
});

router.get('/', isLoggedIn, async(req, res, next) => {
	var LoginUser = req.session.passport.user;
	res.render('index', {LoginUser})
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

router.get("/forgot_password", async (req, res) => {
	res.render("login/forgot_password", { resultMsg: "", email: "", layout: "loginLayout" });
});

router.post("/forgot_password", async (req, res) => {
	try {
		var Email = req.body.email;

		// DB admin 테이블에서 동일한 메일주소의 단일사용자 정보를 조회한다.
		var email = await db.Admin.findOne({ where: { email: Email } });

		var resultMsg = "";

		if (email == null) {
			resultMsg = "등록되지 않은 이메일 입니다.";
		} else {
			// db의 email의 email과 == 내가 입력한 email이 같으면
			if (email.email == Email) {
				console.log(`메일찾기 완료 :${Email} 입니다.`);
				resultMsg = "메일찾기 완료";
			}
		}

		if (resultMsg !== "") {
			res.render("login/forgot_password", { resultMsg, email, layout: "loginLayout" });
		}
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

router.get("/register", async (req, res) => {
	res.render("login/register", { resultMsg: "", layout: "loginLayout" });
});

router.post("/register", async (req, res) => {
	try {
		// 회원가입 정보
		var { admin_id, email, password, name, telephone } = req.body;

		password = await bycrpt.hash(password, 12);
		telephone = AES.encrypt(telephone, process.env.MYSQL_AES_KEY);

		var admins = {
			company_code: "1",
			admin_id: admin_id,
			admin_password: password,
			admin_name: name,
			email: email,
			telephone: telephone,
			dept_name: "관리부",
			used_yn_code: "1",
			reg_date: Date.now(),
		};

		var register = await db.Admin.create(admins);

		var resultMsg = "";

		if (register == !null) {
			resultMsg = "회원가입 실패";
		} else {
			resultMsg = "회원가입 완료. 로그인 후 이용바랍니다";
		}

		res.render("login", { register, admins, resultMsg, layout: "loginLayout" });
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

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

router.get("/auth/kakao", passport.authenticate("kakao", {
		failureRedirect: "/login",
	}),
	users.signin
);

router.get("/oauth", passport.authenticate("kakao", {
		failureRedirect: "/login",
	}),
	users.authCallback
);

module.exports = router;
