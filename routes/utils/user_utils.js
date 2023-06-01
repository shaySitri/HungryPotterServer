const DButils = require("./DButils");

function checkID(recipeid)
{
    const re = new RegExp(/OR[0-9]+/);
    let res = re.test(recipeid) || containsOnlyNumbers(recipeid)
    return res;
}

async function markAsFavorite(userid, recipeid){
    if (checkID(recipeid) && containsOnlyNumbers(userid))
    {
        await DButils.execQuery(`insert into favoriterecipes values ('${userid}','${recipeid}')`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}

async function getFavoriteRecipes(userid){
    const recipesid = await DButils.execQuery(`select recipeid from favoriterecipes where userid='${userid}'`);
    return recipesid;
}

async function delFavoriteRecipes(userid, recipeid){

    if (checkID(recipeid) && containsOnlyNumbers(userid))
    {
        await DButils.execQuery(
            `DELETE FROM favoriterecipes WHERE userid='${userid}' and recipeid='${recipeid}';`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
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
    let reciepid = await DButils.execQuery(
        `SELECT COUNT('*') as count FROM userrecipes;`);

    reciepid = reciepid[0].count + 1;
    let recipenewid = "OR" + reciepid
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
        `INSERT INTO userRecipes (userid,recipeId,title,readyInMinutes,image,popularity,vegan,vegetarian,glutenFree,ingredients,instructions,servings) 
        VALUES ('${recipeDeatils.userid}', '${recipenewid}', '${recipeDeatils.title}',
        '${readyInMinutes}', '${recipeDeatils.image}', '${recipeDeatils.popularity}',
        '${recipeDeatils.vegan}', '${recipeDeatils.vegetarian}', '${recipeDeatils.glutenFree}',
        '${recipeDeatils.ingredients}','${recipeDeatils.instructions}','${servings}');`
      );
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipe = addNewRecipe;
exports.containsOnlyNumbers = containsOnlyNumbers;
exports.delFavoriteRecipes = delFavoriteRecipes;