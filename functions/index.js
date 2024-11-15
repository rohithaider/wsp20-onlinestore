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

  app.get("/", auth, async (req, res) => {
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS);
    try {
      let products = [];
      const snapshot = await coll.orderBy("name").get();
      let Items = []
  
      if(req.query.search){
        Items = req.query.search.split(",") || [];
      }
  
      snapshot.forEach(doc => {
        if(Items.length > 0){
          Items.forEach(item=>{
            if(doc.data().name.toLowerCase().includes(item)){
              products.push({ id: doc.id, data: doc.data() });
            }
          })
        }
        else{
        products.push({ id: doc.id, data: doc.data() });
        }
      });
      res.render("storefront.ejs", { error: false, products, user: req.user });
    } catch (e) {
      res.render("storefront.ejs", { error: e, user: req.user });
    }
  });
  



    app.get('/b/about', auth, (req,res)=>{
        res.render('about.ejs',{user: req.user})
    })
    app.get('/b/contact',auth, (req,res)=>{
        res.render('contact.ejs',{ user: req.user})
    })
    


    app.get('/b/signin', (req,res)=>{
        res.render('signin.ejs',{error:false,user:req.user})
    })

    app.post('/b/signin', async (req,res)=>{
        const email =  req.body.email
        const password = req.body.password
        const auth = firebase.auth()
        try {
            const user =  await auth.signInWithEmailAndPassword(email, password)
            res.redirect('/')
            
        } catch (e) {
            res.render('signup',{error: e,user:req.user })
            
        }
    })


    app.get('/b/signout',async(req,res)=>{
        try {

            await firebase.auth().signOut()
            res.redirect('/')
            
        } catch (e) {
            res.send('ERROR: sign out')
            
        }
    })

    app.get('/b/signup', (req,res)=>{
        res.render('signup.ejs',{error:false,user:req.user})
    })
    app.get('/signup', (req,res)=>{
        res.render('signup.ejs',{error:false,user:req.user})
    })

    app.post('/b/signup', async (req,res)=>{
        const email =  req.body.email
        const password = req.body.password
        const auth = firebase.auth()
        try {
            const user =   auth.createUserWithEmailAndPassword(email,password)
            res.redirect('/b/profile')
            
        } catch (e) {
            res.render('signup',{error: e,user:req.user })
            
        }
          });
        
            
        
    


    /* GET Profile page. */ 
    app.get('/b/profile',  (req, res)=> {
        res.render('profile.ejs',{error:false,user:req.user})
    })


    //middleware
    function auth(req,res,next){
        req.user=firebase.auth().currentUser
        next()
    }



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
