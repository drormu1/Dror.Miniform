CREATE TABLE Forms (
    Id NVARCHAR(255) NOT NULL,
    FormType NVARCHAR(255) NOT NULL,
    [Data] NVARCHAR(MAX) NOT NULL,
	HandledBy NVARCHAR(MAX) NULL,
    HandledAt DateTime NULL,
    [Status] NVARCHAR(MAX) NULL,
    CreatedAt DateTime NOT NULL,
    PRIMARY KEY (Id)
);