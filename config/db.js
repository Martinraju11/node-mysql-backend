const mysql=require("mysql2")

const con=mysql.createConnection(
    {
        host:process.env.MY_SQL_HOST,
        user:process.env.MY_SQL_USER,
        port:process.env.MY_SQL_PORT,
        password:process.env.MY_SQL_PASSWORD,
        database:process.env.MY_SQL_DB
    }
)

con.connect((err)=>{
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
})

module.exports=con