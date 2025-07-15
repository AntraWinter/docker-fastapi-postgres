CREATE TABLE Defects (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    defect_description TEXT,
    defect_category VARCHAR(50),
    elimination_method VARCHAR(255),
    photo BYTEA,
    tag_link TEXT
);
