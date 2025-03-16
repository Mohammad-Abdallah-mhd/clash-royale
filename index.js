'use strict';
const express =require('express')
const app=express();
require('axios')
const cors=require('cors')
app.use(cors())
const jsonD=require('./data.json')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const port =process.env.PORT || 3002
const { Client } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const url=`postgresql://charc_user:63fxvmRiH3XCqPgMX58ypiN7oJZUyIai@dpg-cv5eb9ogph6c73arjp4g-a.frankfurt-postgres.render.com/charc`

const client = new Client({
  connectionString: url,
  ssl: {
    rejectUnauthorized: false, // هذا مهم جدًا مع Render أو الخدمات المجانية
  }
});
  
//route
app.get('/',homehandler)
app.get('/getall',getallD)
app.post('/addcard',addcard)
app.post('/addfav',addfav)
app.get('/getfav',getallfav)
app.delete('/deletecard/:id',deletecard)
app.put('/update/:id',updatecard)
//handlers
async function updatecard(req, res) {
 
      let id = req.params.id;
      const { title, img } = req.body;

      const sql = `UPDATE charc SET title = $1, img = $2 WHERE id = $3 RETURNING *`;
      const values = [title,  img, id];

       client.query(sql, values).then(data=>{
        const sql=`Select *From charc`

        client.query(sql).then(data=>{
          return res.send(data.rows);
        })
       })

  
}
function addfav(req,res){
const card=req.body;
const sql = `INSERT INTO charc (title, elixir, img, is_favorite) VALUES ($1, $2, $3,true) RETURNING *;`;
const values=[card.title,card.elixir,card.img]
client.query(sql,values).then(resu=>{
res.json(resu.rows[0])


}).catch()
}
function deletecard(req,res){
  let id =req.params.id;
  console.log(id)
  let sql=`DELETE FROM charc WHERE id=$1;`
  let values=[id];

client.query(sql,values).then(resu=>{
  console.log("yess");
  
  res.json({ message: "Deleted successfully", id: id });
}).catch()
}
function getallfav(req,res){
  const sql = `SELECT * FROM charc WHERE is_favorite = true`;
  client.query(sql).then((resu=>{
    res.json(resu.rows)
  }))
  .catch(e=>{
    console.log("ahhhh");
    
  })

}
function addcard(req,res){
  const {title,elixir,arena,img,is_favorite}=req.body
const sql=`INSERT INTO charc (title,elixir,arena,img,is_favorite) VALUES
($1,$2,$3,$4,$5) RETURNING *;`
const values=[title,elixir,arena,img,is_favorite]
client.query(sql,values).then(resu=>{
res.status(201).json(resu.rows)

}).catch(e=>{
  res.send(e)
})
}
function getallD(req,res){

const sql =`SELECT *FROM charc where is_favorite = false`
client.query(sql).then((resu=>{
  res.json(resu.rows)
}))
.catch(e=>{
  console.log("ahhhh");
  
})


}
function homehandler(req,res){
console.log("Hello");

}
//listener
client.connect();
app.listen(port,()=>{

    console.log(`listening to port ${port}`);
    
})