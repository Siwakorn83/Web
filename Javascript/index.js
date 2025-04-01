const BASE_URL = 'http://localhost:8000'
let mode = 'CREATE'//default mode
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('id', id);
    if (id) {
        mode = 'EDIT'
        selectedId = id
        //1. เราจะดึงข้อมูลของ user ที่ต้องการแก้ไข
        try {
            const response = await axios.get(`${BASE_URL}/users/${id}`)
            const user = response.data
        //2. เราจะนำข้อมูลของ user ที่ดึงมา ใส่ใน input ที่เรามี
            let firstnameDOM = document.querySelector('input[name=firstname]')
            let lastnameDOM = document.querySelector('input[name=lastname]')
            let passwordDOM = document.querySelector('input[name=password]')    
            firstnameDOM.value = user.firstname
            lastnameDOM.value = user.lastname
            passwordDOM.value = user.password                
        } catch (error) {
            console.log('error', error)
        }
    }
}

const validateData = (userData) => {
    let errors = []
    if(!userData.firstname){
        errors.push('กรุณากรอกชื่อ')
    }
    if(!userData.lastname){
        errors.push('กรุณากรอกนามสกุล')
    }
    if(!userData.password){
        errors.push('กรุณากรอกรหัสผ่าน')
    }
    return errors
}
const submitData = async () => {
    let firstnameDOM = document.querySelector('input[name=firstname]');
    let lastnameDOM = document.querySelector('input[name=lastname]');
    let passwordDOM = document.querySelector('input[name=password]');

    let messageDOM = document.getElementById('message');

    try {
        let userData = {
            firstname: firstnameDOM.value,
            lastname: lastnameDOM.value,
            password: passwordDOM.value,
        }
        console.log('submitData', userData);
        validateData(userData)
        let message = 'บันทึกข้อมูลเรียบร้อย'
        if(mode == 'CREATE'){
            const response = await axios.post(`${BASE_URL}/users`, userData)
            console.log('response', response.data);
            window.location.href = `home.html`
        }else{
            const response = await axios.put(`${BASE_URL}/users/${selectedId}`, userData)
            message = 'แก้ไขข้อมูลเรียบร้อย'
            console.log('response', response.data);
        }
        messageDOM.innerText = message
        messageDOM.className = 'message success'
    } catch (error) {
        console.log('error message', error.message);
        console.log('error', error.errors);       
        
        if(error.response){
            console.log('error', error.response.data.message)
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }
        
        let htmlData = '<div>'
        htmlData += `<div> ${error.message} </div>`
        htmlData += '<ul>'
        for(let i = 0; i < error.errors.length; i++){
            htmlData += `<li> ${error.errors[i]} </li>`
        }
        htmlData += '</ul>'
        htmlData += '</div>'

        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger'
    }
}