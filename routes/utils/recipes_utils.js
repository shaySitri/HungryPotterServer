const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}


async function getRecipeInstructions(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { extendedIngredients ,analyzedInstructions, servings } = recipe_info.data;
    allIng = []
    for (ing in extendedIngredients)
    {
        allIng.push(
            {
                name: ing.name,
                quantity: ing.amount,
                unit: ing.unit
            }
        )
    }
    return {
        ingredients: allIng,
        instructions: analyzedInstructions,
        servings: servings,
    }    
}


exports.getRecipeDetails = getRecipeDetails;



