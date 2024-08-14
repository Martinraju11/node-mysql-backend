const con = require("./db")

const queryDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        con.query(query, params, (err, result) => {
            if (err) {
                return reject(new HttpError("Database query failed", 500));
            }
            resolve(result);
        });
    });
};

module.exports=queryDatabase
