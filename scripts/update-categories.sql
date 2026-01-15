-- تعطيل فحص Foreign Keys مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;
-- حذف جميع المنتجات أولاً لتجنب مشاكل Foreign Key
DELETE FROM products;
-- حذف الفئات القديمة
DELETE FROM categories;
-- إدراج الفئات الحقيقية من PrestaShop
INSERT INTO categories (
        id,
        name,
        slug,
        description,
        is_active,
        display_order
    )
VALUES (
        12,
        'Nos produits sucrés yéménites',
        'produits-sucres',
        'Produits sucrés traditionnels yéménites',
        1,
        0
    ),
    (
        11,
        'Les soins du corps yéménite',
        'soins-corps',
        'Produits de soins du corps yéménites',
        1,
        1
    ),
    (
        10,
        'Les aliments endémiques yéménites',
        'aliments-endemiques',
        'Aliments traditionnels yéménites',
        1,
        2
    ),
    (
        13,
        'Nos cafés yéménites',
        'cafes-yemenites',
        'Cafés traditionnels du Yémen',
        1,
        3
    ),
    (
        14,
        'Nos Dattes',
        'dattes',
        'Dattes yéménites de qualité',
        1,
        4
    ),
    (
        15,
        'Nos encens yéménites',
        'encens-yemenites',
        'Encens et bakhour traditionnels',
        1,
        5
    ),
    (
        16,
        'Nos parfums yéménites',
        'parfums-yemenites',
        'Parfums traditionnels yéménites',
        1,
        6
    ),
    (
        20,
        'Nos épices yéménites',
        'epices-yemenites',
        'Épices traditionnelles du Yémen',
        1,
        7
    ),
    (
        18,
        'Nos thés yéménites',
        'thes-yemenites',
        'Thés traditionnels yéménites',
        1,
        8
    ),
    (
        17,
        'Nos plats yéménites',
        'plats-yemenites',
        'Plats et ustensiles traditionnels',
        1,
        9
    ),
    (
        24,
        'Vêtements traditionnels et décorations',
        'vetements-decorations',
        'Vêtements traditionnels et décorations yéménites',
        1,
        10
    ),
    (
        19,
        'Nos tissus traditionnels yéménites',
        'tissus-yemenites',
        'Tissus traditionnels yéménites',
        1,
        11
    );
-- إدراج المنتجات مع الفئات الصحيحة
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
VALUES -- Plats yéménites (category_id = 17)
    (
        'Madara Individuelle',
        'madara-individuelle',
        'Plat traditionnel yéménite pour une personne',
        20.83,
        17,
        '/images/products/madara-individuelle.jpg',
        0,
        1
    ),
    (
        'Madara format famille 19-20cm',
        'madara-famille-19-20',
        'Plat familial traditionnel diamètre 19-20cm profondeur 7cm',
        33.33,
        17,
        '/images/products/madara-famille-19.jpg',
        0,
        1
    ),
    (
        'Madara familiale 20-22cm',
        'madara-familiale-20-22',
        'Plat familial traditionnel diamètre 20-22cm profondeur 8cm',
        37.50,
        17,
        '/images/products/madara-famille-22.jpg',
        1,
        1
    ),
    (
        'Jarre en terre cuite',
        'jarre-terre-cuite',
        'Jarre traditionnelle en terre cuite',
        33.33,
        17,
        '/images/products/jarre-terre.jpg',
        1,
        1
    ),
    -- Tissus traditionnels (category_id = 19)
    (
        'Maouaze traditionnelle',
        'maouaze-traditionnelle',
        'Confectionné à la main - tissu traditionnel yéménite',
        29.17,
        19,
        '/images/products/maouaze.jpg',
        1,
        1
    ),
    (
        'Sitare Vêtement traditionnel',
        'sitare-vetement',
        'Vêtement ou nappe traditionnel - Longueur 221cm / Largeur 164cm',
        20.83,
        19,
        '/images/products/sitare.jpg',
        2,
        1
    ),
    (
        'Massone Vêtement traditionnel',
        'massone-vetement',
        'Vêtement ou nappe traditionnel - Longueur 284cm / Largeur 124cm',
        20.83,
        19,
        '/images/products/massone.jpg',
        2,
        1
    ),
    -- Soins du corps (category_id = 11)
    (
        'Savon au Curcuma',
        'savon-curcuma',
        'Savon naturel au curcuma',
        2.50,
        11,
        '/images/products/savon-curcuma.jpg',
        5,
        1
    ),
    (
        'Henné du Yémen 250g',
        'henne-250g',
        'Henné naturel du Yémen 250g',
        3.75,
        11,
        '/images/products/henne-250.jpg',
        10,
        1
    ),
    (
        'Henné du Yémen 125g',
        'henne-125g',
        'Henné naturel du Yémen 125g - حنا يمني',
        2.92,
        11,
        '/images/products/henne-125.jpg',
        8,
        1
    ),
    -- Parfums (category_id = 16)
    (
        'Parfum féminin au Jasmin',
        'parfum-jasmin',
        'Parfum féminin au jasmin',
        32.50,
        16,
        '/images/products/parfum-jasmin.jpg',
        3,
        1
    ),
    (
        'Roz Rana Oud Parfum',
        'roz-rana-oud',
        'Parfum féminin Oud',
        49.17,
        16,
        '/images/products/roz-rana.jpg',
        2,
        1
    ),
    -- Encens (category_id = 15)
    (
        'Louban à mâcher 30g',
        'louban-macher-30g',
        'Chewing Gum naturel - 30 grammes',
        3.33,
        15,
        '/images/products/louban-macher.jpg',
        10,
        1
    ),
    (
        'Louban Dakar 30g',
        'louban-dakar-30g',
        'Encens naturel - 30 grammes',
        3.33,
        15,
        '/images/products/louban-dakar.jpg',
        4,
        1
    ),
    (
        'Encensoir en bois',
        'encensoir-bois',
        'Encensoir traditionnel en bois',
        8.33,
        15,
        '/images/products/encensoir.jpg',
        5,
        1
    ),
    (
        'Al Bakhour de Rana 140g',
        'bakhour-rana-140g',
        'Encens de Rana - 140 grammes',
        25.00,
        15,
        '/images/products/bakhour-rana.jpg',
        3,
        1
    ),
    (
        'Al Bakhour Al Adéni 30g',
        'bakhour-adeni-30g',
        'L\'Encens Adénite - 30 grammes',
        4.17,
        15,
        '/images/products/bakhour-30.jpg',
        4,
        1
    ),
    (
        'Al Bakhour Al Adéni 80g',
        'bakhour-adeni-80g',
        'L\'Encens Adénite - 80 grammes',
        8.33,
        15,
        '/images/products/bakhour-80.jpg',
        4,
        1
    ),
    -- Produits sucrés (category_id = 12)
    (
        'Crème custard',
        'creme-custard',
        'Crème custard yéménite',
        2.84,
        12,
        '/images/products/custard.jpg',
        15,
        1
    ),
    (
        'Crèmes caramels',
        'cremes-caramels',
        'Crèmes caramels yéménites',
        1.40,
        12,
        '/images/products/caramels.jpg',
        20,
        1
    );
-- إعادة تفعيل فحص Foreign Keys
SET FOREIGN_KEY_CHECKS = 1;