const mysql = require('mysql')

function mySqlConnect() {
    this.pool = null

    // Init mysql connection pool
    this.init = () => {
        this.pool = mysql.createPool({
            connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        })
    }

    // acquire connection and execute query on callbacks  
    this.acquire = function(callback) {
        this.pool.getConnection(function(err, connection) {
            callback(err, connection)
        })
    }
}

module.exports = new mySqlConnect()
