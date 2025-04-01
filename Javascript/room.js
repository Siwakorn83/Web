const BASE_URL = 'http://localhost:8000';

window.onload = async () => {
    await loadSeats(); // โหลดตารางที่นั่ง
    await loadReservations(); // โหลดตารางการจอง
};

// โหลดที่นั่งเพื่อให้ผู้ใช้เลือกลงทะเบียน
const loadSeats = async () => {
    console.log('Load available seats');

    const response = await axios.get(`${BASE_URL}/seats`);
    const seatDOM = document.getElementById('seat');

    let htmlData = `<table class="modern-table">
    <thead>
        <tr>
            <th>เลขที่นั่ง</th>
            <th>เลือกวันที่</th>
            <th>ยืนยัน</th>
        </tr>
    </thead>`;

    for (let seat of response.data) {
        htmlData += `<tr>
            <td>${seat.seat_number}</td> 
            <td><input type="date" id="date-${seat.seat_id}"></td>
            <td>
                <button class='edit' onclick="registerSeat(${seat.seat_id})">ยืนยัน</button>
            </td>
        </tr>`;
    }

    htmlData += '</table>';
    seatDOM.innerHTML = htmlData;
};

// ลงทะเบียนที่นั่ง
const registerSeat = async (seatId) => {
    let selectedDate = document.getElementById(`date-${seatId}`).value;
    if (!selectedDate) {
        alert("กรุณาเลือกวันที่ก่อนลงทะเบียน!");
        return;
    }

    let startTime = `${selectedDate} 00:00:00`;
    let endTime = `${selectedDate} 23:59:59`;
    let userId = 1;
    let status = "pending"; //confirmed, pending, canceled

    try {
        await axios.post(`${BASE_URL}/reservations`, {
            user_id: userId,
            seat_id: seatId,
            start_time: startTime,
            end_time: endTime,
            status: status
        });

        alert("ลงทะเบียนสำเร็จ");
        loadReservations(); // โหลดตารางการจองใหม่
    } catch (error) {
        console.error("ไม่สามารถลงทะเบียนได้", error.response?.data || error);
        alert("ไม่สามารถลงทะเบียนได้");
    }
};

// โหลดข้อมูลการจองที่เกิดขึ้นแล้ว
const loadReservations = async () => {
    console.log('Load reservations');

    const reservationsResponse = await axios.get(`${BASE_URL}/reservations`);
    const seatsResponse = await axios.get(`${BASE_URL}/seats`);
    
    // แปลง seat_id เป็น seat_number
    const seats = seatsResponse.data.reduce((acc, seat) => {
        acc[seat.seat_id] = seat.seat_number;
        return acc;
    }, {});

    const reservationsDOM = document.getElementById('reservations');

    let htmlData = `<table class="modern-table">
    <thead>
        <tr>
            <th>เลขที่นั่ง</th>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>ยกเลิก</th>
        </tr>
    </thead>`;

    for (let res of reservationsResponse.data) {
        let seatNumber = seats[res.seat_id] || 'ไม่พบที่นั่ง'; // แสดงเลขที่นั่ง
        htmlData += `<tr>
            <td>${seatNumber}</td>
            <td>${new Date(res.start_time).toLocaleDateString()}</td>
            <td>${res.status}</td>
            <td>
                <button class='cancel' onclick="cancelReservation(${res.reservation_id})">ยกเลิก</button>
            </td>
        </tr>`;
    }

    htmlData += '</table>';
    reservationsDOM.innerHTML = htmlData;
};

// ยกเลิกการจองที่เกิดขึ้นแล้ว
const cancelReservation = async (reservationId) => {
    if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) {
        return;
    }

    try {
        console.log("กำลังส่งคำขอลบ:", `${BASE_URL}/reservations/${reservationId}`);

        const response = await axios.delete(`${BASE_URL}/reservations/${reservationId}`, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Response:", response);

        if (response.status === 200) {
            alert(response.data.message || "ยกเลิกการจองสำเร็จ!");
            await onload();
        }
    } catch (error) {
        await onload();
    }
};