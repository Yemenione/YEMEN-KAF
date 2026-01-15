-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- إنشاء جدول سلة المشتريات
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (customer_id, product_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- إدراج الفئات
INSERT INTO categories (
        name,
        slug,
        description,
        is_active,
        display_order
    )
VALUES (
        'Nos plats yéménites',
        'plats-yemenites',
        'أطباق يمنية تقليدية',
        1,
        1
    ),
    (
        'Nos tissus traditionnels yéménites',
        'tissus-yemenites',
        'أقمشة يمنية تقليدية',
        1,
        2
    ),
    (
        'Les soins du corps yéménite',
        'soins-corps',
        'منتجات العناية بالجسم',
        1,
        3
    ),
    (
        'Nos parfums yéménites',
        'parfums-yemenites',
        'عطور يمنية',
        1,
        4
    ),
    (
        'Nos encens yéménites',
        'encens-yemenites',
        'بخور يمني',
        1,
        5
    ),
    (
        'Nos produits sucrés yéménites',
        'produits-sucres',
        'حلويات يمنية',
        1,
        6
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name);
-- إدراج المنتجات
INSERT INTO products (
        name,
        slug,
        description,
        price,
        category_id,
        image_url,
        stock_quantity,
        is_active
    )
VALUES -- Plats yéménites (category_id = 1)
    (
        'Madara Individuelle',
        'madara-individuelle',
        'Plat traditionnel yéménite pour une personne',
        20.83,
        1,
        '/images/products/madara-individuelle.jpg',
        0,
        1
    ),
    (
        'Madara format famille 19-20cm',
        'madara-famille-19-20',
        'Plat familial traditionnel diamètre 19-20cm profondeur 7cm',
        33.33,
        1,
        '/images/products/madara-famille-19.jpg',
        0,
        1
    ),
    (
        'Madara familiale 20-22cm',
        'madara-familiale-20-22',
        'Plat familial traditionnel diamètre 20-22cm profondeur 8cm',
        37.50,
        1,
        '/images/products/madara-famille-22.jpg',
        1,
        1
    ),
    (
        'Jarre en terre cuite',
        'jarre-terre-cuite',
        'Jarre traditionnelle en terre cuite',
        33.33,
        1,
        '/images/products/jarre-terre.jpg',
        1,
        1
    ),
    -- Tissus traditionnels (category_id = 2)
    (
        'Maouaze traditionnelle',
        'maouaze-traditionnelle',
        'Confectionné à la main - tissu traditionnel yéménite',
        29.17,
        2,
        '/images/products/maouaze.jpg',
        1,
        1
    ),
    (
        'Sitare Vêtement traditionnel',
        'sitare-vetement',
        'Vêtement ou nappe traditionnel - Longueur 221cm / Largeur 164cm',
        20.83,
        2,
        '/images/products/sitare.jpg',
        2,
        1
    ),
    (
        'Massone Vêtement traditionnel',
        'massone-vetement',
        'Vêtement ou nappe traditionnel - Longueur 284cm / Largeur 124cm',
        20.83,
        2,
        '/images/products/massone.jpg',
        2,
        1
    ),
    -- Soins du corps (category_id = 3)
    (
        'Savon au Curcuma',
        'savon-curcuma',
        'Savon naturel au curcuma',
        2.50,
        3,
        '/images/products/savon-curcuma.jpg',
        5,
        1
    ),
    (
        'Henné du Yémen 250g',
        'henne-250g',
        'Henné naturel du Yémen 250g',
        3.75,
        3,
        '/images/products/henne-250.jpg',
        10,
        1
    ),
    (
        'Henné du Yémen 125g',
        'henne-125g',
        'Henné naturel du Yémen 125g - حنا يمني',
        2.92,
        3,
        '/images/products/henne-125.jpg',
        8,
        1
    ),
    -- Parfums (category_id = 4)
    (
        'Parfum féminin au Jasmin',
        'parfum-jasmin',
        'Parfum féminin au jasmin',
        32.50,
        4,
        '/images/products/parfum-jasmin.jpg',
        3,
        1
    ),
    (
        'Roz Rana Oud Parfum',
        'roz-rana-oud',
        'Parfum féminin Oud',
        49.17,
        4,
        '/images/products/roz-rana.jpg',
        2,
        1
    ),
    -- Encens (category_id = 5)
    (
        'Louban à mâcher 30g',
        'louban-macher-30g',
        'Chewing Gum naturel - 30 grammes',
        3.33,
        5,
        '/images/products/louban-macher.jpg',
        10,
        1
    ),
    (
        'Louban Dakar 30g',
        'louban-dakar-30g',
        'Encens naturel - 30 grammes',
        3.33,
        5,
        '/images/products/louban-dakar.jpg',
        4,
        1
    ),
    (
        'Encensoir en bois',
        'encensoir-bois',
        'Encensoir traditionnel en bois',
        8.33,
        5,
        '/images/products/encensoir.jpg',
        5,
        1
    ),
    (
        'Al Bakhour de Rana 140g',
        'bakhour-rana-140g',
        'Encens de Rana - 140 grammes',
        25.00,
        5,
        '/images/products/bakhour-rana.jpg',
        3,
        1
    ),
    (
        'Al Bakhour Al Adéni 30g',
        'bakhour-adeni-30g',
        'L\'Encens Adénite - 30 grammes',
        4.17,
        5,
        '/images/products/bakhour-30.jpg',
        4,
        1
    ),
    (
        'Al Bakhour Al Adéni 80g',
        'bakhour-adeni-80g',
        'L\'Encens Adénite - 80 grammes',
        8.33,
        5,
        '/images/products/bakhour-80.jpg',
        4,
        1
    ),
    -- Produits sucrés (category_id = 6)
    (
        'Crème custard',
        'creme-custard',
        'Crème custard yéménite',
        2.84,
        6,
        '/images/products/custard.jpg',
        15,
        1
    ),
    (
        'Crèmes caramels',
        'cremes-caramels',
        'Crèmes caramels yéménites',
        1.40,
        6,
        '/images/products/caramels.jpg',
        20,
        1
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name),
    price =
VALUES(price),
    stock_quantity =
VALUES(stock_quantity);