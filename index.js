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
