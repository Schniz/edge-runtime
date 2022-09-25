import { EdgeRuntime } from '../src/edge-runtime'
import { runServer } from '../src/server'
import fetch from 'node-fetch'
import { enableTestUncaughtException } from './jest-enable-test-uncaught-exception'

let server: Awaited<ReturnType<typeof runServer>>
afterEach(() => server.close())

test('starts an http server', async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    addEventListener('fetch', event => {
      return event.respondWith(new Response(null))
    });
  `)

  server = await runServer({ runtime, port: 3000 })
  expect(server.url).toEqual('http://localhost:3000')
})

test('run fetch events through http', async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    addEventListener('fetch', event => {
      const { searchParams } = new URL(event.request.url)
      const url = searchParams.get('url')
      return event.respondWith(fetch(url))
    })
  `)

  server = await runServer({ runtime })
  const url = new URL(server.url)
  url.searchParams.set('url', 'https://edge-ping.vercel.app')
  const response = await fetch(String(url))

  expect(response).toBeTruthy()
  expect(response.statusText).toEqual('OK')
})

test('works with json', async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    addEventListener('fetch', event => {
      return event.respondWith(
        new Response(JSON.stringify({ "message": "hi!" }), {
          headers: { 'content-type': 'application/json' }
        })
      )
    })
  `)

  server = await runServer({ runtime })
  const response = await fetch(server.url)
  const content = await response.json()

  expect(response).toBeTruthy()
  expect(response.statusText).toEqual('OK')
  expect(content).toStrictEqual({ message: 'hi!' })
})

test('responds with an error when the code fails', async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    async function handleRequest() {
      throw new Error('Boom');
    }

    addEventListener('fetch', event => {
      return event.respondWith(
        handleRequest(event)
      )
    })
  `)

  server = await runServer({ runtime })
  const response = await fetch(server.url)
  expect(response).toBeTruthy()
  expect(response.status).toEqual(500)
})

test('works with POST HTTP method', async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    async function handleRequest (event) {
      const body = await event.request.json()
      return new Response(JSON.stringify({ body }), {
        headers: { 'content-type': 'application/json' }
      })
    }

    addEventListener('fetch', event => {
      return event.respondWith(
        handleRequest(event)
      )
    })
  `)

  server = await runServer({ runtime })
  const body = { greeting: 'hello' }
  const response = await fetch(server.url, {
    body: JSON.stringify(body),
    method: 'POST',
  })

  const content = await response.json()

  expect(response).toBeTruthy()
  expect(response.statusText).toEqual('OK')
  expect(content).toStrictEqual({ body })
})

test(`allows to wait for effects created with waitUntil`, async () => {
  const runtime = new EdgeRuntime()
  runtime.evaluate(`
    async function doAsyncStuff (event) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return 'done';
    }

    addEventListener('fetch', event => {
      event.waitUntil(doAsyncStuff());
      return event.respondWith(
        new Response('hi there')
      )
    })
  `)

  server = await runServer({ runtime })
  const response = await fetch(server.url)
  const [resolved] = await server.waitUntil()

  expect(response).toBeTruthy()
  expect(response.status).toEqual(200)
  expect(resolved).toContain('done')
})

test.only(
  `fails when writing to the response socket throws`,
  enableTestUncaughtException(async (process) => {
    const unhandledFn = jest.fn()
    process!.on('unhandledRejection', unhandledFn)

    const runtime = new EdgeRuntime()
    runtime.evaluate(`
    addEventListener('fetch', event => {
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('hi there'));
          controller.enqueue(1);
          controller.close();
        }
      });

      return event.respondWith(
        new Response(readable, {
          headers: { 'x-foo': 'bar' },
          status: 200,
        })
      )
    })
  `)

    server = await runServer({ runtime })
    const response = await fetch(server.url)
    expect(response.status).toEqual(200)
    const text = await response.text()
    expect(text).toEqual('hi there')

    expect(unhandledFn).toHaveBeenCalledTimes(1)
    expect(unhandledFn.mock.calls[0][0].toString()).toEqual(
      'TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer or Uint8Array. Received type number (1)'
    )
  })
)
