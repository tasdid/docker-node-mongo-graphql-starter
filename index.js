const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const mongoose = require('mongoose')

mongoose.connect('mongodb://mongo:27017/myapp', {useNewUrlParser: true})
mongoose.connection
  .on('error', console.error.bind(console, 'Connection error:'))
  .once('open', () => console.log('Connected to Mongo...'))
console.log(`Connecting.. ${mongoose.connection.readyState}`)
setTimeout(() => console.log(mongoose.connection.readyState), 1000)

const bookSchema = new mongoose.Schema({
  title: { type: String , lowercase: true },
  author: String,
  date: { type: Date , default: Date.now }
});
const Book = mongoose.model('Book', bookSchema)

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }
  type Query {
    books(query: String): [Book]
  }
  type Mutation {
    createBook(title: String, author: String): Book
  }
`
const resolvers = {
  Query: {
    // books: () => Book.find(),
    books(parent, args, ctx, info) {
      if (!args.query) {
          return Book.find()
      }
    },
  },
  Mutation: {
    async createBook(parent, args, ctx, info) {
      const book = new Book({
          title: args.title,
          author: args.author
      })
      const r = await book.save()
      console.log(r);
      return r
    },
  },
}
const server = new ApolloServer({ typeDefs, resolvers })
const app = express()
server.applyMiddleware({ app }) // path defaults to /graphql 
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)

// save data
// async function createBook() {
//   const book = new Book({
//     title: 'Harry Potter and the Chamber of Secrets',
//     author: 'J.K. Rowling'
//   })
//   const r = await book.save()
//   console.log(r);
// }
// createBook();

// query data
// async function getBook() {
//   const books = await Book.find()
//   console.log(books);
//   return books
// }
// getBook();

// update data
// async function updateBook(id) {
//   const book = await Book.update({ _id: id }, { 
//     $set: { 
//       title: 'Jurassic Park',
//       author: 'Michael Crichton'
//     }
//   });
//   console.log(book);
// }
// updateBook('5d71e3eaababc90cd5f46690');

// delete data
// async function deleteBook(id) {
//   const book = await Book.deleteOne({ _id: id })
//   console.log(book);
// }
// deleteBook('5d71e360dc72240cb3f28990');

// mongoose.Promise = global.Promise

// MongoDB setup
// docker run -p 27017:27017 mongo
// mongod --config /usr/local/etc/mongod.conf

// # docker image prune -a
// # docker image prune
// # docker network prune
// # docker volume prune
// # docker container prune
// # docker system df

// docker system prune -a --volumes
// docker network prune
// docker-compose up --build  

// Volumes allow you to mount folders on the host machine to folders in the container. Meaning, when something inside the container refers to a folder, it will actually be accessing a folder on the host machine. This is especially helpful for database containers because containers are meant to be disposable. With a mount to the physical folder on the host machine, you’ll be able to destroy a container and rebuild it and the data files for the container will still be there on the host machine. So add a volume tag in the db section mounting the /data/db folder in the container (where Mongo stores its data) to the db folder in your application’s root folder

// Links
// https://developer.okta.com/blog/2017/10/11/developers-guide-to-docker-part-3
// https://github.com/vguleaev/Express-Mongo-Docker-tutorial/tree/master/test-mongo-app
// https://github.com/benawad/graphql-mongo-server
// https://github.com/torchhound/mongo-crud
// https://www.freecodecamp.org/news/create-a-fullstack-react-express-mongodb-app-using-docker-c3e3e21c4074
