const STORE_CART_KEY = 'rutigym.store.cart.v1';
const STORE_PRODUCTS = [
    {
        id: 'botella-termica',
        name: 'Botella térmica',
        category: 'accesorios',
        categoryLabel: 'Accesorios',
        detail: 'Acero inoxidable · 750 ml',
        description: 'Para tener tu bebida a mano durante todo el entrenamiento.',
        price: 24900,
        art: 'bottle',
        tag: 'MÁS ELEGIDO'
    },
    {
        id: 'shaker',
        name: 'Shaker Ruti',
        category: 'accesorios',
        categoryLabel: 'Accesorios',
        detail: 'Mezclador · 600 ml',
        description: 'Liviano, práctico y con cierre seguro para llevar en el bolso.',
        price: 12900,
        art: 'shaker',
        tag: ''
    },
    {
        id: 'toalla',
        name: 'Toalla de entrenamiento',
        category: 'accesorios',
        categoryLabel: 'Accesorios',
        detail: 'Microfibra · secado rápido',
        description: 'Suave, compacta y lista para acompañarte en cada sesión.',
        price: 9900,
        art: 'towel',
        tag: ''
    },
    {
        id: 'straps',
        name: 'Straps de agarre',
        category: 'accesorios',
        categoryLabel: 'Accesorios',
        detail: 'Par · algodón reforzado',
        description: 'Un accesorio simple para sumar a tus días de levantamiento.',
        price: 11500,
        art: 'straps',
        tag: ''
    },
    {
        id: 'creatina',
        name: 'Creatina monohidratada',
        category: 'suplementos',
        categoryLabel: 'Suplementos',
        detail: '300 g · sin sabor',
        description: 'Suplemento en polvo. Leé el rótulo y consultá antes de consumir.',
        price: 28900,
        art: 'creatine',
        tag: 'ESENCIAL'
    },
    {
        id: 'proteina',
        name: 'Proteína en polvo',
        category: 'suplementos',
        categoryLabel: 'Suplementos',
        detail: '500 g · sabor vainilla',
        description: 'Complemento alimentario. Revisá ingredientes y alérgenos.',
        price: 35900,
        art: 'protein',
        tag: ''
    },
    {
        id: 'remera',
        name: 'Remera Training',
        category: 'indumentaria',
        categoryLabel: 'Indumentaria',
        detail: 'Tela liviana · varios talles',
        description: 'Un básico cómodo para moverte con libertad en tu rutina.',
        price: 22900,
        art: 'shirt',
        tag: ''
    },
    {
        id: 'bolso',
        name: 'Bolso deportivo',
        category: 'indumentaria',
        categoryLabel: 'Indumentaria',
        detail: 'Compartimento amplio · 24 L',
        description: 'Espacio para guardar tus esenciales y salir directo al gimnasio.',
        price: 31900,
        art: 'bag',
        tag: 'NUEVO'
    }
];

function readStoreCart() {
    const storedCart = localStorage.getItem(STORE_CART_KEY);
    if (!storedCart) {
        return {};
    }

    const parsedCart = JSON.parse(storedCart);
    if (!parsedCart || typeof parsedCart !== 'object' || Array.isArray(parsedCart)) {
        throw new Error('No se pudo leer el carrito guardado en este navegador.');
    }

    return Object.fromEntries(
        Object.entries(parsedCart).filter(([id, quantity]) =>
            STORE_PRODUCTS.some(product => product.id === id) &&
            Number.isInteger(quantity) &&
            quantity > 0
        )
    );
}

