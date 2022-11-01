// apollo-serverモジュールを読み込む.
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const { GraphQLScalarType, astFromValue } = require(`graphql`)

const typeDefs = `
  scalar DateTime

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`

var _id = 0

// ユーザのサンプルデータ.
var users = [
    { "githubLogin": "mHattrup", "name": "錦木千束" },
    { "githubLogin": "gPlake", "name": "井ノ上たきな" },
    { "githubLogin": "sSchmidt", "name": "クルミ" }
]

// 写真のデータ.
var photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "1-2-1985"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"
    }
]

// タグデータ.
var tags = [
    { "photoID": "1", "userID": "gPlake" },
    { "photoID": "2", "userID": "sSchmidt" },
    { "photoID": "2", "userID": "mHattrup" },
    { "photoID": "2", "userID": "gPlake" }
]

const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    Mutation: {
        postPhoto(parent, args) {
            var newPhoto = {
                id: _id++,
                ...args.input,
                created: new Date()
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },
    Photo: {
        url: parent => `http://photos.hoshi005.net/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => tags
            .filter(tag => tag.photoID === parent.id)
            .map(tag => tag.userID)
            .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        inPhotos: parent => tags
            .filter(tag => tag.userID === parent.id)
            .map(tag => tag.photoID)
            .map(photoID => photos.find(p => p.id === photoID))
    },
    DateTime: new GraphQLScalarType({
        name: `DateTime`,
        description: `A valid date time value.`,
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

// サーバのインスタンスを作成.
// その際typeDefs(スキーマ)とリゾルバを引数に取る.
const server = new ApolloServer({
    typeDefs,
    resolvers
})

var app = express()

// applyMiddlewareを呼び出し、Expressにミドルウェアを追加する.
server.applyMiddleware({ app })

// ホームルートを作成する.
app.get(`/`, (req, res) => res.end(`Welcome to the PhotoShare API`))

// 特定のポートでリッスンする.
app.listen({ port: 4000 }, () => console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`))

// webサーバを起動.
// server
//     .listen()
//     .then(({ url }) => console.log(`GraphQL Service running on ${url}`))