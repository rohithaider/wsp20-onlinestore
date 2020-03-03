const path = require('path')
const functions = require('firebase-functions');
const express= require('express')
 const app = express()

exports.httpReq = functions.https.onRequest(app)


//using middleware for using post method in login.html

app.use(express.urlencoded({extended: false}))

//using this middlware to upload image by backend

app.use('/public', express.static(path.join(__dirname,'/static')))

//set template engine
app.set('view engine', 'ejs')
//location of ejs files
app.set('views','./ejsviews')



//frontend developement

function frontendHandler(req, res){


    res.sendFile(__dirname + '/prodadmin/prodadmin.html')
}



 app.get('/login', frontendHandler);
 app.get('/home', frontendHandler);
 app.get('/add', frontendHandler);
 app.get('/show', frontendHandler);



 //backend'

 app.get('/', (req,res) =>{


    
     console.log(req.headers)
     

    res.send('<h1>My Store(from backend)</h1>')
    
    })

    //test code
     
    app.get('/test', (req,res)=>{

        const time =  new Date().toString()
        let page=`
        
        <h1> Current time at server is : ${time}</h1>


        `;

        res.header('refresh',1)

        res.send(page)



    })

    app.get('/test2', (req,res)=>{

res.redirect('http://www.uco.edu')

    })

    //test login

    app.get('/testlogin', (req,res)=>{

        res.sendFile(path.join(__dirname,'/static/html/login.html'))
    })



    //testSignIn

    app.get('/testsignin', (req,res)=>{

        const email= req.query.email
        const password = req.query.pass
        let page = `
        
        you entered email: ${email} & password: ${password}

        `;
        res.send(page)

    })

    //testsigninwith post method

    app.post('/testsignin', (req,res)=>{

        const email= req.body.email
        const password = req.body.pass
       /* let page = `
        
        POST you entered email: ${email} & password: ${password}

        `;
        res.send(page)*/
        const obj={
            a:email,
            b:password,
            c: 'Login Success'



        }

        res.render('home',obj)

    })