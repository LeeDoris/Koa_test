var Koa = require('koa')
var Router = require('koa-router')
var logger = require('koa-logger')
var bodyParser = require('koa-bodyparser')

var app = new Koa()
var router = new Router()

app.use(bodyParser())

var posts = []

app.use(logger())

router
  .get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create)

function layoutRender (title, content) {
  return `
<html>
<head>
  <title>${title}</title>
  <style>
    body {
      padding: 80px;
      font: 16px Helvetica, Arial;
    }

    h1 {
      font-size: 2em;
    }

    h2 {
      font-size: 1.2em;
    }

    #posts {
      margin: 0;
      padding: 0;
    }

    #posts li {
      margin: 40px 0;
      padding: 0;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
      list-style: none;
    }

    #posts li:last-child {
      border-bottom: none;
    }

    textarea {
      width: 500px;
      height: 300px;
    }

    input[type=text],
    textarea {
      border: 1px solid #eee;
      border-top-color: #ddd;
      border-left-color: #ddd;
      border-radius: 2px;
      padding: 15px;
      font-size: .8em;
    }

    input[type=text] {
      width: 500px;
    }
  </style>
</head>
<body>
  <section id="content">
${content}
  </section>
</body>
</html>
`
}

function listRender (posts) {
  var postsHtmls = []
  for (var i in posts) {
    var post = posts[i]
    postsHtmls.push(`
      <li>
        <h2>${post.title}</h2>
        <p><a href="/post/${post.id}">Read post</a></p>
      </li>
    `)
  }
  var contentHtml = `
  <h1>Posts</h1>
  <p>You have <strong>${posts.length}</strong> posts!</p>
  <p><a href="/post/new">Create a Post</a></p>
  <ul id="posts">
    ${postsHtmls.join('\n')}
  </ul>
`
  return layoutRender('Posts', contentHtml)
}

async function list (ctx) {
//  ctx.body = await render('list', { posts: posts })
  ctx.body = listRender(posts)
}

function newRender () {
  return layoutRender('New Post', `
  <h1>New Post</h1>
  <p>Create a new post.</p>
  <form action="/post" method="post">
    <p><input type="text" placeholder="Title" name="title"></p>
    <p><textarea placeholder="Contents" name="body"></textarea></p>
    <p><input type="submit" value="Create"></p>
  </form>
  `)
}

async function add (ctx) {
  ctx.body = newRender()
}

function showRender (post) {
  return `
  <h1>${post.title}</h1>
  <p>${post.body}</p>
  `
}

async function show (ctx) {
  var post = posts[ctx.params.id]
  if (!post) ctx.throw(404, 'invalid post id')
  ctx.body = await showRender(post)
}

async function create (ctx) {
  var post = ctx.request.body
  var id = posts.push(post) - 1
  post.created_at = new Date()
  post.id = id
  ctx.redirect('/')
}

app.use(router.routes()).listen(3000)
