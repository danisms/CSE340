-- (1) Insert value into account table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- (2) modify the last entered value account_type
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;
-- (3) Delete the first value in the account table
DELETE FROM public.account
WHERE account_id = 1;
-- (4) update inv_description using postgreSQL replace function
-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
-- (5) Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category
SELECT inv_make,
    inv_model,
    classification_name
FROM inventory
    INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification_name LIKE 'Sport';
-- (6) Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');