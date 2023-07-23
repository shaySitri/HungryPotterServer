const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

// -----------------------------------------------------------------
// --------------------- VALIDATION FUNCTIONS ----------------------

// This check if recipeId exist on DB.
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

// This function get recipeid and check if the recipe exist (DB or API)
async function recipeExist(recipeid, userid)
{

    if (isFamily(recipeid) || isPrivate(recipeid))
    {
        const re = await DButils.execQuery(`select recipeid from userrecipes where recipeId='${recipeid}'`);

        return re.length > 0;
    }
    else
    {
        try
        {
            const re = await recipes_utils.getRecipeDetails(recipeid, userid)
            return re.id == recipeid    
        }
        catch(error)
        {
            throw { status: 404, message: "Unvalid userid or recipeid." };
        }
    }

    
}


// This check if string represent url.
function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

// This check if url is from tyoe image.
function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  // This check if string contains numbers only,
function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}
  // This check if string contains letters only,
function containsOnlyLetters(str) {
    const re = new RegExp(/[a-zA-Z ]+/);
    let res = re.test(str)
    return res;

}
  // This check if string doesnt contain special charcters like: @#$^&,
function normalString(str) {
    const re = new RegExp(/[0-9a-zA-Z !.,:()% ]+/);
    let res = re.test(str)
    return res;
}

// -----------------------------------------------------------------
// --------------------------- FAVORITES ----------------------------

