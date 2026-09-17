let cart = [];
let wishlist = [];
let currentWaitingProduct = "";
let notificationTimer = null;

let loader;
let menuButton;
let navMenu;
let searchInput;
let categoryFilter;
let productResultCount;
let noProducts;
let cartElement;
let cartOverlay;
let cartItems;
let cartTotal;
let cartCount;
let wishlistCount;
let wishlistModal;
let wishlistItems;
let quickViewModal;
let quickViewContent;
let checkoutModal;
let checkoutSummary;
let orderConfirmation;
let confirmationContent;
let waitingList;
let waitingProduct;
let notification;
let backToTop;

document.addEventListener("DOMContentLoaded", function () {
    loader = document.getElementById("loader");
    menuButton = document.getElementById("menu-button");
    navMenu = document.getElementById("nav-menu");
    searchInput = document.getElementById("search");
    categoryFilter = document.getElementById("category-filter");
    productResultCount = document.getElementById("product-result-count");
    noProducts = document.getElementById("no-products");
    cartElement = document.getElementById("cart");
    cartOverlay = document.getElementById("cart-overlay");
    cartItems = document.getElementById("cart-items");
    cartTotal = document.getElementById("cart-total");
    cartCount = document.getElementById("cart-count");
    wishlistCount = document.getElementById("wishlist-count");
    wishlistModal = document.getElementById("wishlist-modal");
    wishlistItems = document.getElementById("wishlist-items");
    quickViewModal = document.getElementById("quick-view-modal");
    quickViewContent = document.getElementById("quick-view-content");
    checkoutModal = document.getElementById("checkout-modal");
    checkoutSummary = document.getElementById("checkout-summary");
    orderConfirmation = document.getElementById("order-confirmation");
    confirmationContent = document.getElementById("confirmation-content");
    waitingList = document.getElementById("waiting-list");
    waitingProduct = document.getElementById("waiting-product");
    notification = document.getElementById("notification");
    backToTop = document.getElementById("back-to-top");

    loadSavedData();
    setupMobileMenu();
    setupSearch();
    setupCategoryFilter();
    setupBackToTop();
    setupScrollAnimation();
    setupImageErrorHandling();
    setupKeyboardControls();

    updateCartUI();
    updateWishlistUI();
    updateWishlistButtons();
    updateProductsCount();

    setTimeout(function () {
        if (loader) {
            loader.classList.add("hidden");
        }
    }, 800);
});

function loadSavedData() {
    try {
        const savedCart = localStorage.getItem("cortezBlancCart");
        const savedWishlist = localStorage.getItem("cortezBlancWishlist");

        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart.filter(function (item) {
                    return (
                        item &&
                        typeof item.name === "string" &&
                        Number(item.price) >= 0 &&
                        Number(item.quantity) > 0
                    );
                });
            }
        }

        if (savedWishlist) {
            const parsedWishlist = JSON.parse(savedWishlist);

            if (Array.isArray(parsedWishlist)) {
                wishlist = parsedWishlist.filter(function (item) {
                    return typeof item === "string";
                });
            }
        }
    } catch (error) {
        console.error("Could not load saved data:", error);
        cart = [];
        wishlist = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(
            "cortezBlancCart",
            JSON.stringify(cart)
        );
    } catch (error) {
        console.error("Could not save cart:", error);
    }
}

function saveWishlist() {
    try {
        localStorage.setItem(
            "cortezBlancWishlist",
            JSON.stringify(wishlist)
        );
    } catch (error) {
        console.error("Could not save wishlist:", error);
    }
}

function setupMobileMenu() {
    if (!menuButton || !navMenu) {
        return;
    }

    menuButton.addEventListener("click", function () {
        navMenu.classList.toggle("active");
        menuButton.classList.toggle("active");

        const isOpen = navMenu.classList.contains("active");

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    const navLinks = navMenu.querySelectorAll("a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
            menuButton.classList.remove("active");

            menuButton.setAttribute(
                "aria-label",
                "Open menu"
            );
        });
    });
}

function setupSearch() {
    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", filterProducts);
}

function setupCategoryFilter() {
    if (!categoryFilter) {
        return;
    }

    categoryFilter.addEventListener("change", filterProducts);
}

