export default defineEventHandler((event) => {
    if (import.meta.dev) {
        return
    }

    const path = event.path

    if (path === '/raw' || path.startsWith('/raw/'))  {
        const key = getCookie(event, 'rawKey')
        const expected = process.env.NUXT_PUBLIC_RAW_KEY

        if (key !== expected) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found'
            })
        }
    }
})