//URL parametrelerinden ürün bilgilerini alma (id ve seçili görsel)
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const selectedImg = Number(params.get("img")); 

if (!productId) {
  alert("Ürün bulunamadı");
}

//Ürün detay alanları
const mainImage = document.getElementById("mainImage");
const thumbs = document.getElementById("thumbs");
const productName = document.getElementById("productName");
const productMaterial = document.getElementById("productMaterial");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const productWeight = document.getElementById("productWeight");
const productStone = document.getElementById("productStone");
const productWarranty = document.getElementById("productWarranty");

//API'den ürünleri alıp URL'deki ID'ye göre ilgili ürünü bulma
fetch("/api/products")
  .then(res => res.json())
  .then(products => {
    const product = products.find(p => p.id === productId);

    if (!product) {
      alert("Ürün bulunamadı");
      return;
    }

    // Ürün bilgilerini sayfadaki ilgili alanlara yerleştirme
    productName.textContent = product.name;
    productMaterial.textContent = `${product.material} / ${product.type}`
    productPrice.textContent = product.price.toLocaleString("tr-TR") + " ₺";
    productDescription.textContent = product.description || "";
    productWeight.textContent = product.weight || "-";
    productStone.textContent = product.stone || "-";
    productWarranty.textContent = product.warranty || "-";

    //Ana ürün görselini belirleme
    const mainImgNo =
      selectedImg ||
      product.mainImage ||
      1;

    if (
  product.imageFolder.includes(".png") ||
  product.imageFolder.includes(".jpg")
) {
  mainImage.src = product.imageFolder;
} else {
  mainImage.src = `${product.imageFolder}/${mainImgNo}.png`

}

//Ürün detay sayfasında küçük görselleri (thumbnail) ve benzer ürünleri oluşturma
    thumbs.innerHTML = "";

    for (let i = 1; i <= 15; i++) {
      const imgPath = `${product.imageFolder}/${i}.png`
      const thumb = document.createElement("img");
      thumb.src = imgPath;
      thumb.alt = product.name;
      thumb.style.width = "70px";
      thumb.style.height = "70px";
      thumb.style.objectFit = "contain";
      thumb.style.cursor = "pointer";
      thumb.style.background = "#fff";
      thumb.style.padding = "5px";
      thumb.style.border =
        i === mainImgNo
          ? "2px solid #b38728"
          : "1px solid #ddd";

      //Hatalı veya eksik görselleri otomatik olarak kaldırma
      thumb.onerror = function () {
        this.remove();
      };

      //Tıklanınca ana resmi değiştirme
      thumb.onclick = function () {
        mainImage.src = this.src;
        document
          .querySelectorAll("#thumbs img")
          .forEach(img => (img.style.border = "1px solid #ddd"));
        this.style.border = "2px solid #b38728";
      };

      thumbs.appendChild(thumb);
      const relatedContainer = document.getElementById("relatedProducts");

if (relatedContainer) {
  relatedContainer.innerHTML = "";

  products
    .filter(p =>
  p.id !== product.id &&
  p.type === product.type &&
  p.material === product.material
)

    .forEach(item => {
      const div = document.createElement("div");
      div.className = "related-product-card";

      const img = document.createElement("img");
      img.src = item.imageFolder.includes(".png")
        ? item.imageFolder
        : `${item.imageFolder}/1.png`


      img.alt = item.name;

      div.appendChild(img);

      div.onclick = () => {
        window.location.href =`/product?id=${item.id}`

      };

      relatedContainer.appendChild(div);
    });
}

    }

    //Ürünü sepete ekleme ve sepet bilgisini localStorage’da güncelleme
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
      addToCartBtn.onclick = function () {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");

       cart.push({
  id: product.id,
  name: product.name,
  price: product.price,
  image: mainImage.src
});

        localStorage.setItem("cart", JSON.stringify(cart));

        if (typeof updateCartCount === "function") {
          updateCartCount();
        }

        alert(product.name + " sepete eklendi!");
      };
    }
  })
  .catch(err => {
    console.error("Ürün yüklenemedi:", err);
  });
