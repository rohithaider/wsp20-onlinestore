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
    const firebase = require('firebase')
  // Your web app's Firebase configuration
    const  firebaseConfig = {
    apiKey: "AIzaSyCxgWlDxyung7fo595cWARkSe6SV6YQyxA",
    authDomain: "mohtashimr-wsp20.firebaseapp.com",
    databaseURL: "https://mohtashimr-wsp20.firebaseio.com",
    projectId: "mohtashimr-wsp20",
    storageBucket: "mohtashimr-wsp20.appspot.com",
    messagingSenderId: "686773858610",
    appId: "1:686773858610:web:d7443d94a2b279a891e72b"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const Constants = require('./myconstants.js')

 app.get('/', async(req,res) =>{
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try {

        let products = []
        const snapshot=await coll.orderBy("name").get()
        snapshot.forEach(doc=>{
            products.push({id: doc.id, data: doc.data()})
        })

        res.render('storefront.ejs', {error: false, products})


        
    } catch (e) {
        res.render('storefront.ejs', {error: e})
        
    }
    
     
    
    })



    app.get('/b/about', (req,res)=>{
        res.render('about.ejs')
    })
    app.get('/b/contact', (req,res)=>{
        res.render('contact.ejs')
    })
    app.get('/b/signin', (req,res)=>{
        res.render('signin.ejs',{error:false})
    })

    app.post('/b/signin', async (req,res)=>{
        const email =  req.body.email
        const password = req.body.password
        const auth = firebase.auth()
        try {
            const user =  await auth.signInWithEmailAndPassword(email, password)
            res.redirect('/')
            
        } catch (e) {
            res.render('signin',{error: e })
            
        }
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
            c: '<h1>Login Success </h1>',
            d: '<h1>Login Success </h1>',


            start:1,
            end: 10




        }

        res.render('home',obj)

    })