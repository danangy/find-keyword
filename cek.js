const axios = require('axios');

const url = 'https://pkhjepara.wordpress.com/wp-admin/admin-ajax.php';
const data = {
    // action: 'my_action',
    param1: '1', // Tambahkan parameter sesuai kebutuhan
};

axios.post(url, data)
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
