
function signup() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    alert(`회원가입 완료!\n사용자명: ${username}\n이메일: ${email}`);

}
