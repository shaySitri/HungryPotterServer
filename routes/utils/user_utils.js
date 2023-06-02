const DButils = require("./DButils");

function isFamily(recipeid)
{
    const re = new RegExp(/FA[0-9]+/);
    let res = re.test(recipeid)
    return res;
}
function isPrivate(recipeid)
{
    const re = new RegExp(/OR[0-9]+/);
    let res = re.test(recipeid)
    return res;
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

function containsOnlyLetters(str) {
    const re = new RegExp(/[a-zA-Z ]+/);
    let res = re.test(str)
    return res;

}

function normalString(str) {
    const re = new RegExp(/[0-9a-zA-Z !.,:()%\s]+/);
    let res = re.test(str)
    return res;
}


// This function add API recipes to user favorite.
// Input check - user id is valid (contain only number) - we assume that the user exist (send by the session).
async function markAsFavorite(userid, recipeid){
    if (containsOnlyNumbers(recipeid))
    {
        await DButils.execQuery(`insert into favoriterecipes values ('${userid}','${recipeid}')`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}


// Retrive all the favorite recipes of user.
async function getFavoriteRecipes(userid){
    const recipesid = await DButils.execQuery(`select recipeid from favoriterecipes where userid='${userid}'`);
    return recipesid;
}

// Delete recipe from user favorite.
async function delFavoriteRecipes(userid, recipeid){

    if (containsOnlyNumbers(recipeid))
    {
        await DButils.execQuery(
            `DELETE FROM favoriterecipes WHERE userid='${userid}' and recipeid='${recipeid}';`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}

//  This function add new recipe to DB.
const unit = [ "cups", "tablespoons", "teaspoons", "grams", "ounces", "pounds", "pieces", "slices"]
async function addNewRecipe(recipeDeatils){

    // Input check from the client, parse to int...

    // Ready in minutes (should be an int)
    let reciepid = await DButils.execQuery(
        `SELECT COUNT('*') as count FROM userrecipes;`);

    reciepid = reciepid[0].count + 1;
    let recipenewid;
    console.log(recipeDeatils.type)
    // Create recipe id according to its type.
    if (recipeDeatils.type == "Family")
    {
        recipenewid = "FA" + reciepid
    }
    else if (recipeDeatils.type == "Private")
    {
        recipenewid = "OR" + reciepid
    }
    else
    {
        throw { status: 400, message: "Type unvailable" };
    }


    // Check validty:

    // Rady in minutes
    if (containsOnlyNumbers(recipeDeatils.readyInMinutes, 10) == true)
    {
        readyInMinutes = parseInt(recipeDeatils.readyInMinutes, 10)
    }
    else
    {
        throw { status: 400, message: "Value unvaliable. (Ready in minutes)" };
    }

    // Servings (should be int)
    if (containsOnlyNumbers(recipeDeatils.servings, 10) == true)
    {
        servings = parseInt(recipeDeatils.servings, 10)
    }
    else
    {
        throw { status: 400, message: "Value unvaliable. (Servings)" };
    }
    
    // Image - image url
    if ((isValidUrl(recipeDeatils.image) == false) || (isImage(recipeDeatils.image) == false))
    {
        throw { status: 400, message: "Image unvaliable." };
    }


    // check booleans values
    if ((containsOnlyNumbers(recipeDeatils.vegan) == false) || 
    (containsOnlyNumbers(recipeDeatils.vegetarian) == false) || 
    (containsOnlyNumbers(recipeDeatils.glutenFree) == false))
    {
        throw { status: 400, message: "Value boolean unvaliable." };
    }

    // we save the instructions as long string in the SQL
    let instructions = recipeDeatils.instructions.split('\n')
    let ingrediants = recipeDeatils.ingrediants.split(',')

    for (let i = 0; i < ingrediants.length; i++)
    {
        let ing = allIng[i].split('-');
        if (!containsOnlyLetters(ing[0]) || !containsOnlyNumbers(ing[1]) || !unit.includes(ing[2]) || !normalString(instructions))
        {
            throw { status: 400, message: "Wrong format" };
        }
    }

    const recipes_id = await DButils.execQuery(
        `INSERT INTO userRecipes (userid,recipeId,title,readyInMinutes,image,vegan,vegetarian,glutenFree,ingredients,instructions,servings) 
        VALUES ('${recipeDeatils.userid}', '${recipenewid}', '${recipeDeatils.title}',
        '${readyInMinutes}', '${recipeDeatils.image}',
        '${recipeDeatils.vegan}', '${recipeDeatils.vegetarian}', '${recipeDeatils.glutenFree}',
        '${recipeDeatils.ingredients}','${recipeDeatils.instructions}','${servings}');`
      );
    return recipes_id;
}


// This function get recipeID and return its preview from DB.
async function getRecipesPreviewDB(reciepid){

    const recipesDetails = await DButils.execQuery(`select * from userrecipes where recipeId='${reciepid}'`);
    let preview = 
    {
        id: recipesDetails[0].recipeId,
        title: recipesDetails[0].title,
        readyInMinutes: recipesDetails[0].readyInMinutes,
        image: recipesDetails[0].image,
        popularity: recipesDetails[0].aggregateLikes,
        vegan: recipesDetails[0].vegan,
        vegetarian: recipesDetails[0].vegetarian,
        glutenFree: recipesDetails[0].glutenFree,
    }
    return preview
}

// This function get recipeID and return its full instructions from DB.
async function getRecipesInstructionsDB(reciepid){

    const recipesDetails = await DButils.execQuery(`select * from userrecipes where recipeId='${reciepid}'`);
    let details = 
    {
        ingredients: recipesDetails[0].ingredients, // xx-xx-xx,yy-yy-yy
        servings: recipesDetails[0].servings,
        instructions: recipesDetails[0].instructions    
    }

    // split ingridients: 
    const allIng = details.ingredients.split(',');
    let allIngProperties = []
    for (let i = 0; i < allIng.length; i++)
    {
        // asume data hs been valisated by the server
        let ing = allIng[i].split('-');
        allIngProperties.push(
            {
                name: ing[0],
                quantity: ing[1],
                unit: ing[2]
            }
        )
    }

    let recipeInst = details.instructions.split('\n');

    return {
        ingredients: allIngProperties,
        servings: details.servings,
        instructions: recipeInst
    }
}

// This function check that the requester of the recipe is the one who wrote this.
async function whoWroteMe(recipeid){
    if (isFamily(recipeid) || isPrivate(recipeid))
    {
        const recipeDetails = await DButils.execQuery(`select userid from userrecipes where recipeid='${recipeid}';`);
        if (recipeDetails.length == 0)
        {
            throw { status: 404, message: "Page not exist." };
        }
        return recipeDetails[0].userid;
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}

// This function get user ID and type (family\private), and display to the user all of its recipe from this type.
async function getAllRecipesPreviewDB(userid, type){

    const recipes = await DButils.execQuery(`select recipeId from userrecipes where userid='${userid}'`);
    let allPrev = []
    for (let i = 0; i < recipes.length; i ++)
    {
        if (type == "Private" && isPrivate(recipes[i].recipeId))
        {
            allPrev.push(await getRecipesPreviewDB(recipes[i].recipeId))

        }
        else if (type == "Family" && isFamily(recipes[i].recipeId))
        {
            allPrev.push(await getRecipesPreviewDB(recipes[i].recipeId))
        }
    }
    return allPrev
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipe = addNewRecipe;
exports.containsOnlyNumbers = containsOnlyNumbers;
exports.delFavoriteRecipes = delFavoriteRecipes;
exports.getRecipesPreviewDB = getRecipesPreviewDB;
exports.getRecipesInstructionsDB = getRecipesInstructionsDB;
exports.whoWroteMe = whoWroteMe;
exports.getAllRecipesPreviewDB = getAllRecipesPreviewDB;
exports.isFamily = isFamily;
exports.isPrivate = isPrivate;