const {appDataSource} = require('./database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//게시물 등록
const posts = async (req, res) => {
  try {
    const token = req.headers.token
    const decoded = jwt.verify(token, process.env.TYPEORM_SECRETKEY)
    console.log(decoded)
  } catch (err) {
    console.log(err)
  }
    const userId = req.body.user_id
    const content = req.body.content

    const data = await appDataSource.query (`
    insert into threads (user_id, content) values ('${userId}', '${content}')
    `
    )
    console.log(data)
  
    res.status(201).json({message:"success"})
  }
  
  //전체 게시물 조회
  const viewAllPost = async (req, res) => {
    const data = await appDataSource.query(`
    SELECT * from threads
    `)
    console.log(data)
  
    res.status(200).json({"message":"success",data})
  }
  
  //유저의 게시글 조회하기
  const viewUserPost = async (req, res) => {
    //유저의 ID 받아서 content 보여주기
    const userId = req.body.user_id
    //db에서 쏴주기
    const data = await appDataSource.query (`
    select * from threads where user_id ='${userId}'
    `)
  
    console.log(data)
    
    res.status(200).json({"message":"success"})
  }
  
  //유저의 게시글 수정하기
  const modifyPost = async (req, res) => {
    try {
    const token = req.headers.token
    const decoded = jwt.verify(token, process.env.TYPEORM_SECRETKEY)
    console.log("decoded" ,decoded)
    const threadId=req.query.threadid
    const userId=req.body.users_id
    const content =req.body.content
    
    // 1 게시물이 존재여부 
    const existThread = await appDataSource.query(`
    SELECT * FROM threads WHERE id = '${threadId}'
    `)
    if (existThread.length ===0 ){ return res.status(404).json({message:'THREADS_NOT_FOUND'})} /// 1.1 게시물없으면없다는 사실 응답. 
    
    // 2 유저 존재 여부
    const existUser = await appDataSource.query(`
    SELECT * FROM users WHERE id = '${userId}'
    `)
    if (existUser.length === 0){ return res.status(404).json({message:'USER_NOT_FOUND'})} // 2 유저가 없다는 사실 응답. 

    // 3 수정하려는 사람이 게시글 작성자가 맞는지 판단
    if (existThread[0].user_id !== existUser[0].id) { return res.status(404).json({message:'UNAUTHENTICATED'})} //4 아니면 권한없다고 응답.
    // 
    // //5 맞으면 수정하기
    const updateThreads = await appDataSource.query(`
    UPDATE threads
    SET content ='${content}'
    WHERE id = '${threadId}'
    `)
    console.log(updateThreads)
    // 프론트한테 알려주기
    return res.status(200).json({message:'UPDATED'})
    } catch (err) {
      console.error(err)
      res.json({message:"TOKEN_ERROR"})
    }
    

  }
  
  //게시글 삭제하기
  const deletePost = async (req, res) => {
    const userId = req.query.userid
    const threadId = req.query.threadid
    
//1 게시물 존재여부 
    const existThread = await appDataSource.query(`
      SELECT * 
      FROM threads
      WHERE id='${threadId}'
    `)
    if (existThread.length===0){ return res.status(404).json({message:'THREADS_NOT_EXIST '})}
// 유저 존재여부
    const existUser = await appDataSource.query(`
      SELECT *
      FROM users
      WHERE id='${userId}'
    `)
    if (existUser.length===0){return res.status(404).json({message:'USER_NOT_FOUND '})}
//-------------삭제요청한 사람이 게시글 주인인지. userId <-  게시글주인 threadId  
    if (existThread[0].user_id !== existUser[0].id) {return res.status(404).json({message:'DIFFERENT_ID'})}

    const deleteThreads = await appDataSource.query(`
      DELETE
      FROM threads
      WHERE id='${threadId}'
    `)

    console.log(deleteThreads)
    res.status(200).json({message:'DELETE_SUCCESS'})
  }

  //좋아요 누르기
  const threadLike = async (req, res)=> {
    //user_id랑 thread_id 받아서 
    const userId=req.body.user_id
    const threadId=req.body.thread_id
    //데이터베이스에 행 추가
    const data = await appDataSource.query(`
    INSERT INTO thread_likes (user_id, thread_id) values ('${userId}', '${threadId}')
    `)
  
    console.log(data)
  }
 

module.exports = { posts, viewAllPost, viewUserPost, modifyPost, deletePost, threadLike }
