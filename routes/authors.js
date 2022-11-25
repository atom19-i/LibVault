const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Books = require('../models/book')

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
//##should be above get("/:id") req 
//as otherwise /new would be considered as id 
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
        res.redirect(`authors/${newAuthor.id}`) 

    } catch {
        res.render('authors/new' , {
             author: author,
             errorMessage: 'Error creating Author'
        })
    }
})

router.get('/:id', async(req,res) => {
   try {
    const author = await Author.findById(req.params.id)
    const books = await Books.find({ author: author.id}).limit(6).exec()
    res.render('authors/show', {
        author: author,
        booksByAuthor : books
    })
    } catch {
        res.redirect('/')
   }
})

router.get('/:id/edit', async(req,res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author : author })
    } catch {
        res.redirect('/authors')
    } 
})

//from browser only get n post req can be made.
// to make put n delete req, method override is used
router.put('/:id/', async (req,res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)

    } catch {
        if(author == null){
            res.redirect('/')
        } else {
            //if author does exist
            res.render('authors/edit' , {
                author: author,
                errorMessage: 'Error updating Author'
           })
        } 
    }
})


//do not use get request here
router.delete('/:id', async(req,res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch {
        if(author == null){
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        } 
    }
})

module.exports = router