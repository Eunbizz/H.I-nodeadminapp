var bycrpt = require("bcryptjs");
const LocalStrategy = require('passport-local').Strategy;
var db = require('../models/index');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password'
    }, async (adminId, adminPWD, done) => {
        try {
            const admin = await db.Admin.findOne({ where: { admin_id: adminId } });
            
            if (admin) {
                const result = await bycrpt.compare(adminPWD, admin.admin_password);

                if (result) {
                    var sessionLoginData = {
                        admin_member_id: admin.admin_member_id,
                        company_id: admin.company_id,
                        admin_id: admin.admin_id,
                        admin_name: admin.admin_name,
                    };
                    done(null, sessionLoginData);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '아이디가 일치하지 않습니다.' });
            }
        } catch (err) {
            done(err);
        }
    }));
}
