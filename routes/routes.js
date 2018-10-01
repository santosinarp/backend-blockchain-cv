const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/AuthController')

    /*
    * @dev by Santo Sinar Pandean
    * 1 Oktober 2018
    * Routes for Authentication Blockchain CV (metamask authentication)
    */

    /*
    * @dev by Santo Sinar Pandean
    * @date 1 Oktober 2018
    * Route get user sepsific data
    * @method GET
    * @params : 
    *   1. publicAddress = <string>
    */
    router.get('/users/:publicAddress',
        AuthController.getUser)

    /*
    * @dev by Santo Sinar Pandean
    * @date 1 Oktober 2018
    * Route for registering user
    * @method POST
    * @body-param :
    *   1. publicAddress = <string>
    */
    router.post('/users',
        AuthController.registerUser)

    /*
    * @dev by Santo Sinar Pandean
    * @date 1 Oktober 2018
    * Route for authenticate
    * @method POST
    * @body-param :
    *   1. publicAddress = <string>
    *   2. signature = <string>
    */
    router.post('/auth',
        AuthController.auth)

module.exports = router
