//Admin yetkisi kontrolü ve yetkisiz erişimlerde giriş sayfasına yönlendirme
(() => {const isAdmin = localStorage.getItem("adminLoggedIn");
    if (isAdmin !== "true") {
        window.location.replace("/login");
    }
})();

//Admin oturumunu kapatma ve login sayfasına yönlendirme
function logout() {
    if (confirm("Yönetim panelinden çıkış yapılsın mı?")) {
        //Admin oturumunu temizleme
        localStorage.removeItem("adminLoggedIn");

        //Geri tuşunu da engelleyen kesin yönlendirme
        window.location.replace("/login");
    }
}

//Admin paneli ürün yükleme işlemleri
async function loadEverything() {
    console.log("ADMIN JS AKTİF");

    //Ürünleri admin panelinde listeleme
    try {
        const resProd = await fetch("/api/products");
        const products = await resProd.json();
        const productList = document.getElementById("adminProductList");

        if (productList) {
            let folderCounters = {};

            productList.innerHTML = products.map((p) => {

                if (!folderCounters[p.imageFolder]) {
                    folderCounters[p.imageFolder] = 1;
                } else {
                    folderCounters[p.imageFolder] =
                        (folderCounters[p.imageFolder] % 15) + 1;
                }

                const resimNo = folderCounters[p.imageFolder];
                let finalImageSrc = "";

                if (
                    p.imageFolder &&
                    (p.imageFolder.includes(".png") ||
                        p.imageFolder.includes(".jpg"))
                ) {
                    finalImageSrc = p.imageFolder;
                } else if (p.imageFolder) {
                   finalImageSrc = `${p.imageFolder}/${resimNo}.png`;
                } else {
                    finalImageSrc = "/images/default.png";
                }

                return `

                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="text-center p-3 bg-light rounded-top">
                            <img src="${finalImageSrc}"
                                 class="img-fluid"
                                 style="max-height: 140px; object-fit: contain;"
                                 onerror="this.src='/images/default.png'">
                        </div>
                        <div class="card-body text-center">
                            <h6 class="fw-bold mb-1">${p.name || "İsimsiz Ürün"}</h6>
                           <p class="text-warning fw-bold mb-3">
    ${(p.price != null ? 
        Number(p.price).toLocaleString('tr-TR') : '0')} ₺
</p>
                       <div class="d-flex gap-2 w-100">
    <button class="admin-btn admin-btn-edit w-100">
        <span class="gold-text" onclick="editProduct(${p.id})">DÜZENLE</span>
    </button>
    <button class="admin-btn admin-btn-delete w-100">
        <span class="gold-text" onclick="deleteProduct(${p.id})">SİL</span>
    </button>
</div>
                        </div>
                    </div>
                </div>
                `;
            }).join("");
        }
    } catch (err) {
        console.error("Ürün hatası:", err);
    }

    //Siparişleri API'den alıp admin panelinde tablo olarak listeleme
    try {
        const resOrders = await fetch("/api/orders");
        const orders = await resOrders.json();
        const ordersBody = document.getElementById("ordersTableBody");

        if (ordersBody) {
            ordersBody.innerHTML =
                orders.length === 0
                    ? "<tr><td colspan='5' class='text-center py-3'>Henüz sipariş yok.</td></tr>"
                    : orders.map((o) => `
                        <tr class="align-middle">
                            <td class="fw-bold">${o.product_name}</td>
                            <td>${o.customer_name}</td>
                            <td>${o.phone}</td>
                            <td><small>${o.address}</small></td>
                            <td>
                                ${o.order_date
                                    ? new Date(
                                          new Date(o.order_date).getTime() +
                                              3 * 60 * 60 * 1000
                                      ).toLocaleString("tr-TR")
                                    : "-"}
                            </td>
                        </tr>
                    `).join("");
        }
    } catch (err) {
        console.error("Sipariş hatası:", err);
    }
}

//Ürün düzenleme ve ürün silme işlemleri
async function editProduct(id) {
    const newName = prompt("Yeni ürün adı:");
    const newPrice = prompt("Yeni fiyat (₺):");

    if (!newName || !newPrice) return;

    const priceValue = Number(
        newPrice.replace(/\./g, "").replace(",", ".")
    );

    if (isNaN(priceValue)) {
        alert("Geçerli bir fiyat giriniz!");
        return;
    }

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName,
                price: priceValue
            })
        });

        if (res.ok) {
            alert("Güncellendi!");
            loadEverything();
        }
    } catch (err) {
        console.error("Güncelleme hatası:", err);
    }
}

async function deleteProduct(id) {
    if (!confirm("Silinsin mi?")) return;

    try {
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
            alert("Silindi.");
            loadEverything();
        }
    } catch (err) {
        console.error("Silme hatası:", err);
    }
}

//Yeni ürün ekleme (admin)
const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const productData = {
            name: document.getElementById("name").value,
            type: document.getElementById("type").value,
            material: document.getElementById("material").value,
            price: Number(document.getElementById("price").value),
            weight: document.getElementById("weight").value,
            imageFolder: document.getElementById("imageFolder").value,
            stone: document.getElementById("stone").value,
            warranty: document.getElementById("warranty").value,
            description: document.getElementById("description").value
        };

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert("Ürün kaydedildi!");
                productForm.reset();
                loadEverything();
            } else {
                alert("Ürün eklenemedi.");
            }
        } catch (err) {
            console.error("Sunucu hatası:", err);
        }
    });
}

//Sayfa yüklendiğinde admin verilerini otomatik olarak yükleme
window.onload = loadEverything;
