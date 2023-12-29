module.exports = function(sequelize, DataTypes){
    return sequelize.define(
        'member',
    {
        member_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: '회원고유번호',
        },
        email_address:{
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '이메일주소',
        },
        password:{
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: '비밀번호',
        },
        name:{
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '이름',
        },
        profile_image_path:{
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: '프로필이미지경로',
        },
        phone_number:{
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: '전화번호',
        },
        birth_date:{
            type: DataTypes.STRING(50),
            allowNull: true,
            comment:'생년월일',
        },
        register_method_code:{
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: '가입방법코드 0:이메일 1:Facebook 2:Google 3:Kakao',
        },
        use_state_code:{
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: '사용상태코드 1:사용중 0:정지',
        },
        reg_date:{
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '등록일시',
        },
        reg_member_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '가입자고유번호',
        },
        edit_date:{
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '수정일시',
        },
        edit_member_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '수정자고유번호',
        }
    },
    {
        sequelize,
        timestamps: false,
        comment: '회원정보',
        indexes:[
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [
                    { name: 'member_id' },
                ]
            },
        ]
    });
}