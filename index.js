const path = require('path');
const functions = require('firebase-functions');
const express= require('express');
const app = express();
const nodemailer = require('nodemailer');

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

    res.sendFile(path.join(__dirname, '/prodadmin/prodadmin.html'))
}



 app.get('/login', frontendHandler);
 app.get('/home', frontendHandler);
 app.get('/add', frontendHandler);
 app.get('/show', frontendHandler);



 //backend'
    
    const firebase = require('firebase')
    const session = require('express-session')
    app.use(session(
        {
        secret: 'anysecrestring.fjkdsaj!!!',
        name: '__session',
        saveUninitialized: false,
        resave: false,
        secure: true, // https
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
        rolling: true, // reset maxAge at every response
        }
    ))

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


   const adminUtil=require('./adminUtil.js')
   const Constants = require('./myconstants.js')

 app.get('/',auth, async(req,res) =>{

     

    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try {

        let products = []
        let snapshot = coll

        if(req.query.nextIndex!== undefined){
            snapshot = snapshot.orderBy("name","asc")
            snapshot = snapshot.startAfter(req.query.nextIndex)
        }
        else if(req.query.previousIndex !==undefined){
            snapshot = snapshot.where("name","<",req.query.previousIndex)
            snapshot = snapshot.orderBy("name","desc")
        }
        else{
            snapshot = snapshot.orderBy("name","asc")
        }
        snapshot = snapshot.limit(10)
        let returnValue = await snapshot.get()

        returnValue.forEach(doc=>{
            products.push({id: doc.id, data: doc.data()})
        })



        products = products.sort((current,next) => {

            if(current.data.name<next.data.name){
                return -1;
            }
            if(current.data.name>next.data.name){
                return 1;
            }
            return 0;



        })
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: false, products, user: req.decodedIdToken,cartCount})

    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: e, user: req.decodedIdToken,cartCount    })
        
    }
    
     
    
    })



    app.get('/b/about', auth, (req,res)=>{
        const cartCount = req.session.cart ? req.session.cart.length : 0
        res.setHeader('Cache-Control', 'private');
        res.render('about.ejs',{user: req.decodedIdToken,cartCount})
    })
    app.get('/b/contact',auth, (req,res)=>{
        const cartCount = req.session.cart ? req.session.cart.length : 0
        res.setHeader('Cache-Control', 'private');
        res.render('contact.ejs',{ user: req.decodedIdToken,cartCount})
    })
    app.get('/b/signin', (req,res)=>{
        res.setHeader('Cache-Control', 'private');
        res.render('signin.ejs',{error:false,user:req.decodedIdToken,cartCount:0})
    })


    app.post('/b/signin', async (req,res)=>{
        const email =  req.body.email
        const password = req.body.password
        const auth = firebase.auth()
        try {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
            const userRecord =  await auth.signInWithEmailAndPassword(email, password)
            const idToken = await userRecord.user.getIdToken()
            await auth.signOut()

            req.session.idToken = idToken

            if(userRecord.user.email=== Constants.SYSADMINEMAIL){
                res.setHeader('Cache-Control', 'private');
                res.redirect('/admin/sysadmin')

            }
            else{
                if(!req.session.cart){
                res.setHeader('Cache-Control', 'private');
                res.redirect('/')
            }else{
                res.setHeader('Cache-Control', 'private');
                res.redirect('/b/shoppingcart')
            }
            }
           
            
        } catch (e) {
            res.setHeader('Cache-Control', 'private');
            res.render('signin',{error: e,user:null,cartCount:0 })
            
        }
    })


    app.get('/b/signout',async(req,res)=>{

        req.session.destroy(err =>{
            if(err){
                console.log('========== session.destroy error: ',err)
                req.session=null
                res.send('ERROR: sign out(session destroy error)')
            }else{
                res.redirect('/')
            }
        })
    })


    app.get('/b/profile', authAndRedirectSignIn,( req,res)=>{
            
            const cartCount = req.session.cart?req.session.cart.length:0
            res.setHeader('Cache-Control', 'private'); 
            res.render('profile',{user:req.decodedIdToken,cartCount,orders:false})
        
    })

    app.get('/b/signup',(req,res)=>{

        res.render('signup.ejs',{page:'signup',user:null,error:false,cartCount:0})
    })


    const ShoppingCart = require('./model/ShoppingCart.js')



    app.post('/b/nextPage', async(req,res)=>{
        res.redirect('/?nextIndex='+req.body.nextIndex)

    })
    app.post('/b/previousPage', async(req,res)=>{
        res.redirect('/?previousIndex='+req.body.previousIndex)

    })

    app.post('/b/add2cart', async (req, res) => {
        const id = req.body.docId
        const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
       
        try {
            const doc = await collection.doc(id).get()
            let cart;
            if (!req.session.cart) {
                // first time add to cart
                cart = new ShoppingCart()
            } else {
                cart = ShoppingCart.deserialize(req.session.cart)
            }
            const {name, price, summary, image, image_url} = doc.data()
            cart.add({id, name, price, summary, image, image_url})
            
            
            req.session.cart = cart.serialize()
            res.setHeader('Cache-Control', 'private');
            res.redirect('/b/shoppingcart')
        } catch (e) {
            res.setHeader('Cache-Control', 'private');
            res.send(JSON.stringify(e))
        }
    })

    app.get('/b/shoppingcart',authAndRedirectSignIn, (req, res) => {
        let cart
        if (!req.session.cart) {
            cart = new ShoppingCart()
        } else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        res.setHeader('Cache-Control', 'private');
        res.render('shoppingcart.ejs', {message: false, cart, user: req.decodedIdToken, cartCount: cart.contents.length})
        
    })


    app.post('/b/checkout', authAndRedirectSignIn, async (req, res) => {
        if (!req.session.cart) {
            res.setHeader('Cache-Control', 'private');
            return res.send('Shopping Cart is Empty!')
        }
    
        // data format to store in firebase 
        // collection: orders
        // {uid, timestamp, cart}
        // cart = [{product, qty} ....] // contents in shoppingcart
        const user = req.decodedIdToken;
        let cart = req.session.cart;
        const data = {
            uid: user.uid,
            //timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            cart: cart
        }
    
        try {
            // set up the nodemailer here to send the email
            // ******** EMAIL SET UP **********
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'firestoreangular0@gmail.com',
                    pass: 'nipamonalisa1'
                }
            });
            // to is the currently logged in user
            let tableHeaders = `<tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Image</th>
            </tr>`;

            let tableRows = '';
            for(let i=0;i<cart.length;i++){
                tableRows += '<tr>';
                    tableRows +=`<td>${cart[i].product.name}</td>`;
                    tableRows +=`<td>${cart[i].product.price}</td>`;
                    tableRows +=`<td>${cart[i].qty}</td>`;
                    tableRows +=`<td><img src="${cart[i].product.image_url}" width="100px"/></td>`;
                tableRows += '</tr>';
            }

            let html = `<table border="1" style="border-collapse: collapse;width:400px;">
                            ${tableHeaders}
                            ${tableRows}
                        </table>`;

            const mailOptions = {
                from: 'firestoreangular0@gmail.com',
                to: user.email,
                subject: 'Checked Out Successfull!',
                html: html
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            // ******** END OF EMAIL SET UP ********
            await adminUtil.checkOut(data)
            req.session.cart = null;
            res.setHeader('Cache-Control', 'private');
            return res.render('shoppingcart.ejs',
                {message: 'Checked Out Successfully!', cart: new ShoppingCart(), user: req.decodedIdToken, cartCount: 0})
        } catch (e) {
            const cart = ShoppingCart.deserialize(req.session.cart)
            res.setHeader('Cache-Control', 'private');
            return res.render('shoppingcart.ejs',
            {message: 'Checked Out Failed. Try Again Later!', cart, user: req.decodedIdToken, cartCount: cart.contents.length}
            )
        }
    })  

    app.get('/b/orderhistory', authAndRedirectSignIn, async (req, res) => {
        try {
            const orders = await adminUtil.getOrderHistory(req.decodedIdToken)

            res.setHeader('Cache-Control', 'private');
            res.render('profile.ejs', {user: req.decodedIdToken, cartCount: 0, orders})
        } catch (e) {
            console.log('===========', e)
            res.setHeader('Cache-Control', 'private');
            res.send('<h1>Order History Error</h1>')
        }
    })

    // middleware
 async function authAndRedirectSignIn(req, res, next) {

    try {
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if(decodedIdToken.uid){
            req.decodedIdToken=decodedIdToken
            return next()
        }
    } catch (e) {
        console.log('=== authAndRidirect error',e)
        
    }
    res.setHeader('Cache-Control', 'private');
        return res.redirect('/b/signin')
}




    //middleware
    async function auth(req,res,next){

        try {
            if(req.session && req.session.idToken){
                const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
                req.decodedIdToken=decodedIdToken
            }else{
                req.decodedIdToken = null
            }
        } catch (e) {
            req.decodedIdToken=null
            
        }

        next()
    }

    


    //admin api
    app.post('/admin/signup',(req,res)=>{
        return adminUtil.createUser(req,res)

    })

    app.get('/admin/sysadmin',authSysAdmin,(req,res)=>{

        res.render('admin/sysadmin.ejs')
    })


    app.get('/admin/listUsers',authSysAdmin,(req,res)=>{

        return adminUtil.listUsers(req,res)
    })

    async function authSysAdmin(req,res,next){

        try {
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            if(!decodedIdToken||!decodedIdToken.email||decodedIdToken.email !== Constants.SYSADMINEMAIL){
                return res.send('<h1>System Admin Page: Access Denied!</h1>')
            }
            if(decodedIdToken.uid){
                req.decodedIdToken=decodedIdToken
                return next()
            }
            return res.send('<h1>System Admin Page: Access Denied!</h1>')
            
        } catch (e) {
            return res.send('<h1>System Admin Page: Access Denied!</h1>')
            
        }

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
        
        you entered  email: ${email} & password: ${password}

        `;
        res.send(page )

    })

    //testsigninwith post method

    app.post('/testsignin', (req,res)=>{

        const email= req.body.email
        const password = req.body.pass
       /* let page = `
        
        POST you entered email: ${email} & password: ${password}

        `;
        res.send(page)*///
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