const app = require('../index')
const supertest = require('supertest')
const request = require('supertest')
const fs = require('fs')
const path = require('path')
const Course = require('../models/Course')

describe('main file with express-app testing', () => {
    describe('GET /courses', () => {
        let superGetResponse
        beforeAll(() => {
            superGetResponse = new Promise((resolve, reject) => {
                try {
                    resolve(supertest(app).get("/courses"))
                } catch (err) {
                    reject(err)
                }
            })
        })

        it('response.status should be 200 and return some data', async () => {
            superGetResponse
                .then((response) => {
                    superGetResponse = response
                    expect(response).toBeDefined()
                    expect(response).not.toBeNull()
                })
        })

        it('courses should be array', () => {
            superGetResponse
                .then((response) => {
                    expect(Array.isArray(response.body)).toBeTruthy()
                    expect(response.body.length).toBeGreaterThanOrEqual(0)
                })
        })
    })

    describe('POST /add', () => {
        it('request.body should contain following fields', async () => {
            const course = {
                title: 'ReactJS',
                price: '750',
                author: 'Pavel Yurchenko',
                img: 'https://someValidPath.png'
            }
            const res = await request(app)
                .post('/add')
                .send(course)
            expect(res.body.statusCode).toEqual(201)
            expect(res.body).toEqual(expect.objectContaining({
                id: expect.any(String),
                rating: expect.any(Number)
            }))
        })
    })

    describe('POST /delete', () => {})
})