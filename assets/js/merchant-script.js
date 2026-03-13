const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let allProducts = [];
let filteredProducts = [];
let activeFilter = "all";
let currentPage = 1;
const itemsPerPage = 10;

function renderProducts() {
    productList.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

    if (productsToDisplay.length === 0) {
        productList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.5;">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Produk tidak ditemukan.</p>
            </div>`;
        renderPaginationControls(0);
        return;
    }

    productsToDisplay.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <div class="price">${product.price}</div>
            <div class="product-stats">
                <div class="stat-item">
                    <i class="fa-solid fa-box"></i>
                    <span>Stok: ${product.stock}</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-cart-arrow-down"></i>
                    <span>Min: ${product.min_buy}</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-cart-plus"></i>
                    <span>Max: ${product.max_buy || product.stock}</span>
                </div>
            </div>
            <a href="product-detail/?id=${product.id}" class="detail-btn">Lihat detail ➞</a>
        `;
        productList.appendChild(card);
    });

    renderPaginationControls(filteredProducts.length);
}

function renderPaginationControls(totalItems) {
    let paginationContainer = document.querySelector(".pagination-container");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination-container";
        document.querySelector(".filter-bar").insertAdjacentElement("afterend", paginationContainer);
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = "pag-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginationContainer.appendChild(prevBtn);

    const pageNumbers = document.createElement("div");
    pageNumbers.className = "page-numbers";

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.className = `page-num ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => {
            currentPage = i;
            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pageNumbers.appendChild(btn);
    }
    paginationContainer.appendChild(pageNumbers);

    const nextBtn = document.createElement("button");
    nextBtn.className = "pag-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginationContainer.appendChild(nextBtn);
}

function filterProducts() {
    const searchValue = searchInput.value.toLowerCase();

    filteredProducts = allProducts.filter(product => {
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const matchSearch = name.includes(searchValue);
        const matchFilter = activeFilter === "all" || category === activeFilter;

        return matchSearch && matchFilter;
    });

    currentPage = 1;
    renderProducts();
}

fetch("../../data/product.json")
    .then(response => response.json())
    .then(data => {
        allProducts = data;
        filteredProducts = data;
        renderProducts();
    })
    .catch(error => {
        console.error("Gagal memuat data produk:", error);
    });

searchInput.addEventListener("input", filterProducts);

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        filterProducts();
    });
});