// This function add API recipes to user favorite.
// Input check - user id is valid (contain only number) - we assume that the user exist (send by the session).
async function markAsFavorite(userid, recipeid){
    const exist = await recipeExist(recipeid)
    await DButils.execQuery(`DELETE FROM favoriterecipes WHERE userid='${userid}' and recipeId='${recipeid}';`);
    if (exist)
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

// -----------------------------------------------------------------
// ----------------------- ADD NEW RECIPES ------------------------

// list of possible units of ingrediants.
const unit = [ "cups", "tablespoons", "teaspoons", "grams", "ounces", "pounds", "pieces", "slices"]

// This function retuen possible unit to use.
function getUnits()
{
    return unit;
}

//  This function add new recipe to DB.
async function addNewRecipe(recipeDeatils){

    // create recipe id:
    let reciepid = await DButils.execQuery(
        `SELECT COUNT('*') as count FROM userrecipes;`);
        reciepid = reciepid[0].count + 1;
    let recipenewid, optional;
    // Create recipe id according to its type.
    if (recipeDeatils.type == "Family")
    {
        recipenewid = "FA" + reciepid
        optional = recipeDeatils.optionalDescription;
    }
    else if (recipeDeatils.type == "Private")
    {
        recipenewid = "OR" + reciepid
        optional = "x"
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
    // example to instructions: step1^step2^step3
    let instructions = recipeDeatils.instructions.split('^') 
    
    // all ingrediants sperated by ,
    // example to ingrediants: sugar-5-cups,milk-2-spoons
    let ingrediants = splitIngredients(recipeDeatils.ingredients)
    for (let i = 0; i < ingrediants.length; i++)
    {
        
        if (!containsOnlyLetters(ingrediants[i].name) || !containsOnlyNumbers(ingrediants[i].quantity) || !unit.includes(ingrediants[i].unit))
        {
            throw { status: 400, message: "Wrong format (ingredients)" };
        }
    }

    if (!normalString(instructions))
    {
        throw { status: 400, message: "Wrong format (instructions)" };
    }
    if( !normalString(optional))
    {
        throw { status: 400, message: "Wrong format (descriptions)" };
    }
    const recipes_id = await DButils.execQuery(
        `INSERT INTO userRecipes (userid,recipeId,title,readyInMinutes,image,vegan,vegetarian,glutenFree,ingredients,instructions,servings,optionalDescription) 
        VALUES ('${recipeDeatils.userid}', '${recipenewid}', '${recipeDeatils.title}', '${readyInMinutes}', '${recipeDeatils.image}', '${recipeDeatils.vegan}', '${recipeDeatils.vegetarian}', '${recipeDeatils.glutenFree}','${recipeDeatils.ingredients}','${recipeDeatils.instructions}','${recipeDeatils.servings}','${optional}');`
      );


    return recipes_id;
}

// -----------------------------------------------------------------
// ------------------------ DISPLAY RECIPES ------------------------

// This function get recipeID and return its preview from DB.
async function getRecipesPreviewDB(reciepid,user_id){
    let watched = false;
    if (user_id != undefined){
        await DButils.execQuery("SELECT userid FROM users").then((users) => {
            usersid = users.map(user => user.userid); })
            if (usersid.includes(user_id)) {
                const allWatched = await DButils.execQuery(`SELECT * FROM lastviews where (userid='${user_id}' and recipeid='${reciepid}');`);
                watched = allWatched.length > 0
            }
    }
    // validity check 
    const exist = await recipeExist(reciepid)
    if (exist)
    {
        const recipesDetails = await DButils.execQuery(`select * from userrecipes where recipeId='${reciepid}'`);
        let preview = 
        {
            id: recipesDetails[0].recipeId,
            title: recipesDetails[0].title,
            readyInMinutes: recipesDetails[0].readyInMinutes,
            image: recipesDetails[0].image,
            vegan: recipesDetails[0].vegan,
            vegetarian: recipesDetails[0].vegetarian,
            glutenFree: recipesDetails[0].glutenFree,
            watched:watched,
        }
        return preview
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}
// -----------------------------------------------------------------


function splitIngredients(ingredients){
    // split ingridients:
    const allIng = ingredients.split(',');
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
    return allIngProperties;
}


// This function get recipeID and return its full instructions from DB.
async function getRecipesInstructionsDB(reciepid){

    // validity check.
    const exist = await recipeExist(reciepid)
    if (exist)
    {    
        const recipesDetails = await DButils.execQuery(`select * from userrecipes where recipeId='${reciepid}'`);
        let details = 
        {
            ingredients: recipesDetails[0].ingredients, // xx-xx-xx,yy-yy-yy
            servings: recipesDetails[0].servings,
            instructions: recipesDetails[0].instructions ,
        }
        
        // spliting the ingredients and instructions according to the stracture we desiced.
        let allIngProperties = splitIngredients(details.ingredients);
        let recipeInst = details.instructions.split('^');

        return {
            ingredients: allIngProperties,
            servings: details.servings,
            instructions: recipeInst,
            optional: recipesDetails[0].optionalDescription
        }
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}
// -----------------------------------------------------------------
// This function check that the requester of the recipe is the one who wrote this.
async function whoWroteMe(recipeid){
    // validity check 
    const exist = await recipeExist(recipeid)
    if (exist)
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
// -----------------------------------------------------------------
// This function get user ID and type (family\private), and display to the user all of its recipe from this type.
async function getAllRecipesPreviewDB(userid, type){

    const recipes = await DButils.execQuery(`select recipeId from userrecipes where userid='${userid}'`);
    let allPrev = []
    for (let i = 0; i < recipes.length; i ++)
    {
        // validity check 
        if (type == "Private" && isPrivate(recipes[i].recipeId))
        {
            allPrev.push(await getRecipesPreviewDB(recipes[i].recipeId,userid))
        }
        else if (type == "Family" && isFamily(recipes[i].recipeId))
        {
            allPrev.push(await getRecipesPreviewDB(recipes[i].recipeId,userid))
        }
    }
    return allPrev
}


// -----------------------------------------------------------------
// -------------------------- WATCH LIST ---------------------------

// This function update the last recipes user wtached (both DB and API)
async function markAsWatched(userid, recipeid){
    // is recipe id is valid and not contain some malicious code.
    const exist = await recipeExist(recipeid, userid)
    if (exist) 
    {
        const specificRecipe = await DButils.execQuery(`select * from lastviews where userid='${userid}' and recipeid='${recipeid}';`);
        if (specificRecipe.length != 0)
        {
            await deleteFromLastViews(userid, recipeid)
        }

        await DButils.execQuery(`insert into lastviews values ('${userid}','${recipeid}');`);
        const row = await DButils.execQuery(`select * from lastviews where userid='${userid}' and recipeid='${recipeid}';`);

    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}

// -----------------------------------------------------------------

// This function delete recipeid from watch-list of userid.
async function deleteFromLastViews(userid, recipeid){
    const exist = await recipeExist(recipeid)
    if (exist) 
    {
        const res = await DButils.execQuery(`DELETE FROM lastviews WHERE userid='${userid}' AND recipeid='${recipeid}';`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}
// -----------------------------------------------------------------

// This function return the last recipes id that have been watched by logged-in user.
async function getLastWatchedRecipes(userid){

    // we assume that user-id validate (send with the cookie)
    const allWatchedRecipes = await DButils.execQuery(`select recipeid from lastviews where userid='${userid}';`);
    return allWatchedRecipes;
}
// -----------------------------------------------------------------
// ------------------------------- BONUS ---------------------------


// This function add recipes to user prepared meal.
// Input check - user id is valid (contain only number) - we assume that the user exist (send by the session).
async function wantToPrepare(userid, recipeid){
    const exist = await recipeExist(recipeid)
    if (exist) 
    {
        const doesRecipeExist = await DButils.execQuery(
            `SELECT * FROM preparemeal where (userid='${userid}' and recipeid='${recipeid}');`);
        if (doesRecipeExist.length == 0)
        {
            // create order num
            let orderNum = await DButils.execQuery(
                `SELECT COUNT('*') as count FROM preparemeal where userid='${userid}';`);

            orderNum = orderNum[0].count + 1;
            
            await DButils.execQuery(`insert into preparemeal (userid,recipeid,orderNum) values ('${userid}','${recipeid}','${orderNum}')`);
        }
        else
        {
            throw { status: 304, message: "User already added the rexipe to 'prepare meal'." };
        }
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}
// -----------------------------------------------------------------

// This function delete recipe from prepare-meal list.
async function dontWantToPrepare(userid, recipeid)
{
    const exist = await recipeExist(reciepid)
    if (exist) 
    {
        await DButils.execQuery(
            `DELETE FROM preparemeal where userid='${userid}' and recipeid='${recipeid}';`);
        const res3 = await DButils.execQuery(
                `SELECT * FROM preparemeal;`);
    }
    else
    {
        throw { status: 404, message: "Unvalid userid or recipeid." };
    }
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addNewRecipe = addNewRecipe;
exports.containsOnlyNumbers = containsOnlyNumbers;
exports.getRecipesPreviewDB = getRecipesPreviewDB;
exports.getRecipesInstructionsDB = getRecipesInstructionsDB;
exports.whoWroteMe = whoWroteMe;
exports.getAllRecipesPreviewDB = getAllRecipesPreviewDB;
exports.isFamily = isFamily;
exports.isPrivate = isPrivate;
exports.markAsWatched = markAsWatched;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
exports.wantToPrepare = wantToPrepare;
exports.dontWantToPrepare = dontWantToPrepare;
exports.getUnits = getUnits;