-- إدراج الفئات أولاً
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
-- الحصول على IDs الفئات
SET @cat_plats = (
        SELECT id
        FROM categories
        WHERE slug = 'plats-yemenites'
    );
SET @cat_tissus = (
        SELECT id
        FROM categories
        WHERE slug = 'tissus-yemenites'
    );
SET @cat_soins = (
        SELECT id
        FROM categories
        WHERE slug = 'soins-corps'
    );
SET @cat_parfums = (
        SELECT id
        FROM categories
        WHERE slug = 'parfums-yemenites'
    );
SET @cat_encens = (
        SELECT id
        FROM categories
        WHERE slug = 'encens-yemenites'
    );
SET @cat_sucres = (
        SELECT id
        FROM categories
        WHERE slug = 'produits-sucres'
    );
-- إدراج المنتجات
INSERT INTO products (
        name,
        slug,
        description,
        price,
        category_id,
        image_url,
        stock_quantity,
        is_active,
        created_at
    )
VALUES -- Plats yéménites
    (
        'Madara Individuelle (Pour une personne)',
        'madara-individuelle',
        'Plat traditionnel yéménite pour une personne',
        20.83,
        @cat_plats,
        '/images/products/madara-individuelle.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Madara format famille / diamètre 19-20 cm',
        'madara-format-famille-19-20',
        'Plat familial traditionnel diamètre 19-20cm profondeur 7cm',
        33.33,
        @cat_plats,
        '/images/products/madara-famille-19.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Madara familiale / diamètre 20-22 cm',
        'madara-familiale-20-22',
        'Plat familial traditionnel diamètre 20-22cm profondeur 8cm',
        37.50,
        @cat_plats,
        '/images/products/madara-famille-22.jpg',
        1,
        1,
        NOW()
    ),
    (
        'Jarre en terre cuite',
        'jarre-terre-cuite',
        'Jarre traditionnelle en terre cuite',
        33.33,
        @cat_plats,
        '/images/products/jarre-terre.jpg',
        1,
        1,
        NOW()
    ),
    -- Tissus traditionnels
    (
        'Maouaze traditionnelle',
        'maouaze-traditionnelle',
        'Confectionné à la main - tissu traditionnel yéménite',
        29.17,
        @cat_tissus,
        '/images/products/maouaze.jpg',
        1,
        1,
        NOW()
    ),
    (
        'Sitare / Vêtement traditionnel',
        'sitare-vetement',
        'Vêtement ou nappe traditionnel - Longueur 221cm / Largeur 164cm',
        20.83,
        @cat_tissus,
        '/images/products/sitare.jpg',
        2,
        1,
        NOW()
    ),
    (
        'Massone / Vêtement traditionnel',
        'massone-vetement',
        'Vêtement ou nappe traditionnel - Longueur 284cm / Largeur 124cm',
        20.83,
        @cat_tissus,
        '/images/products/massone.jpg',
        2,
        0,
        NOW()
    ),
    -- Soins du corps
    (
        'Savon au Curcuma',
        'savon-curcuma',
        'Savon naturel au curcuma',
        2.50,
        @cat_soins,
        '/images/products/savon-curcuma.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Henné du Yémen (250 grammes)',
        'henne-250g',
        'Henné naturel du Yémen 250g',
        3.75,
        @cat_soins,
        '/images/products/henne-250.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Henné du Yémen (125 grammes)',
        'henne-125g',
        'Henné naturel du Yémen 125g - حنا يمني',
        2.92,
        @cat_soins,
        '/images/products/henne-125.jpg',
        0,
        1,
        NOW()
    ),
    -- Parfums
    (
        'Parfum féminin au Jasmin',
        'parfum-jasmin',
        'Parfum féminin au jasmin',
        32.50,
        @cat_parfums,
        '/images/products/parfum-jasmin.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Roz Rana / Oud Parfum féminin',
        'roz-rana-oud',
        'Parfum féminin Oud',
        49.17,
        @cat_parfums,
        '/images/products/roz-rana.jpg',
        0,
        0,
        NOW()
    ),
    -- Encens
    (
        'Le Louban à mâcher (30g)',
        'louban-macher-30g',
        'Chewing Gum naturel - 30 grammes',
        3.33,
        @cat_encens,
        '/images/products/louban-macher.jpg',
        10,
        1,
        NOW()
    ),
    (
        'L\'encens naturel Louban Dakar (30g)',
        'louban-dakar-30g',
        'Encens naturel - 30 grammes',
        3.33,
        @cat_encens,
        '/images/products/louban-dakar.jpg',
        4,
        0,
        NOW()
    ),
    (
        'Encensoir en bois',
        'encensoir-bois',
        'Encensoir traditionnel en bois',
        8.33,
        @cat_encens,
        '/images/products/encensoir.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Al Bakhour de Rana (140g)',
        'bakhour-rana-140g',
        'Encens de Rana - 140 grammes',
        25.00,
        @cat_encens,
        '/images/products/bakhour-rana.jpg',
        0,
        0,
        NOW()
    ),
    (
        'Al Bakhour Al Adéni (30g)',
        'bakhour-adeni-30g',
        'L\'Encens Adénite - 30 grammes',
        4.17,
        @cat_encens,
        '/images/products/bakhour-30.jpg',
        4,
        1,
        NOW()
    ),
    (
        'Al Bakhour Al Adéni (80g)',
        'bakhour-adeni-80g',
        'L\'Encens Adénite - 80 grammes',
        8.33,
        @cat_encens,
        '/images/products/bakhour-80.jpg',
        4,
        1,
        NOW()
    ),
    -- Produits sucrés
    (
        'Crème custard',
        'creme-custard',
        'Crème custard yéménite',
        2.84,
        @cat_sucres,
        '/images/products/custard.jpg',
        0,
        1,
        NOW()
    ),
    (
        'Crèmes caramels',
        'cremes-caramels',
        'Crèmes caramels yéménites',
        1.40,
        @cat_sucres,
        '/images/products/caramels.jpg',
        0,
        1,
        NOW()
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name),
    price =
VALUES(price);