function filterProducts() {
    const products = document.querySelectorAll(".product-card");

    if (!products.length) {
        if (productResultCount) {
            productResultCount.textContent = "0 products found";
        }

        if (noProducts) {
            noProducts.style.display = "block";
        }

        return;
    }

    const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const selectedCategory = categoryFilter
        ? categoryFilter.value.toLowerCase()
        : "all";

    let visibleProducts = 0;

    products.forEach(function (product) {
        const productName = (
            product.dataset.name || ""
        ).toLowerCase();

        const productCategory = (
            product.dataset.category || ""
        ).toLowerCase();

        const matchesSearch =
            productName.includes(searchTerm) ||
            productCategory.includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        if (matchesSearch && matchesCategory) {
            product.style.display = "";
            visibleProducts++;
        } else {
            product.style.display = "none";
        }
    });

    if (productResultCount) {
        productResultCount.textContent =
            visibleProducts +
            " product" +
            (visibleProducts === 1 ? "" : "s") +
            " found";
    }

    if (noProducts) {
        noProducts.style.display =
            visibleProducts === 0 ? "block" : "none";
    }
}

function updateProductsCount() {
    filterProducts();
}

function getProductData(productName) {
    const products = document.querySelectorAll(".product-card");

    for (const product of products) {
        const name = product.dataset.name || "";

        if (
            name.toLowerCase() ===
            String(productName).toLowerCase()
        ) {
            const imageElement = product.querySelector("img");

            return {
                name: name,
                category: product.dataset.category || "",
                price: Number(product.dataset.price) || 0,
                stock: product.dataset.stock || "in-stock",
                image:
                    product.dataset.image ||
                    (
                        imageElement
                            ? imageElement.getAttribute("src")
                            : ""
                    )
            };
        }
    }

    return null;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addToCart(productName) {
    const product = getProductData(productName);

    if (!product) {
        showNotification("Product could not be found.");
        return;
    }

    if (product.stock !== "in-stock") {
        showNotification(
            product.name + " is currently sold out."
        );
        return;
    }

    const existingProduct = cart.find(function (item) {
        return item.name === product.name;
    });

    if (existingProduct) {
        existingProduct.quantity =
            Number(existingProduct.quantity || 0) + 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();

    showNotification(
        product.name + " added to cart."
    );
}

function updateCartUI() {
    const totalItems = cart.reduce(function (
        total,
        item
    ) {
        return (
            total +
            Number(item.quantity || 0)
        );
    }, 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    renderCart();
}

function renderCart() {
    if (!cartItems) {
        return;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <p>Add something beautiful to your cart.</p>
            </div>
        `;

        if (cartTotal) {
            cartTotal.textContent = "₦0";
        }

        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(function (
        item,
        index
    ) {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const itemTotal = price * quantity;

        total += itemTotal;

        return `
            <div class="cart-item">

                <div class="cart-item-image">
                    ${
                        item.image
                            ? `
                                <img
                                    src="${escapeHTML(item.image)}"
                                    alt="${escapeHTML(item.name)}"
                                >
                            `
                            : ""
                    }
                </div>

                <div class="cart-item-info">

                    <h4>
                        ${escapeHTML(item.name)}
                    </h4>

                    <p>
                        ₦${price.toLocaleString()}
                    </p>

                    <div class="cart-quantity">

                        <button
                            type="button"
                            onclick="changeCartQuantity(${index}, -1)"
                        >
                            −
                        </button>

                        <span>
                            ${quantity}
                        </span>

                        <button
                            type="button"
                            onclick="changeCartQuantity(${index}, 1)"
                        >
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="remove-cart-item"
                        onclick="removeFromCart(${index})"
                    >
                        Remove
                    </button>

                </div>

            </div>
        `;
    }).join("");

    if (cartTotal) {
        cartTotal.textContent =
            "₦" + total.toLocaleString();
    }
}

function changeCartQuantity(index, amount) {
    if (!cart[index]) {
        return;
    }

    cart[index].quantity =
        Number(cart[index].quantity || 0) +
        amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    if (!cart[index]) {
        return;
    }

    const productName = cart[index].name;

    cart.splice(index, 1);

    saveCart();
    updateCartUI();

    showNotification(
        productName + " removed from cart."
    );
}

function openCart() {
    if (!cartElement) {
        console.error(
            'The element with id="cart" was not found.'
        );
        return;
    }

    renderCart();

    cartElement.classList.add("active");

    if (cartOverlay) {
        cartOverlay.classList.add("active");
    }

    document.body.classList.add("no-scroll");
}

function closeCart() {
    if (cartElement) {
        cartElement.classList.remove("active");
    }

    if (cartOverlay) {
        cartOverlay.classList.remove("active");
    }

    document.body.classList.remove("no-scroll");
}

function toggleWishlist(productName) {
    const existingIndex =
        wishlist.indexOf(productName);

    if (existingIndex !== -1) {
        wishlist.splice(existingIndex, 1);

        showNotification(
            productName +
            " removed from wishlist."
        );
    } else {
        wishlist.push(productName);

        showNotification(
            productName +
            " added to wishlist."
        );
    }

    saveWishlist();
    updateWishlistUI();
    updateWishlistButtons();
}

function updateWishlistUI() {
    if (wishlistCount) {
        wishlistCount.textContent =
            wishlist.length;
    }

    renderWishlist();
}

function updateWishlistButtons() {
    const buttons =
        document.querySelectorAll(
            ".wishlist-button"
        );

    buttons.forEach(function (button) {
        const productName =
            button.dataset.productName;

        if (!productName) {
            return;
        }

        if (wishlist.includes(productName)) {
            button.classList.add("active");
            button.innerHTML =
                "♥ In Wishlist";
        } else {
            button.classList.remove("active");
            button.innerHTML =
                "♡ Add to Wishlist";
        }
    });
}

function renderWishlist() {
    if (!wishlistItems) {
        return;
    }

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div class="empty-wishlist">
                <p>Your wishlist is empty.</p>
                <p>Save your favourite pieces here.</p>
            </div>
        `;

        return;
    }

    wishlistItems.innerHTML = wishlist
        .map(function (productName) {
            const product =
                getProductData(productName);

            if (!product) {
                return "";
            }

            const soldOut =
                product.stock !== "in-stock";

            return `
                <div class="wishlist-item">

                    <div class="wishlist-item-image">
                        ${
                            product.image
                                ? `
                                    <img
                                        src="${escapeHTML(product.image)}"
                                        alt="${escapeHTML(product.name)}"
                                    >
                                `
                                : ""
                        }
                    </div>

                    <div class="wishlist-item-info">

                        <h4>
                            ${escapeHTML(product.name)}
                        </h4>

                        <p>
                            ₦${product.price.toLocaleString()}
                        </p>

                        ${
                            soldOut
                                ? `
                                    <button
                                        type="button"
                                        onclick="showWaitingList('${escapeHTML(product.name)}')"
                                    >
                                        SOLD OUT
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        onclick="addToCart('${escapeHTML(product.name)}')"
                                    >
                                        ADD TO CART
                                    </button>
                                `
                        }

                        <button
                            type="button"
                            onclick="toggleWishlist('${escapeHTML(product.name)}')"
                        >
                            Remove
                        </button>

                    </div>

                </div>
            `;
        })
        .join("");
}

function showWishlist() {
    if (!wishlistModal) {
        console.error(
            'The element with id="wishlist-modal" was not found.'
        );
        return;
    }

    renderWishlist();

    wishlistModal.classList.add("active");

    document.body.classList.add("no-scroll");
}

function closeWishlist(event) {
    if (!wishlistModal) {
        return;
    }

    if (
        !event ||
        event.target === wishlistModal
    ) {
        wishlistModal.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

function quickView(productName) {
    const product =
        getProductData(productName);

    if (
        !product ||
        !quickViewModal ||
        !quickViewContent
    ) {
        return;
    }

    const soldOut =
        product.stock !== "in-stock";

    quickViewContent.innerHTML = `
        <div class="quick-view-image">
            ${
                product.image
                    ? `
                        <img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >
                    `
                    : ""
            }
        </div>

        <div class="quick-view-details">

            <h2>
                ${escapeHTML(product.name)}
            </h2>

            <p>
                ${escapeHTML(product.category)}
            </p>

            <p class="quick-view-price">
                ₦${product.price.toLocaleString()}
            </p>

            ${
                soldOut
                    ? `
                        <button
                            type="button"
                            onclick="showWaitingList('${escapeHTML(product.name)}')"
                        >
                            JOIN WAITING LIST
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            onclick="addToCart('${escapeHTML(product.name)}')"
                        >
                            ADD TO CART
                        </button>
                    `
            }

            <button
                type="button"
                onclick="toggleWishlist('${escapeHTML(product.name)}')"
            >
                ${
                    wishlist.includes(product.name)
                        ? "♥ In Wishlist"
                        : "♡ Add to Wishlist"
                }
            </button>

        </div>
    `;

    quickViewModal.classList.add("active");

    document.body.classList.add("no-scroll");
}

function closeQuickView(event) {
    if (!quickViewModal) {
        return;
    }

    if (
        !event ||
        event.target === quickViewModal
    ) {
        quickViewModal.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

function showWaitingList(productName) {
    currentWaitingProduct = productName;

    if (waitingProduct) {
        waitingProduct.value =
            productName;
    }

    if (waitingList) {
        waitingList.classList.add("active");
        document.body.classList.add("no-scroll");
    }
}

function closeWaitingList(event) {
    if (!waitingList) {
        return;
    }

    if (
        !event ||
        event.target === waitingList
    ) {
        waitingList.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

function submitWaitingList(event) {
    if (event) {
        event.preventDefault();
    }

    const nameElement =
        document.getElementById(
            "waiting-name"
        );

    const emailElement =
        document.getElementById(
            "waiting-email"
        );

    const phoneElement =
        document.getElementById(
            "waiting-phone"
        );

    const name = nameElement
        ? nameElement.value.trim()
        : "";

    const email = emailElement
        ? emailElement.value.trim()
        : "";

    const phone = phoneElement
        ? phoneElement.value.trim()
        : "";

    if (!name || !email || !phone) {
        showNotification(
            "Please fill in all waiting list details."
        );
        return;
    }

    showNotification(
        "You have been added to the waiting list."
    );

    if (waitingList) {
        waitingList.classList.remove("active");
    }

    document.body.classList.remove(
        "no-scroll"
    );

    if (event && event.target) {
        event.target.reset();
    }

    currentWaitingProduct = "";
}

function buildCheckoutSummaryHTML() {
    let total = 0;
    let summaryHTML = "";

    cart.forEach(function (item) {
        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            price * quantity;

        total += itemTotal;

        summaryHTML += `
            <div class="checkout-item">

                <div>
                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <p>
                        Quantity: ${quantity}
                    </p>
                </div>

                <strong>
                    ₦${itemTotal.toLocaleString()}
                </strong>

            </div>
        `;
    });

    summaryHTML += `
        <div class="checkout-total">
            <strong>TOTAL</strong>

            <strong>
                ₦${total.toLocaleString()}
            </strong>
        </div>
    `;

    return {
        summaryHTML: summaryHTML,
        total: total
    };
}

function openCheckout() {
    if (!cart || cart.length === 0) {
        showNotification(
            "Your cart is empty."
        );
        return;
    }

    if (!checkoutModal) {
        console.error(
            'ERROR: #checkout-modal was not found.'
        );
        return;
    }

    if (!checkoutSummary) {
        console.error(
            'ERROR: #checkout-summary was not found.'
        );
        return;
    }

    const summary =
        buildCheckoutSummaryHTML();

    checkoutSummary.innerHTML =
        summary.summaryHTML;

    checkoutModal.classList.add("active");

    document.body.classList.add(
        "no-scroll"
    );
}

function closeCheckout(event) {
    if (!checkoutModal) {
        return;
    }

    if (
        !event ||
        event.target === checkoutModal
    ) {
        checkoutModal.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "no-scroll"
        );
    }
}

function completeOrder(event) {
    if (event) {
        event.preventDefault();
    }

    if (!cart || cart.length === 0) {
        showNotification(
            "Your cart is empty."
        );
        return;
    }

    const summary =
        buildCheckoutSummaryHTML();

    const customerName =
        document.getElementById(
            "customer-name"
        );

    const paymentMethod =
        document.getElementById(
            "payment-method"
        );

    const name =
        customerName
            ? customerName.value.trim()
            : "";

    const payment =
        paymentMethod
            ? paymentMethod.value
            : "";

    if (confirmationContent) {
        confirmationContent.innerHTML = `
            <p>
                Thank you
                ${name ? escapeHTML(name) : ""}.
            </p>

            <p>
                Your order has been received.
            </p>

            <p>
                Payment method:
                <strong>
                    ${escapeHTML(payment)}
                </strong>
            </p>

            <p>
                Order total:
                <strong>
                    ₦${summary.total.toLocaleString()}
                </strong>
            </p>
        `;
    }

    cart = [];

    saveCart();
    updateCartUI();

    const checkoutForm =
        document.getElementById(
            "checkout-form"
        );

    if (checkoutForm) {
        checkoutForm.reset();
    }

    if (checkoutModal) {
        checkoutModal.classList.remove(
            "active"
        );
    }

    if (orderConfirmation) {
        orderConfirmation.classList.add(
            "active"
        );
    }

    document.body.classList.add(
        "no-scroll"
    );
}

function closeOrderConfirmation(event) {
    if (!orderConfirmation) {
        return;
    }

    if (
        !event ||
        event.target === orderConfirmation
    ) {
        orderConfirmation.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "no-scroll"
        );
    }
}

function finishShopping() {
    if (orderConfirmation) {
        orderConfirmation.classList.remove(
            "active"
        );
    }

    document.body.classList.remove(
        "no-scroll"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showNotification(message) {
    if (!notification) {
        console.log(message);
        return;
    }

    notification.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(
        function () {
            notification.classList.remove(
                "show"
            );
        },
        3000
    );
}

function setupBackToTop() {
    if (!backToTop) {
        return;
    }

    window.addEventListener(
        "scroll",
        function () {
            if (window.scrollY > 500) {
                backToTop.classList.add(
                    "show"
                );
            } else {
                backToTop.classList.remove(
                    "show"
                );
            }
        }
    );
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function setupScrollAnimation() {
    const elements =
        document.querySelectorAll(
            ".product-card, .feature"
        );

    if (!elements.length) {
        return;
    }

    if (
        !("IntersectionObserver" in window)
    ) {
        elements.forEach(function (
            element
        ) {
            element.classList.add(
                "visible"
            );
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            function (entries) {
                entries.forEach(
                    function (entry) {
                        if (
                            entry.isIntersecting
                        ) {
                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );
            },
            {
                threshold: 0.15
            }
        );

    elements.forEach(function (element) {
        element.classList.add("reveal");
        observer.observe(element);
    });
}

function setupImageErrorHandling() {
    const images =
        document.querySelectorAll("img");

    images.forEach(function (image) {
        image.addEventListener(
            "error",
            function () {
                image.classList.add(
                    "image-error"
                );

                image.alt =
                    "Product image unavailable";
            }
        );
    });
}

function setupKeyboardControls() {
    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key !== "Escape") {
                return;
            }

            closeCart();

            if (quickViewModal) {
                quickViewModal.classList.remove(
                    "active"
                );
            }

            if (checkoutModal) {
                checkoutModal.classList.remove(
                    "active"
                );
            }

            if (wishlistModal) {
                wishlistModal.classList.remove(
                    "active"
                );
            }

            if (waitingList) {
                waitingList.classList.remove(
                    "active"
                );
            }

            if (orderConfirmation) {
                orderConfirmation.classList.remove(
                    "active"
                );
            }

            document.body.classList.remove(
                "no-scroll"
            );
        }
    );
}

window.addEventListener(
    "scroll",
    function () {
        const header =
            document.querySelector("header");

        if (!header) {
            return;
        }

        if (window.scrollY > 50) {
            header.classList.add(
                "scrolled"
            );
        } else {
            header.classList.remove(
                "scrolled"
            );
        }
    }
);

window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.changeCartQuantity =
    changeCartQuantity;
window.removeFromCart =
    removeFromCart;

window.toggleWishlist =
    toggleWishlist;
window.showWishlist =
    showWishlist;
window.closeWishlist =
    closeWishlist;

window.quickView =
    quickView;
window.closeQuickView =
    closeQuickView;

window.showWaitingList =
    showWaitingList;
window.closeWaitingList =
    closeWaitingList;
window.submitWaitingList =
    submitWaitingList;

window.openCheckout =
    openCheckout;
window.closeCheckout =
    closeCheckout;
window.completeOrder =
    completeOrder;

window.closeOrderConfirmation =
    closeOrderConfirmation;
window.finishShopping =
    finishShopping;

window.scrollToTop =
    scrollToTop;