const connection = require('../connection/MySqlConnect')
const ethUtil = require('ethereumjs-util')
const self = module.exports = {
    /*
    * @dev by Santo Sinar Pandean
    * 1 Oktober 2018
    * Controller for user login flow (Metamask Authentication)
    */
    async getUser(req, res) {
        const publicAddress = req.params.publicAddress

        // initialize database connection
        connection.init()

        connection.acquire(function (err, con) {
            con.query(`SELECT * FROM btm_users where public_address = '${publicAddress}'`, function (err, result) {
                try{
                    if(err) {
                        con.release();
                        res.status(500).send({
                            error: 1,
                            error_message: err.message
                        })
                    } else {
                        con.release();
                        res.send({
                            error: 0,
                            returns: result
                        });
                    }
                } catch(err) {
                    con.release();
                    res.status(500).send({
                        error: 1,
                        error_message: err.message
                    })
                }
                
            });
        });
    },

    async registerUser(req, res) {
        try{
            // validate input
            req.checkBody('publicAddress',`Param Body publicAddress is required`).exists()

            const validationErrors = req.validationErrors()
            if(validationErrors)
                throw new Error(validationErrors[0].msg)

            const publicAddress = req.body.publicAddress
            const randNonce = Math.floor(100000 + Math.random() * 900000)

            // initialize database connection
            connection.init()

            connection.acquire(function (err, con) {
                con.query(`INSERT INTO btm_users(public_address, nonce) VALUES('${publicAddress}', ${randNonce})`, function (err, result) {
                    try{
                        if(err) {
                            con.release();
                            res.status(500).send({
                                error: 1,
                                error_message: err.message
                            })
                        } else {
                            con.release();
                            res.send({
                                error: 0,
                                returns: {
                                    publicAddress: publicAddress,
                                    nonce: randNonce
                                }
                            })
                        }
                    } catch(err) {
                        con.release();
                        res.status(500).send({
                            error: 1,
                            error_message: err.message
                        })
                    }
                });
            });
        } catch (err) {
            res.status(500).send({
                error: 1,
                error_message: err.message
            })
        }
    },

    auth(req, res) {
        try{
            // validate input
            req.checkBody('publicAddress',`Param Body publicAddress is required`).exists()
            req.checkBody('signature',`Param Body Signature is required`).exists()

            const validationErrors = req.validationErrors()
            if(validationErrors)
                throw new Error(validationErrors[0].msg)
            
            const {publicAddress, signature} = req.body

            connection.acquire((err, con) => {
                con.query(`SELECT * FROM btm_users where public_address = '${publicAddress}'`, async (err, result) => {
                    const queryResult = JSON.parse(JSON.stringify(result))
                    const currentNonce = queryResult[0].nonce
                    try{
                        if(err) {
                            con.release();
                            res.status(500).send({
                                error: 1,
                                error_message: err.message
                            })
                        } else {
                            con.release();

                            const msg = `Please sign this your one time password: ${currentNonce}`

                            // run ecrecover
                            const msgBuffer = ethUtil.toBuffer(msg);
                            const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
                            const signatureBuffer = ethUtil.toBuffer(signature);
                            const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
                            const publicKey = ethUtil.ecrecover(
                                msgHash,
                                signatureParams.v,
                                signatureParams.r,
                                signatureParams.s
                            );
                            const addressBuffer = ethUtil.publicToAddress(publicKey);
                            const address = ethUtil.bufferToHex(addressBuffer);

                            if (address.toLowerCase() === publicAddress.toLowerCase()) {
                                try{
                                    const updateNonce = await self.updateNonce(publicAddress)
                                    res.send({
                                        error: 0,
                                        returns: 'signed'
                                    });
                                } catch(err) {
                                    res.status(500).send({
                                        error: 1,
                                        error_message: err.message
                                    })
                                }
                              } else {
                                return res
                                  .status(401)
                                  .send({ error: 'Signature verification failed' });
                              }
                        }
                    } catch(err) {
                        con.release();
                        res.status(500).send({
                            error: 1,
                            error_message: err.message
                        })
                    }
                });
            });
        } catch(err) {
            res.status(500).send({
                error: 1,
                error_message: err.message
            })
        }
    },

    updateNonce(publicAddress) {
        // initialize database connection
        connection.init()

        return new Promise((resolve, reject) => {
            connection.acquire(function (err, con) {
                con.query(`UPDATE btm_users SET nonce = ${Math.floor(100000 + Math.random() * 900000)} WHERE public_address = '${publicAddress}'`, function (err, result) {
                    if(err) {
                        con.release();
                        reject(err)
                    } else {
                        con.release();
                        resolve('success')
                    }
                });
            });
        })
            
    }

}