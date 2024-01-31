
var bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
var db = require('../models/index');

module.exports = passport => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'userid', //로그인 페이지의 사용자아이디 UI INPUT 요소 name값
        passwordField: 'userpwd',//로그인 페이지의 사용자 암호 INPUT 요소 name값
      },
      async (userId, userPWD, done) => {

        try {

          const exUser = await db.Member.findOne({ where: { userid: userId } });
          if (exUser) {
            const result = await bcrypt.compare(userPWD, exUser.userpwd);
            if (result) {

              var sessionUser = {
                userPSeq: exUser.id,
                userId: exUser.userid,
                userName: exUser.username,
                userPhone: exUser.userphone,
              };

              done(null, sessionUser);
            } else {
              //사용자 암호가 일치하지 않은 경우
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            //사용자 아이디가 존재하지 않은경우
            done(null, false, { message: '아이디가 존재하지 않습니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      },
    ),
  );
};

