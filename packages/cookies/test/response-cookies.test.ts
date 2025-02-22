import { createFormat } from '@edge-runtime/format'
import { ResponseCookies } from '../src/response-cookies'

it('reflect .set into `set-cookie`', async () => {
  const headers = new Headers()
  const cookies = new ResponseCookies(headers)

  expect(cookies.get('foo')?.value).toBe(undefined)
  expect(cookies.get('foo')).toEqual(undefined)

  cookies
    .set('foo', 'bar', { path: '/test' })
    .set('fooz', 'barz', { path: '/test2' })
    .set('fooHttpOnly', 'barHttpOnly', { httpOnly: true })

  expect(cookies.get('foo')?.value).toBe('bar')
  expect(cookies.get('fooz')?.value).toBe('barz')
  expect(cookies.get('fooHttpOnly')?.value).toBe('barHttpOnly')

  const opt1 = cookies.get('foo')
  expect(opt1).toEqual<typeof opt1>({
    name: 'foo',
    value: 'bar',
    path: '/test',
  })
  expect(cookies.get('fooz')).toEqual({
    name: 'fooz',
    value: 'barz',
    path: '/test2',
  })
  expect(cookies.get('fooHttpOnly')).toEqual({
    name: 'fooHttpOnly',
    value: 'barHttpOnly',
    path: '/',
    httpOnly: true,
  })

  expect(Object.fromEntries(headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/test, fooz=barz; Path=/test2, fooHttpOnly=barHttpOnly; Path=/; HttpOnly'
  )
})

it('reflect .delete into `set-cookie`', async () => {
  const headers = new Headers()
  const cookies = new ResponseCookies(headers)

  cookies.set('foo', 'bar')
  expect(Object.fromEntries(headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/'
  )

  expect(cookies.get('foo')?.value).toBe('bar')
  expect(cookies.get('foo')).toEqual({
    name: 'foo',
    value: 'bar',
    path: '/',
  })

  cookies.set('fooz', 'barz')
  expect(Object.fromEntries(headers.entries())['set-cookie']).toBe(
    'foo=bar; Path=/, fooz=barz; Path=/'
  )

  expect(cookies.get('fooz')?.value).toBe('barz')
  expect(cookies.get('fooz')).toEqual({
    name: 'fooz',
    value: 'barz',
    path: '/',
  })

  cookies.delete('foo')
  expect(Object.fromEntries(headers.entries())['set-cookie']).toBe(
    'foo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT, fooz=barz; Path=/'
  )

  expect(cookies.get('foo')).toEqual({
    name: 'foo',
    path: '/',
    value: '',
    expires: new Date(0),
  })

  cookies.delete('fooz')

  expect(Object.fromEntries(headers.entries())['set-cookie']).toBe(
    'foo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT, fooz=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  )

  expect(cookies.get('fooz')).toEqual({
    name: 'fooz',
    expires: new Date(0),
    value: '',
    path: '/',
  })
})

it('options are not modified', async () => {
  const options = { maxAge: 10000 }
  const headers = new Headers({ 'content-type': 'application/json' })
  const cookies = new ResponseCookies(headers)
  cookies.set('cookieName', 'cookieValue', options)
  expect(options).toEqual({ maxAge: 10000 })
})

test('formatting with @edge-runtime/format', () => {
  const headers = new Headers()
  const cookies = new ResponseCookies(headers)
  cookies.set('a', '1', { httpOnly: true })
  cookies.set('b', '2', { sameSite: 'lax' })

  const format = createFormat()
  const result = format(cookies)
  expect(result).toMatchInlineSnapshot(
    `"ResponseCookies {"a":{"name":"a","value":"1","httpOnly":true,"path":"/"},"b":{"name":"b","value":"2","sameSite":"lax","path":"/"}}"`
  )
})
