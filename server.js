//Gerekli modüllerin projeye dahil edilmesi ve Express uygulamasının başlatılması
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();

//Middleware ayarları (istek gövdelerini okuma ve statik dosya erişimi)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); 

//SQLite veritabanı bağlantısının oluşturulması
const db = new sqlite3.Database(
    path.join(__dirname, "shinora.db"),
    (err) => {
        if (err) {
            console.error("SQLite veritabanına bağlanılamadı:", err.message);
        } else {
            console.log("SQLite veritabanına bağlandı.");
        }
    }
);


//Veritabanı tablolarının oluşturulması 
db.serialize(() => {
    //Ürünler Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, type TEXT, material TEXT, price INTEGER,
        imageFolder TEXT, description TEXT, weight TEXT, stone TEXT, warranty TEXT
    )`);

    //Siparişler Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        status TEXT DEFAULT 'Bekliyor',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

//Ürünler için API CRUD işlemleri (listeleme, ekleme, güncelleme, silme)
//Ürünleri Listeleme
app.get("/api/products", (req, res) => {
    db.all("SELECT * FROM products", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Yeni ürün ekleme (Admin)
app.post("/api/products", (req, res) => {
    const { name, type, material, price, imageFolder, description, weight, stone, warranty } = req.body;
    const sql = `INSERT INTO products (name, type, material, price, imageFolder, description, weight, stone, warranty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, type, material, price, imageFolder, description, weight, stone, warranty], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Ürün başarıyla eklendi!" });
    });
});

//Ürün güncelleme
app.put("/api/products/:id", (req, res) => {
    const { price, name } = req.body;
    //Sadece ad ve fiyat güncellenir
    const sql = `UPDATE products SET price = ?, name = ? WHERE id = ?`;
    db.run(sql, [price, name, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Ürün güncellendi!" });
    });
});

//Ürün Silme
app.delete("/api/products/:id", (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Ürün silindi!" });
    });
});

//Siparişler için API işlemleri (oluşturma ve listeleme)
//Yeni sipariş kaydı
app.post("/api/orders", (req, res) => {
    const { product_name, customer_name, phone, address } = req.body;
    const sql = `INSERT INTO orders (product_name, customer_name, phone, address) VALUES (?, ?, ?, ?)`;
    db.run(sql, [product_name, customer_name, phone, address], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Siparişiniz başarıyla alındı!" });
    });
});

//Sipariş listeleme (Admin)
app.get("/api/orders", (req, res) => {
    db.all("SELECT * FROM orders ORDER BY order_date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Sayfa yönlendirme route'ları
//Ana sayfa ve hakkımızda
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views/index.html")));

//Ürünler sayfası
app.get("/products", (req, res) => res.sendFile(path.join(__dirname, "views/products.html")));

//Sipariş sayfası
app.get("/siparis", (req, res) => res.sendFile(path.join(__dirname, "views/siparis.html")));

//Admin paneli
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "views/admin.html")));

//Sepetim sayfası
app.get("/sepet", (req, res) => res.sendFile(path.join(__dirname, "views/sepet.html")));

//Ürün detay sayfası
app.get("/product", (req, res) => res.sendFile(path.join(__dirname, "views/product.html")));

//İletişim 
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "views/contact.html")));

//Kullanıcı giriş sayfası
app.get("/login", (req, res) => {res.sendFile(path.join(__dirname, "views/login.html"));
});

//Sunucuyu belirtilen portta başlatma
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Sunucu hazır. Port:", PORT);
});
