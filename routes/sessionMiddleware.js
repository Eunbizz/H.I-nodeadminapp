// 사용시 로그인 여부를 체크하는 미들웨어
// 비로그인 상태이면 로그인 페이지로 이동시킨다.

exports.isLoggedin = (req, res, next) =>{
    // 현재 로그인 상태이면 요청한 라우팅 메소드로 제어를 넘긴다.
    if (req.session.isLogined) {
        next();
    }else{
        res.redirect("/login");
    }
}

// 로그인을 안한 상태의 경우 특정 페이지로 이동
// 만약에 회원가입 페이지에 대한 요청이 들어왔는데 로그인이 이미 된 상태인 경우
exports.isNotLoggedin = (req, res, next) =>{
    if (!req.session.isLogined) {
        next();
    }else{
        res.redirect("/");
    }
}