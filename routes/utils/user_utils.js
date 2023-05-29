const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}


function isURL(url)
{
    return /\.(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/.test(url);
}
function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }
function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}
async function addNewRecipe(recipeDeatils){

    console.log("typof s:",typeof recipeDeatils.servings,"typeof rim:",recipeDeatils.readyInMinutes)
    if ((containsOnlyNumbers(recipeDeatils.readyInMinutes) != 'true') || (containsOnlyNumbers(recipeDeatils.servings) != 'true'))
    {
        throw { status: 409, message: "Value unvaliable." };
    }
    if ((isURL(recipeDeatils.image) == false) || (isImage(recipeDeatils.image)))
    {
        throw { status: 409, message: "Image unvaliable." };
    }
    if ((typeof recipeDeatils.vegan != "boolean") || (typeof recipeDeatils.vegetarian != "boolean") || (typeof recipeDeatils.glutenFree != "boolean"))
    {
        throw { status: 409, message: "Value boolean unvaliable." };
    }

    // how to check the ingrediants???

    const recipes_id = await DButils.execQuery(
        `INSERT INTO userRecipes (username,recipeId,title,readyInMinutes,image,popularity,vegan,vegetarian,glutenFree,ingredients,instructions,servings) 
        VALUES ('${recipeDeatils.username}', '${recipeDeatils.recipeId}', '${recipeDeatils.title}',
        '${recipeDeatils.readyInMinutes}', '${recipeDeatils.image}', '${recipeDeatils.popularity}',
        '${recipeDeatils.vegan}', '${recipeDeatils.vegetarian}', '${recipeDeatils.glutenFree}',
        '${recipeDeatils.ingredients}','${recipeDeatils.instructions}','${recipeDeatils.servings}');`
      );
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipe = addNewRecipe;