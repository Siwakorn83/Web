const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let users = []
let conn = null

const initMySQL = async () => {
     conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8830
    })
}
const validateData = (userData) => {
    let errors = []
    if(!userData.firstname){
        errors.push('Please enter your firstname')
    }
    if(!userData.lastname){
        errors.push('Please enter your lastname')
    }
    if(!userData.password){
        errors.push('Please enter your password')
    }
    return errors
}

//path = GET /users สำหรับ get users ทั้งหมดที่มบันทึกไว้
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users')
    res.json(results[0])
});
//path = GET /users สำหรับ id users รายคน
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE user_id = ?', id)
        if(results[0].length == 0){
            throw {statusCode: 404, message: 'User not found'}
        }
        res.json(results[0][0])

    } catch (error) {
        console.log('error', error.message)
        let statusCode = error.statusCode || 500
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
});
//path POST  /users สำหรับสร้าง users ใหม่บันทึกเข้าไปในฐานข้อมูล
app.post('/users', async (req, res) => {
    try{
        let user = req.body;
        const errors = validateData(user)
        if(errors.length > 0){
            throw {
                message: 'Please fill in all required fields.',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO users SET ? ', user)
        res.json({
            message: 'Create user successfully',
            data: results[0]
        })
    }catch(error){
        const errorMessages = error.message || 'something went wrong'
        const errors = error.errors || []
        console.log('error message: ',error.message)
        res.status(500).json({
            message: errorMessages,
            errors: errors
        })
    }
})
//path PUT /user/:id ใช้สำหรับแก้ไขข้อมูล user ที่มี id ตามที่ระบุ
app.put('/users/:id', async(req, res) => {
    
    try{
        let id = req.params.id; 
        let updateUser = req.body;
        const results = await conn.query
            ('UPDATE  users SET ? WHERE user_id = ?', 
                [updateUser, id])
        res.json({
            message: 'Update user successfully',
            data: results[0]
        })
    }catch(error){
        console.log('error',error.message)
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
})
//path DELETE /user/:id ใช้สำหรับลบข้อมูล user ที่มี id ตามที่ระบุ
app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM users WHERE user_id = ?', parseInt(id))
        res.json({
            message: 'DELETE user successfully',
            data: results[0]
        })
    } catch (error) {
        console.log('error', error.message)
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
});


//path = GET /seats สำหรับ get seats ทั้งหมดที่มบันทึกไว้
app.get('/seats', async (req, res) => {
    const results = await conn.query('SELECT * FROM seats')
    res.json(results[0])
});
//path = GET /seats สำหรับ id seats รายคน
app.get('/seats/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM seats WHERE seat_id = ?', id)
        if(results[0].length == 0){
            throw {statusCode: 404, message: 'seats not found'}
        }
        res.json(results[0][0])

    } catch (error) {
        console.log('error', error.message)
        let statusCode = error.statusCode || 500
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
});
//path PUT /seats/:id ใช้สำหรับแก้ไขข้อมูล seats ที่มี id ตามที่ระบุ
app.put('/seats/:id', async(req, res) => {
    try{
        let id = req.params.id; 
        let updateUser = req.body;
        const results = await conn.query
            ('UPDATE seats SET ? WHERE seat_id = ?', 
                [updateUser, id])
        res.json({
            message: 'reserve seats successfully',
            data: results[0]
        })
    }catch(error){
        console.log('error',error.message)
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
})


//path = GET /reservations สำหรับ get reservations ทั้งหมดที่มบันทึกไว้
app.get('/reservations', async (req, res) => {
    const results = await conn.query('SELECT * FROM reservations')
    res.json(results[0])
});
//path = GET /reservations สำหรับ id reservations รายคน
app.get('/reservations/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM reservations WHERE reservation_id = ?', id)
        if(results[0].length == 0){
            throw {statusCode: 404, message: 'reservations not found'}
        }
        res.json(results[0][0])

    } catch (error) {
        console.log('error', error.message)
        let statusCode = error.statusCode || 500
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
});
//path POST  /reservations สำหรับสร้าง reservations ใหม่บันทึกเข้าไปในฐานข้อมูล
app.post('/reservations', async (req, res) => {
    try {
        let { user_id, seat_id, start_time, end_time, status } = req.body;

        // ตรวจสอบว่ามีการจองที่นั่งนี้ทับช่วงเวลาหรือไม่
        const [existing] = await conn.query(
            `SELECT * FROM reservations 
             WHERE seat_id = ? 
             AND (start_time BETWEEN ? AND ? 
                  OR end_time BETWEEN ? AND ?) 
             AND status != 'deleted'`, // เพิ่มการตรวจสอบว่าไม่ได้ถูกลบ
            [seat_id, start_time, end_time, start_time, end_time]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "ที่นั่งนี้ถูกจองในช่วงเวลานี้แล้ว!" });
        }

        const results = await conn.query(
            'INSERT INTO reservations (user_id, seat_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, seat_id, start_time, end_time, status]
        );

        res.json({
            message: 'จองที่นั่งสำเร็จ!',
            data: results[0]
        });

    } catch (error) {
        console.error("❌ SQL Insert Error:", error);
        res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาด' });
    }
});
//path PUT /reservations/:id ใช้สำหรับแก้ไขข้อมูล reservations ที่มี id ตามที่ระบุ
app.put('/reservations/:id', async(req, res) => {
    try{
        let id = req.params.id; 
        let updateUser = req.body;
        const results = await conn.query
            ('UPDATE  reservations SET ? WHERE reservation_id = ?', 
                [updateUser, id])
        res.json({
            message: 'Update reserv successfully',
            data: results[0]
        })
    }catch(error){
        console.log('error',error.message)
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
})
//path DELETE /reservations/:id ใช้สำหรับลบข้อมูล reservations ที่มี id ตามที่ระบุ
app.delete('/reservations/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM reservations WHERE reservation_id = ?', parseInt(id))
        res.json({
            message: 'DELETE reserv successfully',
            data: results[0]
        })
    } catch (error) {
        console.log('error', error.message)
        res.status(500).json({
            message: 'something went wrong',
            error: error.message
        })
    }
});

app.listen(port, async (req, res) => {
    await initMySQL()
    console.log('Http Server is running on port ' + port);
});