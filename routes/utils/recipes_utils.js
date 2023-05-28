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

    let { extendedIngredients, analyzedInstructions, servings } = recipe_info.data;
    let allIng = []
    let inst = []

    for (let i = 0; i < extendedIngredients.length; i++) {
        allIng.push(
            {
                name: extendedIngredients[i].name,
                quantity: extendedIngredients[i].amount,
                unit: extendedIngredients[i].unit
            }
        )
      }

    //  what to do if there is no instructions????
    if (analyzedInstructions = [])
    {
        inst = ['No Instructions Found.']
    }
    else 
    {
        for (let i = 0; i < analyzedInstructions[0].steps.length; i++) {
            obj =  analyzedInstructions[0].steps[i]
            inst.push(obj.step)
        }
    }
    

    return {
        ingredients: allIng,
        servings: servings,
        instructions: inst
    }
}

async function getSearchResultApi(query) {
    let paramsQ = {}
    if (query.query != "")
    {
        paramsQ[query] = query.query;
    }
    else
    {
        throw { status: 404, message: "Search cannot be empty." };
    }
    if (query.cuisine != "")
    {
        paramsQ[cuisine] = query.cuisine;
    }
    if (query.diet != "")
    {
        paramsQ[diet] = query.diet;
    }
    if (query.intolerance != "")
    {
        paramsQ[intolerance] = query.intolerance;
    }
    if (query.sort != "")
    {
        paramsQ[sort] = query.sort;
    }
    if (query.number != 5)
    {
        paramsQ[number] = query.number;
    }
    else
    {
        paramsQ[number] = 5;
    }

    paramsQ[apiKey] =  process.env.spooncular_apiKey;
    return await axios.get(`${api_domain}/complexSearch`, 
    { params : { paramsQ  } }
    );
}
async function getSearchResult(query) {
    let recipesResult = await getSearchResultApi(query);
    let { allRes } = recipesResult.data;
    
    return {
        recipesResult
    }
}



exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeInstructions = getRecipeInstructions;
exports.getSearchResult = getSearchResult;



