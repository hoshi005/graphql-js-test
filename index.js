// apollo-serverモジュールを読み込む.
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { readFileSync } = require(`fs`)

const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`)
const resolvers = require(`./resolvers`)

// サーバのインスタンスを作成.
// その際typeDefs(スキーマ)とリゾルバを引数に取る.
const server = new ApolloServer({
    typeDefs,
    resolvers
})

var app = express()

// applyMiddlewareを呼び出し、Expressにミドルウェアを追加する.
server.applyMiddleware({ app })

app.get(`/`, (req, res) => res.end(`Welcome to the PhotoShare API`))
app.get(`/playground`, expressPlayground({ endpoint: `/graphql` }))

// 特定のポートでリッスンする.
app.listen({ port: 4000 }, () => console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`))
