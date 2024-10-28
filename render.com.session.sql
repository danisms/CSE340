-- DROP TABLE IF EXISTS public.account;

-- -- Table structure for table `account`
-- CREATE TABLE IF NOT EXISTS public.account (
--     account_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
--     account_firstname character varying NOT NULL,
--     account_lastname character varying NOT NULL,
--     account_photo character varying NOT NULL DEFAULT '\images\account\placeholder\default-avatar-profile-icon.png',
--     account_email character varying NOT NULL,
--     account_password character varying NOT NULL,
--     account_type account_type NOT NULL DEFAULT 'Client'::account_type,
--     CONSTRAINT account_pkey PRIMARY KEY (account_id)
-- );

UPDATE account SET account_type = 'Admin' WHERE account_id = 1;

SELECT * FROM account;

-- DELETE FROM account WHERE account_id > 1;

-- -- INSERT ACCOUNT USERS
-- INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type)
-- VALUES ('Basic', 'Client', 'basic@340.edu', 'I@mABas1cCl!3nt', 'Client'),
-- ('Happy', 'Employee', 'happy@340.edu', 'I@mAnEmpl0y33', 'Employee'),
-- ('Manager', 'User', 'manager@340.edu', 'I@mAnAdm!n1strat0r', 'Admin');