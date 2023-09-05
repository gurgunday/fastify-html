import { test } from 'node:test'
import fastify from 'fastify'
import fastifyHtml from './index.js'
import { strictEqual } from 'node:assert'
import tags from 'common-tags'

test('render html', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello World</h1>')
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello Matteo</h1>')
  }
})

test('expose tags', async t => {
  const app = fastify()
  app.register(fastifyHtml)
  await app.ready()

  strictEqual(app.tags, tags)
})

test('one level layout', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  app.addLayout(function (inner) {
    return app.tags.html`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          ${inner}
        </body>
      </html>
    `
  })

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello World</h1>
  </body>
</html>`)
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello Matteo</h1>
  </body>
</html>`)
  }
})
