const express = require('express')
const bcrypt = require('bcrypt')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDoc, doc, setDoc, getDocs, deleteDoc, updateDoc } = require('firebase/firestore')
require("dotenv/config")

// Configuracion de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0BbeKKaEYMjPq7s5kwStlanmafg5CgAA",
    authDomain: "back-firebase-c84cc.firebaseapp.com",
    projectId: "back-firebase-c84cc",
    storageBucket: "back-firebase-c84cc.appspot.com",
    messagingSenderId: "556731039471",
    appId: "1:556731039471:web:3ba8e173e6ff6d5b3da51a"
  }

//Iniciar BD con Firebase
  const firebase = initializeApp(firebaseConfig)
  const db = getFirestore()

  //Inicializar el servidor
  const app = express()

  app.use(express.json())

  //Rutas para las peticiones EndPoint
  //Ruta registro
  app.post('/registro', (req,res) => {
    const {name, lastname, email, password, number} = req.body

    //Validaciones de los datos
    if(name.length < 3) {
      res.json({
        'alert': 'nombre requiere minimo 3 caracters'
      })
    } else if (lastname.length <3){
      res.json({
        'alert': 'nombre requiere minimo 3 caracters'
      })
    } else if (!email.length) {
      res.json({
        'alert': 'debes escribir tu correo electronico'
      })
    } else if (password.length < 8) {
      res.json({
        'alert': 'password requiere minimo 8 caracters'
      })
    } else if (!Number(number) || number.length < 10) {
      res.json({
        'alert': 'introduce un numero telefonico correcto'
      })
    } else {
      const users = collection(db, 'users')

      //Ruta de usuarios
      
      //verificar que el correo no exista en la collections
      getDoc(doc(users, email)).then( user =>{
        if(user.exists()) {
          res.json({
            'alert': 'El correo ya existe'
          })
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              req.body.password = hash

              //guardar en la db
              setDoc(doc(users, email), req.body).then( reg => {
                res.json({
                  'alert': 'success',
                  'data': reg
                })
              })
            })
          })
        }
      })
    }
  })

  app.get('/usuarios', async (req, res)=> {
    const colRef = collection(db, 'users')
    const docsSnap = await getDocs(colRef)
    let data = []
    docsSnap.forEach(doc => {
      data.push(doc.data())
    })
    res.json({
      'alert': 'success',
      data
    })
  })
  
  app.post('/login', (req, res) => {
    let { email, password } = req.body
  
    if (!email.length || !password.length) {
      return res.json({
        'alert': 'no se han recibido los datos correctamente'
      })
    }
  
    const user = collection(db, 'users')
    getDoc(doc(users, email))
    .then( user => {
      if (!user.exists()){
        return res.json({
          'alert': 'Correo no registrado en la base de datos'
        })
      } else {
        bcrypt.compare(password, user.data().password, (error, result) => {
          if (result) {
            let data = user.data()
            res.json({
              'alert': 'Success',
              name: data.name,
              email: data.email
            })
          } else {
              return res.json({
                'alert': 'Password Incorrecto'
            })
          }
        })
      }
    })
  })

  //Ruta borrar 
  app.post('/delete', (req, res) => {
    let {id} = req.body

    deleteDoc (doc(collection(db, 'users'), id))
    .then((response) => {
      res.json ({
        'alert': 'success'
      })
    })
    .catch((error) => {
      res.json({
        'alert': error
      })
    })
  })
  
  //Actualizar
app.post('/update', (req, res) => {
    const {id ,name, lastname,  number} = req.body

    //Validaciones de los datos
    if(name.length < 3) {
      res.json({
        'alert': 'nombre requiere minimo 3 caracters'
      })
    } else if (lastname.length <3){
      res.json({
        'alert': 'nombre requiere minimo 3 caracters'})

      } else if (!Number(number) || number.length < 10) {
      res.json({
        'alert': 'introduce un numero telefonico correcto'
      })
    } else {  
      db.collection('users').doc(id)
      const updateData = {
        name,
        lastname,
        number
      }
      updateDoc (doc(db, 'users'), updateData, id)
      .then((response) => {
        res.json ({
          'alert': 'success'
        })
      })
      .catch((error) => {
        res.json({
          'alert': error
        })
      })
    }
  })


  const PORT = process.env.PORT || 19000





  // Ejecutamos el servidor
  app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
  })