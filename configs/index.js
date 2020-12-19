module.exports = {
    port: 3000,
    lang: 'en',
    currency:'jod',
    client: {
        user: 'postgres',
        host: 'localhost',
        database: 'beauty',
        password: '123',
        port: 5432,
    },
    mangoDB: {
        url: 'mongodb://localhost/node_rest_api',
    },
    jwtSecretKey: 'RS256',
    imagesPath: 'uploads/images',
    videosPath: 'uploads/videos',
    cartStatus: {
        inProgress: "IN_PROGRESS",
        submitted: "SUBMITTED",
        fulfilled: "FULFILLED",
    }
}