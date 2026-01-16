//Ürün listeleme ve filtreleme ayarları
const productList = document.getElementById("productList");
let allProducts = [];

const params = new URLSearchParams(window.location.search);
const typeParam = params.get("type");
const materialParam = params.get("material");
const searchParam = params.get("search")
  ? params.get("search").toLowerCase()
  : null;

//Ürün verilerini yükleme
fetch("/api/products")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts();
  });

//Ürünü sepete ekleyip sepet bilgisini localStorage’da güncelleme
function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart.push({
    id,
    name,
    price,
    image
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  if (typeof updateCartCount === "function") updateCartCount();
  alert(`${name} sepete eklendi!`);

}

//Ürün listeleme ve filtreleme işlemleri
function renderProducts() {
  if (!productList) return;
  productList.innerHTML = "";

  const filtered = allProducts.filter(p => {
    return (!typeParam || p.type === typeParam) &&
           (!materialParam || p.material === materialParam) &&
           (!searchParam || p.name.toLowerCase().includes(searchParam));
  });

  let folderCounters = {};

  filtered.forEach(product => {

    if (!folderCounters[product.imageFolder]) {
      folderCounters[product.imageFolder] = 1;
    } else {
      folderCounters[product.imageFolder]++;
      if (folderCounters[product.imageFolder] > 15) {
        folderCounters[product.imageFolder] = 1;
      }
    }

    const imgNo = folderCounters[product.imageFolder];
    let imgPath = "";

if (
  product.imageFolder.includes(".png") ||
  product.imageFolder.includes(".jpg")
) {
  //Tam resim yolu verilmişse
  imgPath = product.imageFolder;
} else {
  //Klasör verilmişse
  imgPath = `${product.imageFolder}/${imgNo}.png`

}
    
    //Ürün kartını oluşturarak listeye ekler (resim, fiyat ve sepete ekle butonu)
    productList.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm border-0">

          <a href="/product?id=${product.id}&img=${imgNo}">
            <img src="${imgPath}"
              class="card-img-top"
              style="height:280px; object-fit:contain; background:#fff; padding:15px;"
              onerror="this.src='/images/logo/1.png'">
          </a>

          <div class="card-body text-center">
            <h6 class="fw-bold mb-1">${product.name}</h6>

            <p class="text-warning fw-bold mb-2">
              ${product.price.toLocaleString("tr-TR")} ₺
            </p>

            <!--SEPETE EKLE GERİ GELDİ -->
  <button
  class="btn btn-dark btn-sm w-100"
  onclick="addToCart(
    '${product.id}',
    '${product.name}',
    ${product.price},
    '${imgPath}'
  )">
  <span>SEPETE EKLE</span>
</button>
          </div>
        </div>
      </div>
    `;
  });
}


