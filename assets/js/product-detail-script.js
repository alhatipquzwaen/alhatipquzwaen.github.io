const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let basePrice = 0;
let currentStock = 0;
let minBuy = 1;
let maxBuy = 99999;
let productData = null;

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function showPopup(title, message) {
    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMsg").textContent = message;
    document.getElementById("stockPopup").classList.add("show");
}

document.getElementById("closePopup").onclick = function() {
    document.getElementById("stockPopup").classList.remove("show");
}

function updateDetails() {
    let qtyInput = document.getElementById("qtyInput");
    let qty = parseInt(qtyInput.value);

    if (qty > maxBuy) {
        qty = maxBuy;
        qtyInput.value = maxBuy;
        showPopup("Batas Maksimal", `Maaf, batas maksimal pembelian produk ini adalah ${maxBuy} unit.`);
    }

    if (qty > currentStock) {
        qty = currentStock;
        qtyInput.value = currentStock;
        showPopup("Stok Tidak Cukup", `Maaf, stok hanya tersedia ${currentStock} unit.`);
    }

    if (qty < minBuy && !isNaN(qty)) {
        qty = minBuy;
        qtyInput.value = minBuy;
        showPopup("Minimal Pembelian", `Minimal pembelian produk ini adalah ${minBuy} unit.`);
    }

    if (isNaN(qty) || qty < 1) {
        qty = minBuy;
    }

    const total = basePrice * qty;
    document.getElementById("totalPrice").textContent = formatRupiah(total);

    const productLink = window.location.href;
    const buyMessage = encodeURIComponent(
        `Halo, saya ingin membeli produk berikut:\n\n` +
        `Produk: ${productData.name}\n` +
        `Jumlah: ${qty}\n` +
        `Total Harga: ${formatRupiah(total)}\n` +
        `Kategori: ${productData.category}\n\n` +
        `Link Produk:\n${productLink}`
    );

    document.getElementById("buyLink").href = `https://wa.me/628137742379?text=${buyMessage}`;
}

fetch("../../../data/product.json")
    .then(res => res.json())
    .then(products => {
        const product = products.find(p => p.id == id);

        if (product) {
            productData = product;
            basePrice = parseInt(product.price.replace(/[^0-9]/g, ""));
            currentStock = product.stock;
            minBuy = product.min_buy || 1;
            maxBuy = product.max_buy || currentStock;

            document.getElementById("productImg").src = product.img;
            document.getElementById("productName").textContent = product.name;
            document.getElementById("productDesc").textContent = product.desc;
            document.getElementById("productStock").textContent = `Stok: ${currentStock}`;
            document.getElementById("productCategory").textContent = product.category;
            document.getElementById("productVersion").textContent = product.version;
            document.getElementById("productLicense").textContent = product.license;

            const qtyInput = document.getElementById("qtyInput");
            qtyInput.value = minBuy;

            const infoBox = document.getElementById("productExtra");
            infoBox.innerHTML = "";
            product.info.forEach(text => {
                const div = document.createElement("div");
                div.className = "info-item";
                div.innerHTML = `<i class="fa-solid fa-check-circle"></i> <span>${text}</span>`;
                infoBox.appendChild(div);
            });

            document.getElementById("plusBtn").onclick = () => {
                let val = parseInt(qtyInput.value);
                if (val < maxBuy && val < currentStock) {
                    qtyInput.value = val + 1;
                    updateDetails();
                } else {
                    showPopup("Batas Maksimal", `Anda telah mencapai batas maksimal pembelian.`);
                }
            };

            document.getElementById("minusBtn").onclick = () => {
                let val = parseInt(qtyInput.value);
                if (val > minBuy) {
                    qtyInput.value = val - 1;
                    updateDetails();
                } else {
                    showPopup("Minimal Pembelian", `Jumlah minimal pembelian adalah ${minBuy}.`);
                }
            };

            qtyInput.addEventListener("change", updateDetails);
            updateDetails();

            document.getElementById("waLink").href =
                "https://wa.me/628137742379?text=Halo admin, saya ingin bertanya tentang: " + window.location.href;
        } else {
            const main = document.getElementById("mainContent");
            main.innerHTML = '<h2 class="not-found">Produk tidak ditemukan</h2>';
        }
    })
    .catch(err => {
        console.error("Fetch error:", err);
    });
