Giờ tôi muốn tạo 1 website để get api từ web khác 
Ví dụ tôi có link gốc như sau 
https://www.geeksforgeeks.org/cses-solutions-gray-code/
và tôi dùng api của web rút gọn link và nhận được link này
https://link4m.com/8pBq3cJf
thì tôi muốn tạo web, đường link riêng của mk để quản lý rằng mk muốn sử dụng get api của web rút gọn này, hoặc khác và mình nhận được đường link riêng của mình như sau
https://modzuizui.pro/8uhasd9
bằng nodejs và expressjs


shortenUrls(original_url, short_url, created_at, updated_ad, click_count, api_key_id)
users(user_id, email, password, created_at)
apiKeys(api_key_id, api_key_url, user_id, created_at)

-- Tạo bảng users với các cột mới
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);


-- Tạo bảng apiKeys
CREATE TABLE apiKeys (
    api_key_id SERIAL PRIMARY KEY,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    name_api VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng shortenUrls
CREATE TABLE shortenUrls (
    id SERIAL PRIMARY KEY,
    original_url VARCHAR(2048) NOT NULL,
    short_url VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    click_count INT DEFAULT 0,
    api_key_id INT REFERENCES apiKeys(api_key_id)
);


/////////////
api phan user: chi admin duoc dung thoi
api phan quan ly api key: admin co quyen lam tat ca
user chi duoc phep tao, xem, sua, xoa

api phan quan ly short link
api co the lam tat ca
user chi duoc tao, xem tat ca, chi tiet


linkvip.org/alskjdklasjd => api short link co id=1 => lay ra short link: link4m.com/sakdjlkasj && kiem tra xem api_key_id !== api_key_id dang bat cua user do hay khong?

vi du 
link4m.com/sakdjlkasj co api_key_id =1 link4m.com/..........url=
nhung ma kiem tra thi thay api_key_id = 1 dang tat, co api_key_id = 2 dang bat la 123s.link/........urrl
=> phai get lai short link theo api_key_id = 2 do de short link nhan duuoc la 123s.link/kajskldj