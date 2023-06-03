CREATE DATABASE hungry_potter;
USE hungry_potter;
CREATE TABLE users (
    userid INT(255),
    username VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    country VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE userRecipes (
    userid INT(255),
    recipeId VARCHAR(255),
    title VARCHAR(255),
    readyInMinutes INT(255),
    image VARCHAR(255),
    vegan BOOLEAN,
    vegetarian BOOLEAN,
    glutenFree BOOLEAN,
    ingredients VARCHAR(255),
    instructions VARCHAR(255),
    servings INT(255),
    type VARCHAR(255),
    optionalDescription VARCHAR(255)
);

CREATE TABLE favoriteRecipes (
    userid INT(255),
    recipeId VARCHAR(255)
);

CREATE TABLE lastViews(
    userid INT(255),
    recipeid VARCHAR(255)
);

CREATE TABLE prepareMeal(
    userid INT(255),
    recipeid VARCHAR(255),
    orderNum INT(255)
);