function writeStoreCart(cart) {
    localStorage.setItem(STORE_CART_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(price);
}

function createProductCard(product, quantity) {
    const card = document.createElement('article');
    card.className = 'store-product-card';

    const art = document.createElement('div');
    art.className = `store-product-art store-product-art--${product.art}`;
    art.setAttribute('aria-hidden', 'true');

    const artShape = document.createElement('span');
    artShape.className = 'store-product-shape';
    art.appendChild(artShape);

    const artCaption = document.createElement('span');
    artCaption.className = 'store-product-art-caption';
    artCaption.textContent = 'RUTIGYM / TRAINING';
    art.appendChild(artCaption);

    if (product.tag) {
        const tag = document.createElement('span');
        tag.className = 'store-product-tag';
        tag.textContent = product.tag;
        art.appendChild(tag);
    }

    const content = document.createElement('div');
    content.className = 'store-product-content';

    const category = document.createElement('p');
    category.className = 'store-product-category';
    category.textContent = product.categoryLabel;

    const title = document.createElement('h3');
    title.textContent = product.name;

    const detail = document.createElement('p');
    detail.className = 'store-product-detail';
    detail.textContent = product.detail;

    const description = document.createElement('p');
    description.className = 'store-product-description';
    description.textContent = product.description;

    const footer = document.createElement('div');
    footer.className = 'store-product-footer';

    const price = document.createElement('strong');
    price.className = 'store-product-price';
    price.textContent = formatPrice(product.price);

    const addButton = document.createElement('button');
    addButton.className = 'store-add-button';
    addButton.type = 'button';
    addButton.dataset.addProduct = product.id;
    addButton.setAttribute('aria-label', `Agregar ${product.name} al carrito`);
    addButton.textContent = quantity ? `Agregar · ${quantity} en carrito` : 'Agregar al carrito';

    footer.append(price, addButton);
    content.append(category, title, detail, description, footer);
    card.append(art, content);
    return card;
}

function renderProducts(products, cart) {
    const productContainer = document.getElementById('store-products');
    const resultCount = document.getElementById('store-results');
    productContainer.replaceChildren();

    if (products.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'store-no-results';
        emptyMessage.textContent = 'No encontramos productos con esa búsqueda. Probá con otro término o categoría.';
        productContainer.appendChild(emptyMessage);
    } else {
        products.forEach(product => {
            productContainer.appendChild(createProductCard(product, cart[product.id] || 0));
        });
    }

    resultCount.textContent = `${products.length} ${products.length === 1 ? 'producto disponible' : 'productos disponibles'}`;
}

function renderCart(cart) {
    const container = document.getElementById('store-cart-items');
    const checkout = document.getElementById('store-checkout');
    const clearButton = document.getElementById('store-clear-cart');
    const itemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
    const subtotal = STORE_PRODUCTS.reduce(
        (total, product) => total + product.price * (cart[product.id] || 0),
        0
    );
    const countText = `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`;

    document.getElementById('store-cart-count').textContent = String(itemCount);
    document.querySelector('.store-cart-shortcut').setAttribute('aria-label', `Ir al carrito, ${countText}`);
    document.getElementById('cart-item-count').textContent = countText;
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('cart-shipping').textContent = itemCount ? 'A coordinar' : '—';
    document.getElementById('cart-total').textContent = formatPrice(subtotal);
    clearButton.hidden = itemCount === 0;
    checkout.hidden = itemCount === 0;
    container.replaceChildren();

    if (itemCount === 0) {
        const empty = document.createElement('p');
        empty.className = 'store-cart-empty';
        empty.textContent = 'Todavía no agregaste productos. Cuando encuentres tus favoritos, van a aparecer acá.';
        container.appendChild(empty);
        return;
    }

    STORE_PRODUCTS.filter(product => cart[product.id]).forEach(product => {
        const item = document.createElement('div');
        item.className = 'store-cart-item';

        const details = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = product.name;
        const price = document.createElement('span');
        price.textContent = formatPrice(product.price * cart[product.id]);
        details.append(name, price);

        const controls = document.createElement('div');
        controls.className = 'store-quantity-controls';

        const decrease = document.createElement('button');
        decrease.type = 'button';
        decrease.dataset.changeProduct = product.id;
        decrease.dataset.changeBy = '-1';
        decrease.setAttribute('aria-label', `Quitar una unidad de ${product.name}`);
        decrease.textContent = '−';

        const quantity = document.createElement('span');
        quantity.textContent = String(cart[product.id]);
        quantity.setAttribute('aria-label', `Cantidad: ${cart[product.id]}`);

        const increase = document.createElement('button');
        increase.type = 'button';
        increase.dataset.changeProduct = product.id;
        increase.dataset.changeBy = '1';
        increase.setAttribute('aria-label', `Agregar una unidad de ${product.name}`);
        increase.textContent = '+';

        controls.append(decrease, quantity, increase);
        item.append(details, controls);
        container.appendChild(item);
    });
}

function applyProductFilters(cart) {
    const searchTerm = document.getElementById('store-search').value.trim().toLocaleLowerCase('es');
    const selectedCategory = document.querySelector('.store-filter.is-active').dataset.category;
    const visibleProducts = STORE_PRODUCTS.filter(product => {
        const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
        const matchesSearch = `${product.name} ${product.detail} ${product.description} ${product.categoryLabel}`
            .toLocaleLowerCase('es')
            .includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    renderProducts(visibleProducts, cart);
}

document.addEventListener('DOMContentLoaded', function () {
    const cartError = document.getElementById('store-cart-items');
    let cart;
    try {
        cart = readStoreCart();
    } catch (error) {
        const message = document.createElement('p');
        message.className = 'store-cart-error';
        message.setAttribute('role', 'alert');
        message.textContent = error.message || 'No se pudo cargar el carrito.';
        cartError.replaceChildren(message);
        return;
    }

    const updateCart = function () {
        writeStoreCart(cart);
        renderCart(cart);
        applyProductFilters(cart);
        document.getElementById('store-order-confirmation').hidden = true;
    };

    applyProductFilters(cart);
    renderCart(cart);

    document.querySelector('.store-categories').addEventListener('click', function (event) {
        const filter = event.target.closest('[data-category]');
        if (!filter) {
            return;
        }

        document.querySelectorAll('.store-filter').forEach(button => {
            const active = button === filter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        applyProductFilters(cart);
    });

    document.getElementById('store-search').addEventListener('input', function () {
        applyProductFilters(cart);
    });

    document.getElementById('store-products').addEventListener('click', function (event) {
        const addButton = event.target.closest('[data-add-product]');
        if (!addButton) {
            return;
        }

        const productId = addButton.dataset.addProduct;
        cart[productId] = (cart[productId] || 0) + 1;
        updateCart();
        document.getElementById('store-cart-count').classList.remove('store-cart-count--pulse');
        requestAnimationFrame(() => {
            document.getElementById('store-cart-count').classList.add('store-cart-count--pulse');
        });
    });

    document.getElementById('store-cart-items').addEventListener('click', function (event) {
        const control = event.target.closest('[data-change-product]');
        if (!control) {
            return;
        }

        const productId = control.dataset.changeProduct;
        const nextQuantity = (cart[productId] || 0) + Number(control.dataset.changeBy);
        if (nextQuantity <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = nextQuantity;
        }
        updateCart();
    });

    document.getElementById('store-clear-cart').addEventListener('click', function () {
        cart = {};
        updateCart();
    });

    document.getElementById('store-checkout').addEventListener('submit', function (event) {
        event.preventDefault();
        if (Object.keys(cart).length === 0) {
            return;
        }

        const reference = `RG-${Date.now().toString().slice(-7)}`;
        const confirmation = document.getElementById('store-order-confirmation');
        confirmation.textContent = `Pedido de muestra ${reference} confirmado en esta página. No se envió ninguna orden ni se procesó un pago.`;
        confirmation.hidden = false;
        cart = {};
        updateCart();
        confirmation.hidden = false;
    });
});
