-- حذف الفئات القديمة وإضافة الفئات الحقيقية من PrestaShop
TRUNCATE TABLE categories;
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
-- تحديث المنتجات لربطها بالفئات الصحيحة
UPDATE products
SET category_id = 17
WHERE slug LIKE 'madara%'
    OR slug LIKE 'jarre%';
UPDATE products
SET category_id = 19
WHERE slug LIKE 'maouaze%'
    OR slug LIKE 'sitare%'
    OR slug LIKE 'massone%';
UPDATE products
SET category_id = 11
WHERE slug LIKE 'savon%'
    OR slug LIKE 'henne%';
UPDATE products
SET category_id = 16
WHERE slug LIKE 'parfum%'
    OR slug LIKE 'roz-rana%';
UPDATE products
SET category_id = 15
WHERE slug LIKE 'louban%'
    OR slug LIKE 'bakhour%'
    OR slug LIKE 'encensoir%';
UPDATE products
SET category_id = 12
WHERE slug LIKE 'creme%';