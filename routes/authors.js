const express = require('express')
const router = express.Router()
const Author = require('../models/author')

//all authors route
router.get('/', async(req,res) => {
 let searchOptions = {} //will store search objects
 // get req sends information thru query string ex: //link//?name=Iti

 if(req.query.name!= null && req.query.name!== ''){
    //Regular exp allows one to search via part of the word and it returns its full word
     searchOptions.name = new RegExp( req.query.name, 'i')//i flag=> case insensitive
 }
 try{
    const authors = await Author.find(searchOptions)
    res.render('authors/index', { 
        authors: authors,
        searchOptions: req.query
    })
  } catch {

 }
})

//new author route
router.get('/new', (req,res) => {
    res.render('authors/new', {author : new Author() })
})

//create new authors
// when we will create new authors,we will send data
router.post('/', async(req,res) => {
    const author = new Author({
        name : req.body.name
    })
    try{
        const newAuthor = await author.save()
        // redirecting to the new page of particular author
        //     used backticks on redirect arguement here
        // res.redirect(`authors/${newAuthor.id}`) 
        res.redirect(`authors`)

    } catch {
        res.render('authors/new' , {
             author: author,
             errorMessage: 'Error creating Author'
        })
    }
})

module.exports = router