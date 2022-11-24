const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif', 'image/pjpg']

//all books route
router.get('/', async(req,res) => {
 let query = Book.find()
 if(req.query.title!= null && req.query.title!=""){
  query = query.regex('title', new RegExp(req.query.title, 'i'))
 }

 //lte : less than/equal to
 //gte : greater than/equal to
 if(req.query.publishedBefore!= null && req.query.publishedBefore!=""){
  query = query.lte('publishDate',req.query.publishedBefore)
 }

 if(req.query.publishedAfter!= null && req.query.publishedAfter!=""){
  query = query.gte('publishDate',req.query.publishedAfter)
 }


  try{ 
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
  
})

//new book route
router.get('/new', async (req,res) => {
  renderNewPage(res, new Book())
})

//create new books
router.post('/',  async(req,res) => {
  // req.body.publishDate will return string and Date() will convert string to date
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try{
   const newBook = await book.save()
   //(`books/${newBook.id}`)
   res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})


//passing book as sometimes it will be existing book or new one
async function renderNewPage(res, book, hasError = false){
  try{
    const authors = await Author.find({})
    //to create errorMessage dynamically, use params
    const params = {
      authors: authors,
      book: book
     }

     if(hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new' , params)
   } catch {
     res.redirect('/books')
   }
}

function saveCover(book, coverEncoded){
  if(coverEncoded == null) return 

  const cover = JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router