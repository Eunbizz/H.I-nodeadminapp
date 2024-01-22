const KakaoStrategy = require("passport-kakao").Strategy;
var db = require('../models/index');

module.exports = (passport) => {
	passport.use(
		new KakaoStrategy(
			{
				clientID: process.env.KAKAO_ID,
				callbackURL: "http://localhost:3001/oauth",
			},
			async (accessToken, refreshToken, profile, done) => {
                const Admin = await db.Admin.findOne({ where: { admin_id: profile.id } });
                if (Admin) {
                    done(null, Admin);
                } else {
                    done(null, false, { message: '아이디가 일치하지 않습니다.' });
                }
                ;
            }
		)
	);
};