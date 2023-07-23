const axios = require("axios");
const DButils = require("./DButils");
const user_utils = require("./user_utils");
const { NText } = require("mssql");

const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

// This function get recipe id and return its information from API.
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}


// This funcrion parse the information and return recipe preview.
async function getRecipeDetails(recipe_id, user_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
    let favorite = false;
    let watched = false;
    if (user_id != undefined){
        await DButils.execQuery("SELECT userid FROM users").then((users) => {
            usersid = users.map(user => user.userid); })
            if (usersid.includes(user_id)) {
                const allFavorites = await DButils.execQuery(`SELECT * FROM favoriterecipes where (userid='${user_id}' and recipeId='${recipe_id}');`);
                favorite = allFavorites.length > 0
                const allWatched = await DButils.execQuery(`SELECT * FROM lastviews where (userid='${user_id}' and recipeid='${recipe_id}');`);
                watched = allWatched.length > 0
            }
    }
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        favorite: favorite,
        watched: watched,
    }
}

// This function get recipe id and return its information from API.
async function getRecipeInstructionsApi(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
        params: {
            stepBreakdown: true,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// This funcrion parse the some of the information and the analyzed instructions and return its full recipe details.
async function getRecipeInstructions(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);

    let { extendedIngredients, servings } = recipe_info.data;

    let analyzedInstructions = await getRecipeInstructionsApi(recipe_id);
    let allIng = []
    let inst = []

    // parse ingredients in our API form.
    for (let i = 0; i < extendedIngredients.length; i++) {
        allIng.push(
            {
                name: extendedIngredients[i].name,
                quantity: extendedIngredients[i].amount,
                unit: extendedIngredients[i].unit
            }
        )
      }
    
    // parse analyzed instruction into steps
    for (let i = 0; i < analyzedInstructions.data.length; i++) {
        obj =  analyzedInstructions.data[i];
        for (let j = 0; j < obj.steps.length; j++)
        {
            inst.push(obj.steps[j].step)
        }
    }   
    
    return {
        ingredients: allIng,
        servings: servings,
        instructions: inst
    }
}

// BONUS - get the full information from analyzed instructions.
async function getAnalyzedInstructions(recipe_id) {

    let analyzedInstructions = await getRecipeInstructionsApi(recipe_id);
    let inst = []
    
    for (let i = 0; i < analyzedInstructions.data.length; i++) {
        obj =  analyzedInstructions.data[i];
        for (let j = 0; j < obj.steps.length; j++)
        {
            inst.push(obj.steps[j])
        }
    }   
    

    return inst;
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeInstructions = getRecipeInstructions;
exports.getAnalyzedInstructions = getAnalyzedInstructions;