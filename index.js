const http = require('http') 
const express = require('express') 
const cors = require('cors')

const { signup , login} = require('./services/userService')
const {posts, viewAllPost, viewUserPost, modifyPost, deletePost, threadLike} = require('./services/postService')

const app = express()   // express가 동작하는 app을 만듬
app.use(cors());
app.use(express.json()) // app.use  express에 오고가는 정보를 json타입으로

app.get('/ping', (req, res) => {res.json({ message: '/YBpong111'})})
app.post("/signup", signup) //회원가입 
app.post("/posts", posts)//게시글 등록
app.get("/viewAllPost",viewAllPost)//게시글 전체 보기
app.get("/viewuserPost",viewUserPost)//유저의 게시글 조회하기
app.put("/modifyPost", modifyPost) //게시글 수정하기
app.delete("/deletePost",deletePost) //게시글 삭제하기
app.post("/threadLike", threadLike) //좋아요 누르기
app.post("/login",login) // 로그인하기

const server = http.createServer(app)
const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
  }
}

start()

