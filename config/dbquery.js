const con = require("./db");
const HttpError = require("./HttpError");

const queryDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        con.query(query, params, (err, result) => {
            if (err) {
                console.log(err); 
                return reject(new HttpError("Database query failed", 500));
            }
            resolve(result);
        });
    });
};

module.exports=queryDatabase
