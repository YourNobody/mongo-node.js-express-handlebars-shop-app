const request = require('supertest')
const app = require('../index')
const Course = require('../models/Course')

describe('Course model testing', () => {
    it('Course should be defined', () => {
        expect(Course).toBeDefined()
        expect(Course).not.toBeNull()
        expect(Course).not.toBeUndefined()
    })
    it('Course should return valid course object', () => {
        const expected = {
            title: 'ReactJS',
            price: '750',
            author: 'Pavel Yurchenko',
            img: 'https://someValidPath.png',
            rating: 0
        }
        const real = new Course({
            title: 'ReactJS',
            price: '750',
            author: 'Pavel Yurchenko',
            img: 'https://someValidPath.png'
        })

        expect(typeof real.id).toBe('string')

        delete real.id

        expect(real).toBeDefined()
        expect(real).not.toBeUndefined()
        expect(real).not.toBeNull()
        expect(real).toEqual(expected)
    })

    it('Course.getAll() should be defined and return array', async () => {
        const real = await Course.getAll()
        expect(real).toBeDefined()
        expect(typeof real).toBe('object')
        expect(Array.isArray(real)).toBe(true)
    })

    // it('Should create a new post', async () => {
    //     const real = new Course({
    //         title: 'ReactJS',
    //         price: '750',
    //         author: 'Pavel Yurchenko',
    //         img: 'https://someValidPath.png'
    //     })
    //     delete real.id
    //     const res = await request(app)
    //         .post('/courses')
    //         .send(real)

    //         expect(res.statusCode).toEqual(201)
    //         expect(res.body).toHaveProperty('post')
    // })
})