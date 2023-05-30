const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}


function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }
function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}
async function addNewRecipe(recipeDeatils){

    // Input check from the client, parse to int...

    // Ready in minutes (should be an int)
    if (containsOnlyNumbers(recipeDeatils.readyInMinutes, 10) == true)
    {
        readyInMinutes = parseInt(recipeDeatils.readyInMinutes, 10)
    }
    else
    {
        throw { status: 409, message: "Value unvaliable. (Ready in minutes)" };
    }

    // Servings (should be int)
    if (containsOnlyNumbers(recipeDeatils.servings, 10) == true)
    {
        servings = parseInt(recipeDeatils.servings, 10)
    }
    else
    {
        throw { status: 409, message: "Value unvaliable. (Servings)" };
    }
    
    // Image - image url
    if ((isValidUrl(recipeDeatils.image) == false) || (isImage(recipeDeatils.image) == false))
    {
        throw { status: 409, message: "Image unvaliable." };
    }


    // check booleans values
    if ((containsOnlyNumbers(recipeDeatils.vegan) == false) || 
    (containsOnlyNumbers(recipeDeatils.vegetarian) == false) || 
    (containsOnlyNumbers(recipeDeatils.glutenFree) == false))
    {
        throw { status: 409, message: "Value boolean unvaliable." };
    }

    // we save the instructions as long string in the SQL


    // how to check the ingrediants???

    const recipes_id = await DButils.execQuery(
        `INSERT INTO userRecipes (username,recipeId,title,readyInMinutes,image,popularity,vegan,vegetarian,glutenFree,ingredients,instructions,servings) 
        VALUES ('${recipeDeatils.username}', '${recipeDeatils.recipeId}', '${recipeDeatils.title}',
        '${readyInMinutes}', '${recipeDeatils.image}', '${recipeDeatils.popularity}',
        '${recipeDeatils.vegan}', '${recipeDeatils.vegetarian}', '${recipeDeatils.glutenFree}',
        '${recipeDeatils.ingredients}','${recipeDeatils.instructions}','${servings}');`
      );
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipe = addNewRecipe;