const BASE_URL = 'http://localhost:8000';

window.onload = async () => {
    await loadData();
}

const loadData = async () => {
    console.log('load reservations');
    
    //reservations
    const reservationsResponse = await axios.get(`${BASE_URL}/reservations`);
    console.log(reservationsResponse.data);
    
    //seats
    const seatsResponse = await axios.get(`${BASE_URL}/seats`);
    console.log(seatsResponse.data);

    //users
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log(usersResponse.data);
    
    const reservationsDOM = document.getElementById('reservation');
    
    // 4. สร้าง object สำหรับการหา seat_number โดยใช้ seat_id
    const seats = seatsResponse.data.reduce((acc, seat) => {
        acc[seat.seat_id] = seat.seat_number;  // เก็บ seat_number โดยใช้ seat_id เป็น key
        return acc;
    }, {});
    
    // 5. สร้าง object สำหรับการหา firstname และ lastname โดยใช้ user_id
    const users = usersResponse.data.reduce((acc, user) => {
        acc[user.user_id] = { firstname: user.firstname, lastname: user.lastname };
        return acc;
    }, {});

    let htmlData = `<table class="modern-table">
    <thead>
        <tr>
            <th>เลขที่นั่ง</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>วันที่</th>
            <th>สถานะ</th>
        </tr>
    </thead>`
    
    for (let i = 0; i < reservationsResponse.data.length; i++) {
        let reservation = reservationsResponse.data[i];
        let seatNumber = seats[reservation.seat_id] || 'ไม่พบที่นั่ง'; 
        let user = users[reservation.user_id] || { firstname: 'ไม่พบ', lastname: 'ผู้ใช้' }; 
        let formattedDate1 = new Date(reservation.start_time).toLocaleDateString('th-TH');
        
        htmlData += `<tr class='header1'>
            <td>${seatNumber}</td>
            <td>${user.firstname}</td>
            <td>${user.lastname}</td>
            <td>${formattedDate1}</td>
            <td>${reservation.status}</td>
        </tr>`;
    }
    htmlData += '</table>';
    
    reservationsDOM.innerHTML = htmlData;
}