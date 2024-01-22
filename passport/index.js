const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");

module.exports = (passport) => {
	//로그인한 사용자의 기본정보만 req.session객체에 저장
	//req.login()메소드 호출시 자동 호출됨.
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// 로그인 전략 설정
	kakao(passport);
};
