const {appDataSource} = require('./database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//회원가입
const signup = async (req, res) => {
  try {
    const nickName = req.body.nickname || "YB"
    const email = req.body.email
    const password = req.body.password
    const salt = 10;

    //이미 가입된 이메일인지 확인
    const findEmail = await appDataSource.query(`
    SELECT email, password FROM users
    WHERE email='${email}'
    `) 

    if (findEmail.length !== 0){return res.status(401).json({message : 'ALREADY_JOINED_EMAIL'})}

    const hashedPassword = await bcrypt.hash(password,salt) //비밀번호 hashing
    const hashData = await appDataSource.query(`
      INSERT INTO users
      (nickname, email, password)
      VALUES
      ('${nickName}','${email}', '${hashedPassword}')
    `)
    res.status(201).json({"message":"SIGNUP_SUCCESS"})
    console.log("hash data:",hashData)
    
  } catch(err) {
    console.log(err)
  }
  }
  // 로그인 함순
  const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const payload = { email : email , password : password}

    
    //1. 프론트에서 보내준 이메일로 데이터베이스에서 비밀번호를 찾는다
    const findEmail = await appDataSource.query(`
    SELECT email, password FROM users
    WHERE email='${email}'
    `)
    if (findEmail.length === 0){return res.status(404).json({message : 'EMAIL_NOT_FOUND'})} // EMAIL 없을 때

    //2. 프론트에서 보내준 비밀번호와 비교한다
    const checkHash = await bcrypt.compare(password, findEmail[0].password)
    
    if (!checkHash) {return res.status(401).json({"message":"WRONG_PASSWORD"})} // 비밀번호 틀렸을 때

    const token = jwt.sign(payload, process.env.TYPEORM_SECRETKEY,{expiresIn:600})  //  jwt.sign으로 토큰 생성
    console.log(token)
    res.status(201).json({message:"LOGIN_SUCCSESS",token}) // 비밀번호 맞았을 때
  }

  
  module.exports = { signup ,login } 
