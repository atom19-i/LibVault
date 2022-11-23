const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

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
    const books = await query.exec
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
router.post('/', upload.single('cover'), async(req,res) => {
  const fileName = req.file != null ? req.file.filename : null 
  // req.body.publishDate will return string and Date() will convert string to date
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageBasePath: fileName,
    description: req.body.description
  })

  try{
   const newBook = await book.save()
   //(`books/${newBook.id}`)
   res.redirect(`books`)
  } catch {
    if(book.coverImageName != null){   
      removeBookCover(book.coverImageName)
    }
    renderNewPage(res, book, true)
  }
})

//for removing coverImage for book that failed in getting created 
//but was saving coverImage in uploadPath
function removeBookCover(fileName){
 fs.unlink(path.join(uploadPath, fileName), err => {
  if(err) console.err(err)
 })
}

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


module.exports = router