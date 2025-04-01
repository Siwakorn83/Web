const BASE_URL = 'http://localhost:8000';

window.onload = async () => {
    await loadData();
};

const loadData = async () => {
    console.log('load seat');

    // 1. โหลดข้อมูลที่นั่งทั้งหมดจาก API
    const response = await axios.get(`${BASE_URL}/seats`);
    console.log(response.data);

    const seatDOM = document.getElementById('seat');

    let htmlData = `<table>
    <tr class='header'>
        <th>seat_number</th>
        <th>เลือกวันที่</th>
        <th>ลงทะเบียน</th>
    </tr>`;

    // 2. วนลูปสร้างข้อมูลที่นั่ง
    for (let i = 0; i < response.data.length; i++) {
        let seat = response.data[i];

        htmlData += `<tr class='header1'>
            <td>${seat.seat_number}</td> 
            <td>
                <input type="date" id="date-${seat.seat_id}">
            </td>
            <td>
                <button class='edit' onclick="registerSeat(${seat.seat_id})">ลงทะเบียน</button>
            </td>
        </tr>`;
    }

    htmlData += '</table>';
    seatDOM.innerHTML = htmlData;
};

const registerSeat = async (seatId) => {
    let selectedDate = document.getElementById(`date-${seatId}`).value;

    if (!selectedDate) {
        alert("กรุณาเลือกวันที่ก่อนลงทะเบียน!");
        return;
    }

    let startTime = `${selectedDate} 00:00:00`;
    let endTime = `${selectedDate} 23:59:59`;

    let userId = 1;
    let status = "pending";//confirmed, pending, canceled

    try {
        const response = await axios.post(`${BASE_URL}/reservations`, {
            user_id: userId,
            seat_id: seatId,
            start_time: startTime,
            end_time: endTime,
            status: status
        });

        alert("ลงทะเบียนสำเร็จ");
    } catch (error) {
        console.error("จองซ้ำไม่ได้", error.response?.data || error);
        alert("ไม่สามารถลงทะเบียนซ้ำได้");
    }
};